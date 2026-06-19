'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const supabase = createBrowserClient()
  const router = useRouter()
  const [match, setMatch] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase
      .from('scholarship_matches')
      .select('*, applications(*, students(full_name, email)), scholarships(*)')
      .eq('id', id)
      .single()
      .then(({ data }) => setMatch(data))
  }, [id])

  async function updateStatus(newStatus: 'staff_approved' | 'staff_rejected') {
    setLoading(true)
    const res = await fetch(`/api/matches/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    const json = await res.json()
    if (res.ok) {
      setMsg(newStatus === 'staff_approved' ? '✅ Match approved — letter generation queued' : '❌ Match rejected')
      setMatch((prev: any) => ({ ...prev, status: newStatus }))
      if (newStatus === 'staff_approved') {
        // Trigger letter generation
        await fetch(`/api/letters/${id}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'generate' }),
        })
      }
    } else {
      setMsg(`Error: ${json.error}`)
    }
    setLoading(false)
  }

  if (!match) return <div className="p-8 text-gray-500">Loading…</div>

  const flags: string[] = Array.isArray(match.review_flags) ? match.review_flags : []
  const criteria: any[] = Array.isArray(match.per_criterion_results) ? match.per_criterion_results : []
  const pct = match.confidence_score ? Math.round(Number(match.confidence_score) * 100) : null

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Match Review</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          match.status === 'ai_suggested' ? 'bg-yellow-100 text-yellow-800' :
          match.status === 'staff_approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>{match.status.replace('_', ' ')}</span>
      </div>

      {/* Student + Scholarship */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">Student</h2>
          <p className="font-medium text-gray-900">{match.applications?.students?.full_name}</p>
          <p className="text-sm text-gray-500">{match.applications?.students?.email}</p>
        </div>
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">Scholarship</h2>
          <p className="font-medium text-gray-900">{match.scholarships?.name}</p>
          <p className="text-sm text-gray-500 capitalize">{match.scholarships?.scope} — up to ${match.scholarships?.award_amount_max?.toLocaleString()}</p>
        </div>
      </div>

      {/* Confidence */}
      {pct !== null && (
        <div className="bg-white border rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase">AI Confidence</h2>
            <span className="text-2xl font-bold text-gray-900">{pct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Flags */}
      {flags.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
          <h2 className="text-xs font-semibold text-amber-700 uppercase mb-2">⚠️ Review flags</h2>
          <ul className="space-y-1">
            {flags.map((f, i) => <li key={i} className="text-sm text-amber-800">• {f}</li>)}
          </ul>
        </div>
      )}

      {/* AI reasoning */}
      {match.match_reasoning && (
        <div className="bg-white border rounded-xl p-5 mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">AI reasoning</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{match.match_reasoning}</p>
        </div>
      )}

      {/* Per-criterion breakdown */}
      {criteria.length > 0 && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase mb-3">Criterion breakdown</h2>
          <div className="space-y-2">
            {criteria.map((c: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className={c.passed ? 'text-green-500' : 'text-red-500'}>{c.passed ? '✓' : '✗'}</span>
                <div>
                  <span className="font-medium text-gray-800">{c.criterion?.field}</span>
                  <span className="text-gray-500 ml-1">{c.criterion?.operator} {JSON.stringify(c.criterion?.value)}</span>
                  {c.reason && <p className="text-gray-500 text-xs mt-0.5">{c.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {match.status === 'ai_suggested' && (
        <div className="flex gap-3">
          <button
            onClick={() => updateStatus('staff_approved')}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            ✓ Approve & generate letter
          </button>
          <button
            onClick={() => updateStatus('staff_rejected')}
            disabled={loading}
            className="bg-red-100 text-red-700 px-6 py-2.5 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50"
          >
            ✗ Reject
          </button>
        </div>
      )}
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  )
}
