import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ScholarshipsPage() {
  const supabase = await createClient()
  const { data: scholarships } = await supabase
    .from('scholarships')
    .select('id, name, scope, award_amount_min, award_amount_max, renewable, status, deadline')
    .order('scope', { ascending: true })
    .order('name', { ascending: true })

  const SCOPE_COLOR: Record<string, string> = {
    federal: 'bg-blue-100 text-blue-800',
    state: 'bg-green-100 text-green-800',
    institutional: 'bg-purple-100 text-purple-800',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scholarships</h1>
        <Link href="/scholarships/new" className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800">
          + Add scholarship
        </Link>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Name', 'Scope', 'Award range', 'Renewable', 'Deadline', 'Status', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {scholarships?.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">{s.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${SCOPE_COLOR[s.scope] ?? ''}`}>
                    {s.scope}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {s.award_amount_min || s.award_amount_max
                    ? `$${Number(s.award_amount_min).toLocaleString()} – $${Number(s.award_amount_max).toLocaleString()}`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">{s.renewable ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 text-gray-500">{s.deadline ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${s.status === 'active' ? 'text-green-700' : 'text-gray-400'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/scholarships/${s.id}`} className="text-blue-600 hover:underline text-xs">Edit</Link>
                </td>
              </tr>
            ))}
            {!scholarships?.length && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No scholarships yet. <Link href="/scholarships/new" className="text-blue-600 hover:underline">Add one</Link>.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
