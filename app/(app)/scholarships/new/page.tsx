'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const DEFAULT_SCHEMA = JSON.stringify({
  match_logic: 'all',
  criteria: [
    { field: 'gpa_unweighted', operator: 'gte', value: 3.0 },
    { field: 'residency_state', operator: 'in', value: ['FL'] },
  ],
  required_documents: ['Official transcript'],
  notes_for_agent: ''
}, null, 2)

export default function NewScholarshipPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [awardMin, setAwardMin] = useState('')
  const [awardMax, setAwardMax] = useState('')
  const [renewable, setRenewable] = useState(false)
  const [deadline, setDeadline] = useState('')
  const [schema, setSchema] = useState(DEFAULT_SCHEMA)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    let parsedSchema
    try { parsedSchema = JSON.parse(schema) }
    catch { setError('Invalid JSON in criteria schema'); setSaving(false); return }

    const { error: dbErr } = await supabase.from('scholarships').insert({
      name,
      description,
      scope: 'institutional',
      award_amount_min: awardMin ? parseFloat(awardMin) : null,
      award_amount_max: awardMax ? parseFloat(awardMax) : null,
      renewable,
      deadline: deadline || null,
      criteria_schema: parsedSchema,
      status: 'active',
    })

    if (dbErr) { setError(dbErr.message); setSaving(false); return }
    router.push('/scholarships')
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add scholarship</h1>
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min award ($)</label>
            <input type="number" value={awardMin} onChange={e => setAwardMin(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max award ($)</label>
            <input type="number" value={awardMax} onChange={e => setAwardMax(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input type="checkbox" id="renewable" checked={renewable} onChange={e => setRenewable(e.target.checked)}
              className="rounded" />
            <label htmlFor="renewable" className="text-sm text-gray-700">Renewable</label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Criteria schema (JSON)</label>
          <textarea value={schema} onChange={e => setSchema(e.target.value)} rows={12}
            className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <p className="text-xs text-gray-400 mt-1">
            Fields: gpa_unweighted, gpa_weighted, sat_score, act_score, residency_state, degree_level, intended_major, household_income_bracket, is_first_generation, fafsa_on_file, community_service_hours, etc.
          </p>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save scholarship'}
          </button>
          <button type="button" onClick={() => router.push('/scholarships')}
            className="text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-100">Cancel</button>
        </div>
      </form>
    </div>
  )
}
