import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: apps } = await supabase
    .from('applications')
    .select('id, academic_year, status, submitted_at, students(full_name, email)')
    .order('submitted_at', { ascending: false })
    .limit(100)

  const STATUS_COLOR: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    matching: 'bg-yellow-100 text-yellow-700',
    matched: 'bg-green-100 text-green-700',
    completed: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Student', 'Email', 'Year', 'Status', 'Submitted', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apps?.map((app: any) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{app.students?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{app.students?.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700">{app.academic_year}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[app.status] ?? ''}`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/applications/${app.id}`} className="text-blue-600 hover:underline">View</Link>
                </td>
              </tr>
            ))}
            {!apps?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No applications yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
