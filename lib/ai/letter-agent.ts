/**
 * Letter Generation Agent — Phase 5
 * Generates formal eligibility letters for staff-approved matches.
 * Two-step approval: match approval → letter draft → letter approval → send.
 */
import Anthropic from '@anthropic-ai/sdk'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { createAdminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const LETTER_SYSTEM_PROMPT = `You are a financial aid letter writer for a university.
Generate a formal, professional eligibility letter for a student who has been approved for a scholarship.

RULES:
1. Never state an award amount more precisely than the min–max range supports.
   If award_amount_min === award_amount_max, you may state the exact amount.
2. Never promise renewal without explicitly listing the renewal criteria.
3. Cite the specific criteria the student met (actual GPA values, scores, etc.) — no generic boilerplate.
4. Keep a warm but professional tone appropriate for official university correspondence.
5. In the "internal_notes" field (NOT shown to student), flag anything ambiguous the reviewer should verify.

Respond with JSON:
{
  "letter_body": "full letter text with \\n for line breaks",
  "internal_notes": "flags for the human reviewer, or empty string"
}`

export async function generateEligibilityLetter(matchId: string): Promise<string> {
  const supabase = createAdminClient()

  // Fetch match, application, student, scholarship, institution
  const { data: match } = await supabase
    .from('scholarship_matches')
    .select(`
      *,
      applications(*, students(*)),
      scholarships(*, institutions(*))
    `)
    .eq('id', matchId)
    .eq('status', 'staff_approved')
    .single()

  if (!match) throw new Error(`Match ${matchId} not found or not staff_approved`)

  const application = (match as any).applications
  const student = application?.students
  const scholarship = (match as any).scholarships
  const institution = scholarship?.institutions

  const awardRange =
    scholarship.award_amount_min === scholarship.award_amount_max
      ? `$${scholarship.award_amount_min?.toLocaleString()}`
      : `$${scholarship.award_amount_min?.toLocaleString()} – $${scholarship.award_amount_max?.toLocaleString()}`

  const renewalText = scholarship.renewable
    ? `This scholarship is renewable for up to ${scholarship.max_renewal_years} year(s) subject to satisfactory academic progress.`
    : 'This is a one-time, non-renewable award.'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: LETTER_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate an eligibility letter for:

INSTITUTION: ${institution?.name ?? 'The Institution'}
STUDENT: ${student?.full_name} (${student?.email})
SCHOLARSHIP: ${scholarship.name}
AWARD: ${awardRange} (${scholarship.award_type})
${renewalText}

BASIS FOR ELIGIBILITY (from match evaluation):
${match.match_reasoning}

Per-criterion results:
${JSON.stringify(match.criteria_evaluation, null, 2)}

Required next steps / documents still needed:
${(scholarship.criteria_schema?.required_documents ?? []).join(', ') || 'None listed'}

Academic year: ${application?.academic_year}
Application deadline: ${scholarship.application_deadline ?? 'See financial aid office'}`,
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('No text response from AI')

  let letterBody = ''
  let internalNotes = ''

  try {
    const parsed = JSON.parse(textBlock.text.replace(/```json\n?/g, '').replace(/```\n?/g, ''))
    letterBody = parsed.letter_body
    internalNotes = parsed.internal_notes
  } catch {
    letterBody = textBlock.text
  }

  // Generate PDF
  const pdfBytes = await generateLetterPDF(letterBody, institution?.name, institution?.logo_url)
  const pdfPath = `eligibility-letters/${institution?.id}/${application?.id}/${matchId}.pdf`

  // Upload to Supabase Storage
  await supabase.storage
    .from('letters')
    .upload(pdfPath, Buffer.from(pdfBytes), { contentType: 'application/pdf', upsert: true })

  // Insert letter record
  const { data: letter } = await supabase
    .from('eligibility_letters')
    .insert({
      match_id: matchId,
      application_id: application?.id,
      letter_body: letterBody + (internalNotes ? `\n\n[INTERNAL REVIEW NOTES: ${internalNotes}]` : ''),
      pdf_storage_path: pdfPath,
      status: 'draft',
    })
    .select()
    .single()

  return (letter as any)?.id
}

async function generateLetterPDF(
  letterBody: string,
  institutionName: string = 'Institution',
  logoUrl?: string | null
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([612, 792]) // US Letter
  const { width, height } = page.getSize()

  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

  // Header
  page.drawText(institutionName, {
    x: 72,
    y: height - 72,
    size: 16,
    font: timesBold,
    color: rgb(0.1, 0.2, 0.5),
  })

  page.drawText('Financial Aid & Scholarships Office', {
    x: 72,
    y: height - 92,
    size: 10,
    font: timesFont,
    color: rgb(0.4, 0.4, 0.4),
  })

  // Horizontal rule
  page.drawLine({
    start: { x: 72, y: height - 108 },
    end: { x: width - 72, y: height - 108 },
    thickness: 1,
    color: rgb(0.7, 0.7, 0.7),
  })

  // Letter body
  const lines = letterBody.split('\n')
  let y = height - 132
  for (const line of lines) {
    if (y < 72) break
    page.drawText(line.substring(0, 90), {
      x: 72,
      y,
      size: 11,
      font: timesFont,
      color: rgb(0, 0, 0),
    })
    y -= 16
  }

  return pdfDoc.save()
}

export async function sendLetter(letterId: string): Promise<void> {
  const supabase = createAdminClient()

  const { data: letter } = await supabase
    .from('eligibility_letters')
    .select('*, applications(*, students(*))')
    .eq('id', letterId)
    .eq('status', 'approved')
    .single()

  if (!letter) throw new Error(`Letter ${letterId} not found or not approved`)

  const student = (letter as any).applications?.students

  // Get signed URL for PDF
  const { data: signedUrl } = await supabase.storage
    .from('letters')
    .createSignedUrl((letter as any).pdf_storage_path, 60 * 60) // 1 hour

  // Send via Resend
  if (process.env.RESEND_API_KEY && student?.email) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? 'noreply@scholarshipmatch.app',
      to: student.email,
      subject: 'Your Scholarship Eligibility Letter',
      html: `
        <p>Dear ${student.full_name},</p>
        <p>Please find your scholarship eligibility letter attached to this email.</p>
        <p>You can also view and download it from your <a href="${process.env.NEXT_PUBLIC_APP_URL}/portal">student portal</a>.</p>
        <p>${signedUrl?.signedUrl ? `<a href="${signedUrl.signedUrl}">Download your letter (PDF)</a>` : ''}</p>
        <p>Best regards,<br>Financial Aid Office</p>
      `,
    })
  }

  // Update statuses
  await supabase
    .from('eligibility_letters')
    .update({ status: 'sent', sent_at: new Date().toISOString(), sent_via: 'both' })
    .eq('id', letterId)

  await supabase
    .from('scholarship_matches')
    .update({ status: 'letter_sent' })
    .eq('id', (letter as any).match_id)
}
