import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MatchQueuePage() {
  const supabase = await createClient()
  const { data: matches } = await supabase
    .from('scholarship_matches')
    .select('id, status, confidence_score, review_flags, match_reasoning, applications(id, students(full_name)), scholarships(name, scope, award_amount_min, award_amount_max)')
    .order('created_at', { ascending: false })
    .limit(200)

  const STATUS_COLOR: Record<string, string> = {
    ai_suggested: 'bg-yellow-100 text-yellow-800',
    staff_approved: 'bg-green-100 text-green-800',
    staff_rejected: 'bg-red-100 text-red-800',
    letter_generated: 'bg-blue-100 text-blue-800',
    letter_sent: 'bg-purple-100 text-purple-800',
  }

  const pending = matches?.filter(m => m.status === 'ai_suggested') ?? []
  const rest = matches?.filter(m => m.status !== 'ai_suggested') ?? []

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Match Queue</h1>

      {pending.length > 0 && (
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider mb-3">
            Pending review ({pending.length})
          </h2>
          <MatchTable matches={pending} statusColors={STATUS_COLOR} />
        </div>
      )}

      {rest.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-8">
            Reviewed ({rest.length})
          </h2>
          <MatchTable matches={rest} statusColors={STATUS_COLOR} />
        </div>
      )}

      {!matches?.length && (
        <p className="text-gray-400 text-center py-20">No matches yet. Run the AI matching agent on a submitted application.</p>
      )}
    </div>
  )
}

function MatchTable({ matches, statusColors }: { matches: any[], statusColors: Record<string, string> }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden mb-6">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {['Student', 'Scholarship', 'Confidence', 'Flags', 'Status', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {matches.map((m: any) => {
            const flags = Array.isArray(m.review_flags) ? m.review_flags : []
            const pct = m.confidence_score ? Math.round(Number(m.confidence_score) * 100) : null
            return (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.applications?.students?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">
                  <div>{m.scholarships?.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{m.scholarships?.scope}</div>
                </td>
                <td className="px-4 py-3">
                  {pct !== null && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-600">{pct}%</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {flags.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      ⚠️ {flags.length} flag{flags.length > 1 ? 's' : ''}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[m.status] ?? ''}`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/matches/${m.id}`} className="text-blue-600 hover:underline text-xs">Review</Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
