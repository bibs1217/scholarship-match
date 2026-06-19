'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function LettersPage() {
  const supabase = createBrowserClient()
  const [letters, setLetters] = useState<any[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('eligibility_letters')
      .select('id, status, created_at, sent_at, scholarship_matches(id, scholarships(name), applications(students(full_name, email)))')
      .order('created_at', { ascending: false })
      .then(({ data }) => setLetters(data ?? []))
  }, [])

  async function approveLetter(id: string) {
    setLoading(id)
    await supabase.from('eligibility_letters').update({ status: 'approved' }).eq('id', id)
    setLetters(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l))
    setLoading(null)
  }

  async function sendLetter(matchId: string, letterId: string) {
    setLoading(letterId)
    await fetch(`/api/letters/${matchId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send' }),
    })
    setLetters(prev => prev.map(l => l.id === letterId ? { ...l, status: 'sent' } : l))
    setLoading(null)
  }

  const STATUS_COLOR: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    sent: 'bg-green-100 text-green-800',
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Eligibility Letters</h1>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Student', 'Scholarship', 'Status', 'Sent', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {letters.map((letter: any) => {
              const match = letter.scholarship_matches
              const student = match?.applications?.students
              const scholarship = match?.scholarships
              return (
                <tr key={letter.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{student?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-700">{scholarship?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[letter.status] ?? ''}`}>
                      {letter.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {letter.sent_at ? new Date(letter.sent_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {letter.status === 'draft' && (
                      <button
                        onClick={() => approveLetter(letter.id)}
                        disabled={loading === letter.id}
                        className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                    )}
                    {letter.status === 'approved' && (
                      <button
                        onClick={() => sendLetter(match?.id, letter.id)}
                        disabled={loading === letter.id}
                        className="text-xs bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                      >
                        Send to student
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {!letters.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No letters generated yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
