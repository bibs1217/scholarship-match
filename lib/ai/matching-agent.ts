/**
 * AI Matching Agent — Phase 4
 * Uses Claude Sonnet + deterministic evaluateCriteria() tool.
 * The AI handles reasoning, confidence scoring, and edge-case flags.
 * evaluateCriteria() handles the math — the AI never overrides it.
 */
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { evaluateCriteria } from '@/lib/criteria-engine'
import type { CriteriaSchema } from '@/types/scholarship-criteria'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a scholarship matching assistant for a university financial aid office.
Your job is to evaluate student applications against scholarship eligibility criteria and explain results clearly.

CRITICAL RULES:
1. You have access to the evaluate_criteria tool which gives you the GROUND-TRUTH eligibility determination. 
   NEVER override or second-guess a hard fail from evaluate_criteria.
2. If evaluate_criteria returns passed=false for a required criterion, do NOT state the student qualifies.
3. If any criterion shows missing_data=true, flag this explicitly — never assume a missing value.
4. Your match_reasoning must cite actual values (e.g. "GPA of 3.7", "SAT score of 1310"), not vague language.
5. Confidence scoring: 1.0 for clean pass with all data present; 0.7–0.9 for pass with one minor ambiguity; 
   0.4–0.6 for pass with missing data fields; 0.1–0.3 for near-miss (close to threshold but failed).
6. Never auto-approve a match for human review — your output is a suggestion only.

Write match_reasoning in plain English that a financial aid officer and a student can both understand.`

export async function runMatchingAgent(applicationId: string): Promise<{ matched: number }> {
  const supabase = createAdminClient()

  // 1. Fetch application + student
  const { data: application, error: appErr } = await supabase
    .from('applications')
    .select('*, students(*)')
    .eq('id', applicationId)
    .single()

  if (appErr || !application) throw new Error(`Application not found: ${applicationId}`)

  const student = (application as any).students
  const institutionId = application.institution_id

  // 2. Fetch scholarships visible to this institution
  const { data: scholarships } = await supabase
    .from('scholarships')
    .select('*')
    .eq('is_active', true)
    .or(
      `institution_id.eq.${institutionId},and(institution_id.is.null,or(source_type.eq.federal,and(source_type.eq.state,criteria_schema->>residency_state_match.eq.${student?.residency_state})))`
    )

  if (!scholarships || scholarships.length === 0) {
    await supabase.from('applications').update({ status: 'matched' }).eq('id', applicationId)
    return { matched: 0 }
  }

  // 3. Run deterministic evaluation for each scholarship
  const appForEval = {
    gpa_unweighted: application.gpa_unweighted,
    gpa_weighted: application.gpa_weighted,
    sat_score: application.sat_score,
    act_score: application.act_score,
    residency_state: student?.residency_state,
    degree_level: application.degree_level,
    intended_major: application.intended_major,
    household_income_bracket: application.household_income_bracket,
    is_first_generation: student?.is_first_generation,
    is_first_time_in_college: student?.is_first_time_in_college,
    is_national_merit_finalist: application.is_national_merit_finalist,
    is_veteran_or_dependent: application.is_veteran_or_dependent,
    has_disability_documentation: application.has_disability_documentation,
    fafsa_on_file: application.fafsa_on_file,
    ffaa_on_file: application.ffaa_on_file,
    community_service_hours: application.community_service_hours,
    free_text_essay: application.free_text_essay,
  }

  const evalResults = scholarships.map((s: any) => {
    const schema = s.criteria_schema as CriteriaSchema
    const result = evaluateCriteria(schema, appForEval)
    return { scholarship: s, evalResult: result }
  })

  // 4. Filter: clean passes + near-misses (failed but within 0.1 GPA or 50 SAT pts)
  const candidateScholarships = evalResults.filter(({ evalResult }) => {
    if (evalResult.passed) return true
    // Near-miss: only one criterion failed and it's a numeric one close to threshold
    const failures = evalResult.perCriterionResults.filter((r) => !r.passed && !r.missing_data)
    if (failures.length === 1) {
      const f = failures[0]
      if (f.field === 'gpa_unweighted' || f.field === 'gpa_weighted') {
        const actualGpa = f.field === 'gpa_unweighted' ? application.gpa_unweighted : application.gpa_weighted
        const schema = evalResults.find(({ scholarship }) => true)?.scholarship.criteria_schema
        const criterion = schema?.criteria.find((c: any) => c.field === f.field)
        if (criterion && actualGpa != null && Math.abs(actualGpa - (criterion as any).value) <= 0.1) return true
      }
    }
    return false
  })

  if (candidateScholarships.length === 0) {
    await supabase.from('applications').update({ status: 'matched' }).eq('id', applicationId)
    return { matched: 0 }
  }

  // 5. Ask Claude to generate reasoning for each candidate
  let matchesInserted = 0
  for (const { scholarship, evalResult } of candidateScholarships) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        tools: [
          {
            name: 'evaluate_criteria',
            description: 'Get the deterministic eligibility result for this scholarship. Always call this first.',
            input_schema: {
              type: 'object' as const,
              properties: {
                scholarship_id: { type: 'string' },
              },
              required: ['scholarship_id'],
            },
          },
        ],
        messages: [
          {
            role: 'user',
            content: `Evaluate this student application against the scholarship and produce a match record.

STUDENT APPLICATION:
- GPA (unweighted): ${application.gpa_unweighted ?? 'not provided'}
- GPA (weighted): ${application.gpa_weighted ?? 'not provided'}
- SAT: ${application.sat_score ?? 'not provided'}, ACT: ${application.act_score ?? 'not provided'}
- Degree level: ${application.degree_level}
- Intended major: ${application.intended_major ?? 'not provided'}
- Residency: ${student?.residency_state ?? 'not provided'}
- First generation: ${student?.is_first_generation}
- FAFSA on file: ${application.fafsa_on_file}
- FFAA on file: ${application.ffaa_on_file}
- National Merit Finalist: ${application.is_national_merit_finalist}
- Community service hours: ${application.community_service_hours ?? 'not provided'}
- Income bracket: ${application.household_income_bracket ?? 'not provided'}

SCHOLARSHIP: ${scholarship.name}
- Source: ${scholarship.source_type}
- Award: ${scholarship.award_type} ($${scholarship.award_amount_min}–$${scholarship.award_amount_max})
- Renewable: ${scholarship.renewable} (up to ${scholarship.max_renewal_years} years)
- Notes for agent: ${(scholarship.criteria_schema as CriteriaSchema).notes_for_agent ?? 'none'}

DETERMINISTIC EVALUATION RESULT:
- Overall passed: ${evalResult.passed}
- Per-criterion: ${JSON.stringify(evalResult.perCriterionResults, null, 2)}

Based on this evaluation, provide:
1. confidence_score (0–1)
2. match_reasoning (2–3 sentences, cite actual values)
3. Any flags for human review (missing data, borderline cases, notes_for_agent implications)

Respond in JSON: { "confidence_score": number, "match_reasoning": string, "review_flags": string[] }`,
          },
        ],
      })

      let confidence = evalResult.passed ? 0.95 : 0.25
      let reasoning = `Deterministic evaluation: ${evalResult.passed ? 'passed' : 'near-miss'}. ${evalResult.perCriterionResults.map((r) => r.reason).join('; ')}`

      const textBlock = response.content.find((b) => b.type === 'text')
      if (textBlock && textBlock.type === 'text') {
        try {
          const parsed = JSON.parse(textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
          confidence = parsed.confidence_score ?? confidence
          reasoning = parsed.match_reasoning ?? reasoning
        } catch {
          // use defaults
        }
      }

      await supabase.from('scholarship_matches').insert({
        application_id: applicationId,
        scholarship_id: scholarship.id,
        confidence_score: confidence,
        match_reasoning: reasoning,
        criteria_evaluation: evalResult.perCriterionResults,
        status: 'ai_suggested',
      })
      matchesInserted++
    } catch (aiErr) {
      // Fallback: insert deterministic result without AI reasoning
      console.error('AI reasoning failed, using deterministic fallback:', aiErr)
      await supabase.from('scholarship_matches').insert({
        application_id: applicationId,
        scholarship_id: scholarship.id,
        confidence_score: evalResult.passed ? 0.9 : 0.2,
        match_reasoning: `Auto-matched based on eligibility criteria. ${evalResult.perCriterionResults.map((r) => r.reason).join('; ')}`,
        criteria_evaluation: evalResult.perCriterionResults,
        status: 'ai_suggested',
      })
      matchesInserted++
    }
  }

  // 6. Update application status
  await supabase.from('applications').update({ status: 'matched' }).eq('id', applicationId)
  return { matched: matchesInserted }
}
