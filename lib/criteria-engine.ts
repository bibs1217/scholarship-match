/**
 * Deterministic criteria evaluation engine.
 * Called by the AI matching agent as a tool — the AI never overrides these results.
 */
import {
  CriteriaSchema,
  ApplicationForEval,
  EvaluationResult,
  CriterionResult,
  Criterion,
} from '@/types/scholarship-criteria'

const INCOME_ORDER = ['very_low', 'low', 'moderate', 'middle', 'upper_middle', 'high']

function evaluateSingleCriterion(
  criterion: Criterion,
  app: ApplicationForEval
): CriterionResult {
  const field = criterion.field

  // ── Boolean fields ─────────────────────────────────────────────────────────
  if (
    criterion.field === 'is_first_generation' ||
    criterion.field === 'is_first_time_in_college' ||
    criterion.field === 'is_national_merit_finalist' ||
    criterion.field === 'is_veteran_or_dependent' ||
    criterion.field === 'has_disability_documentation' ||
    criterion.field === 'fafsa_on_file' ||
    criterion.field === 'ffaa_on_file'
  ) {
    const actual = app[criterion.field]
    if (actual == null) {
      return { field, passed: false, reason: `${field} not provided`, missing_data: true }
    }
    const passed = actual === criterion.value
    return {
      field,
      passed,
      reason: passed
        ? `${field} is ${actual} (required: ${criterion.value})`
        : `${field} is ${actual} but required ${criterion.value}`,
      missing_data: false,
    }
  }

  // ── GPA / numeric fields ───────────────────────────────────────────────────
  if (
    criterion.field === 'gpa_unweighted' ||
    criterion.field === 'gpa_weighted' ||
    criterion.field === 'sat_score' ||
    criterion.field === 'act_score' ||
    criterion.field === 'community_service_hours'
  ) {
    const actual = app[criterion.field as keyof ApplicationForEval] as number | null | undefined
    if (actual == null) {
      return { field, passed: false, reason: `${field} not provided`, missing_data: true }
    }
    const passed =
      criterion.operator === 'gte' ? actual >= criterion.value : actual <= criterion.value
    return {
      field,
      passed,
      reason: `${field} is ${actual} (required ${criterion.operator} ${criterion.value})`,
      missing_data: false,
    }
  }

  // ── Residency state ────────────────────────────────────────────────────────
  if (criterion.field === 'residency_state') {
    const actual = app.residency_state
    if (!actual) {
      return { field, passed: false, reason: 'residency_state not provided', missing_data: true }
    }
    const passed = criterion.value.includes(actual)
    return {
      field,
      passed,
      reason: passed
        ? `Residency state ${actual} is in [${criterion.value.join(', ')}]`
        : `Residency state ${actual} not in required [${criterion.value.join(', ')}]`,
      missing_data: false,
    }
  }

  // ── Degree level ───────────────────────────────────────────────────────────
  if (criterion.field === 'degree_level') {
    const actual = app.degree_level
    if (!actual) {
      return { field, passed: false, reason: 'degree_level not provided', missing_data: true }
    }
    const passed = criterion.value.includes(actual as any)
    return {
      field,
      passed,
      reason: passed
        ? `Degree level ${actual} is in [${criterion.value.join(', ')}]`
        : `Degree level ${actual} not in required [${criterion.value.join(', ')}]`,
      missing_data: false,
    }
  }

  // ── Intended major ─────────────────────────────────────────────────────────
  if (criterion.field === 'intended_major') {
    const actual = app.intended_major
    if (!actual) {
      return { field, passed: false, reason: 'intended_major not provided', missing_data: true }
    }
    const inList = criterion.value.some(
      (m) => m.toLowerCase() === actual.toLowerCase()
    )
    const passed = criterion.operator === 'in' ? inList : !inList
    return {
      field,
      passed,
      reason: `Major "${actual}" ${passed ? 'meets' : 'does not meet'} requirement (${criterion.operator} [${criterion.value.join(', ')}])`,
      missing_data: false,
    }
  }

  // ── Income bracket ─────────────────────────────────────────────────────────
  if (criterion.field === 'household_income_bracket') {
    const actual = app.household_income_bracket
    if (!actual) {
      return { field, passed: false, reason: 'household_income_bracket not provided', missing_data: true }
    }
    const actualIdx = INCOME_ORDER.indexOf(actual)
    const requiredIdx = INCOME_ORDER.indexOf(criterion.value)
    if (actualIdx === -1 || requiredIdx === -1) {
      return { field, passed: false, reason: `Unknown income bracket value`, missing_data: false }
    }
    const passed = actualIdx <= requiredIdx
    return {
      field,
      passed,
      reason: `Income bracket "${actual}" is ${passed ? 'at or below' : 'above'} required ceiling "${criterion.value}"`,
      missing_data: false,
    }
  }

  // ── Custom text match ──────────────────────────────────────────────────────
  if (criterion.field === 'custom_text_match') {
    const sourceField = criterion.source_field as keyof ApplicationForEval
    const text = app[sourceField] as string | null | undefined
    if (!text) {
      return { field, passed: false, reason: `Source field ${criterion.source_field} is empty`, missing_data: true }
    }
    const passed = text.toLowerCase().includes(criterion.value.toLowerCase())
    return {
      field,
      passed,
      reason: `"${criterion.value}" ${passed ? 'found' : 'not found'} in ${criterion.source_field}`,
      missing_data: false,
    }
  }

  return { field, passed: false, reason: `Unknown criterion field: ${field}`, missing_data: false }
}

export function evaluateCriteria(
  schema: CriteriaSchema,
  application: ApplicationForEval
): EvaluationResult {
  const perCriterionResults = schema.criteria.map((c) =>
    evaluateSingleCriterion(c, application)
  )

  const passed =
    schema.match_logic === 'all'
      ? perCriterionResults.every((r) => r.passed)
      : perCriterionResults.some((r) => r.passed)

  return { passed, perCriterionResults }
}
