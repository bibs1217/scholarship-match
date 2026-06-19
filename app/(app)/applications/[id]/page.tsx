'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createBrowserClient()
  const router = useRouter()
  const [app, setApp] = useState<any>(null)
  const [running, setRunning] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase
      .from('applications')
      .select('*, students(full_name, email)')
      .eq('id', id)
      .single()
      .then(({ data }) => setApp(data))
  }, [id])

  async function runMatching() {
    setRunning(true)
    setMsg('')
    const res = await fetch(`/api/applications/${id}/match`, { method: 'POST' })
    const json = await res.json()
    setMsg(res.ok ? `✅ Found ${json.matchCount} matches` : `❌ ${json.error}`)
    setRunning(false)
    if (res.ok) router.push('/matches')
  }

  if (!app) return <div className="p-8 text-gray-500">Loading…</div>

  const fields = [
    ['GPA (unweighted)', app.gpa_unweighted],
    ['GPA (weighted)', app.gpa_weighted],
    ['SAT score', app.sat_score],
    ['ACT score', app.act_score],
    ['Degree level', app.degree_level],
    ['Intended major', app.intended_major],
    ['Residency state', app.residency_state],
    ['Income bracket', app.household_income_bracket],
    ['First generation', app.is_first_generation ? 'Yes' : 'No'],
    ['FAFSA on file', app.fafsa_on_file ? 'Yes' : 'No'],
    ['Community service hours', app.community_service_hours],
    ['Academic year', app.academic_year],
    ['Status', app.status],
  ]

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{app.students?.full_name}</h1>
      <p className="text-gray-500 mb-8">{app.students?.email}</p>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Application details</h2>
        <dl className="grid grid-cols-2 gap-3">
          {fields.map(([label, value]) => (
            <div key={label as string}>
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="text-sm text-gray-900 font-medium">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {app.free_text_essay && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Essay</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.free_text_essay}</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        {(app.status === 'submitted' || app.status === 'draft') && (
          <button
            onClick={runMatching}
            disabled={running}
            className="bg-blue-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {running ? 'Running AI matching…' : 'Run AI matching'}
          </button>
        )}
        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </div>
  )
}
