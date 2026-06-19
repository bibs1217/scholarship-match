'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const DEGREE_LEVELS = ['certificate', 'associate', 'bachelor', 'master', 'doctoral']
const INCOME_BRACKETS = ['very_low', 'low', 'moderate', 'middle', 'upper_middle', 'high']
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

export default function ApplyPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '', email: '', academic_year: '2025-2026',
    gpa_unweighted: '', gpa_weighted: '', sat_score: '', act_score: '',
    degree_level: 'bachelor', intended_major: '', residency_state: 'FL',
    household_income_bracket: 'moderate',
    is_first_generation: false, is_first_time_in_college: true,
    is_national_merit_finalist: false, is_veteran_or_dependent: false,
    has_disability_documentation: false, fafsa_on_file: false, ffaa_on_file: false,
    community_service_hours: '', free_text_essay: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Please sign in first'); setSaving(false); return }

    // Get or create student record
    let { data: student } = await supabase
      .from('students')
      .select('id, institution_id')
      .eq('supabase_auth_user_id', user.id)
      .single()

    if (!student) {
      // Need institution_id — get first active institution as demo
      const { data: inst } = await supabase.from('institutions').select('id').limit(1).single()
      const { data: newStudent, error: sErr } = await supabase.from('students').insert({
        supabase_auth_user_id: user.id,
        institution_id: inst?.id,
        email: form.email || user.email,
        full_name: form.full_name,
      }).select('id, institution_id').single()
      if (sErr) { setError(sErr.message); setSaving(false); return }
      student = newStudent
    }

    const { data: app, error: appErr } = await supabase.from('applications').insert({
      institution_id: student!.institution_id,
      student_id: student!.id,
      academic_year: form.academic_year,
      status: 'submitted',
      gpa_unweighted: form.gpa_unweighted ? parseFloat(form.gpa_unweighted) : null,
      gpa_weighted: form.gpa_weighted ? parseFloat(form.gpa_weighted) : null,
      sat_score: form.sat_score ? parseInt(form.sat_score) : null,
      act_score: form.act_score ? parseInt(form.act_score) : null,
      degree_level: form.degree_level,
      intended_major: form.intended_major || null,
      residency_state: form.residency_state,
      household_income_bracket: form.household_income_bracket,
      is_first_generation: form.is_first_generation,
      is_first_time_in_college: form.is_first_time_in_college,
      is_national_merit_finalist: form.is_national_merit_finalist,
      is_veteran_or_dependent: form.is_veteran_or_dependent,
      has_disability_documentation: form.has_disability_documentation,
      fafsa_on_file: form.fafsa_on_file,
      ffaa_on_file: form.ffaa_on_file,
      community_service_hours: form.community_service_hours ? parseInt(form.community_service_hours) : null,
      free_text_essay: form.free_text_essay || null,
      submitted_at: new Date().toISOString(),
    }).select('id').single()

    if (appErr) { setError(appErr.message); setSaving(false); return }
    router.push('/my-matches')
  }

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelCls = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Scholarship Application</h1>
      <p className="text-gray-500 text-sm mb-8">Fill out your information to find scholarships you qualify for.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal */}
        <section className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Personal information</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Full name *</label>
              <input type="text" value={form.full_name} onChange={e => set('full_name', e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required className={inputCls} />
            </div>
          </div>
        </section>

        {/* Academic */}
        <section className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Academic information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>GPA (unweighted)</label>
              <input type="number" step="0.01" min="0" max="4" value={form.gpa_unweighted} onChange={e => set('gpa_unweighted', e.target.value)} className={inputCls} placeholder="e.g. 3.8" />
            </div>
            <div>
              <label className={labelCls}>GPA (weighted)</label>
              <input type="number" step="0.01" min="0" max="5" value={form.gpa_weighted} onChange={e => set('gpa_weighted', e.target.value)} className={inputCls} placeholder="e.g. 4.2" />
            </div>
            <div>
              <label className={labelCls}>SAT score</label>
              <input type="number" min="400" max="1600" value={form.sat_score} onChange={e => set('sat_score', e.target.value)} className={inputCls} placeholder="e.g. 1350" />
            </div>
            <div>
              <label className={labelCls}>ACT score</label>
              <input type="number" min="1" max="36" value={form.act_score} onChange={e => set('act_score', e.target.value)} className={inputCls} placeholder="e.g. 30" />
            </div>
            <div>
              <label className={labelCls}>Degree level</label>
              <select value={form.degree_level} onChange={e => set('degree_level', e.target.value)} className={inputCls}>
                {DEGREE_LEVELS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Intended major</label>
              <input type="text" value={form.intended_major} onChange={e => set('intended_major', e.target.value)} className={inputCls} placeholder="e.g. Computer Science" />
            </div>
            <div>
              <label className={labelCls}>Academic year</label>
              <input type="text" value={form.academic_year} onChange={e => set('academic_year', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Community service hours</label>
              <input type="number" min="0" value={form.community_service_hours} onChange={e => set('community_service_hours', e.target.value)} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Eligibility */}
        <section className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Eligibility information</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>State of residency</label>
              <select value={form.residency_state} onChange={e => set('residency_state', e.target.value)} className={inputCls}>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Household income bracket</label>
              <select value={form.household_income_bracket} onChange={e => set('household_income_bracket', e.target.value)} className={inputCls}>
                {INCOME_BRACKETS.map(b => <option key={b} value={b}>{b.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['is_first_generation', 'First-generation college student'],
              ['is_first_time_in_college', 'First time in college'],
              ['is_national_merit_finalist', 'National Merit Finalist'],
              ['is_veteran_or_dependent', 'Veteran or military dependent'],
              ['has_disability_documentation', 'Have disability documentation'],
              ['fafsa_on_file', 'FAFSA on file'],
              ['ffaa_on_file', 'FFAA on file'],
            ].map(([field, label]) => (
              <label key={field as string} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={(form as any)[field as string]}
                  onChange={e => set(field as string, e.target.checked)} className="rounded" />
                {label}
              </label>
            ))}
          </div>
        </section>

        {/* Essay */}
        <section className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Personal statement (optional)</h2>
          <textarea value={form.free_text_essay} onChange={e => set('free_text_essay', e.target.value)} rows={6}
            placeholder="Share anything about your background, goals, or circumstances that may be relevant to scholarship eligibility."
            className={inputCls} />
        </section>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={saving}
          className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50">
          {saving ? 'Submitting…' : 'Submit application'}
        </button>
      </form>
    </div>
  )
}
