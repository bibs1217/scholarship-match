import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: instUser } = await supabase
    .from('institution_users')
    .select('institution_id')
    .eq('supabase_auth_user_id', user!.id)
    .single()

  const instId = (instUser as any)?.institution_id

  const [
    { count: studentCount },
    { count: appCount },
    { count: pendingMatches },
    { count: pendingLetters },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('institution_id', instId),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('institution_id', instId),
    supabase.from('scholarship_matches').select('*', { count: 'exact', head: true })
      .eq('institution_id', instId).eq('status', 'ai_suggested'),
    supabase.from('eligibility_letters').select('*', { count: 'exact', head: true })
      .eq('institution_id', instId).eq('status', 'draft'),
  ])

  const stats = [
    { label: 'Students', value: studentCount ?? 0, href: '/applications' },
    { label: 'Applications', value: appCount ?? 0, href: '/applications' },
    { label: 'Pending match approvals', value: pendingMatches ?? 0, href: '/matches', alert: true },
    { label: 'Pending letter approvals', value: pendingLetters ?? 0, href: '/letters', alert: true },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className={`bg-white border rounded-xl p-5 hover:shadow-sm transition ${s.alert && Number(s.value) > 0 ? 'border-amber-400' : ''}`}>
            <div className="text-3xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="space-y-2">
            <Link href="/scholarships/new" className="flex items-center gap-2 text-sm text-blue-700 hover:underline">+ Add scholarship</Link>
            <Link href="/applications" className="flex items-center gap-2 text-sm text-blue-700 hover:underline">+ Run AI matching on new applications</Link>
            <Link href="/matches" className="flex items-center gap-2 text-sm text-blue-700 hover:underline">→ Review pending matches</Link>
            <Link href="/letters" className="flex items-center gap-2 text-sm text-blue-700 hover:underline">→ Approve pending letters</Link>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Workflow</h2>
          <ol className="space-y-3 text-sm text-gray-700">
            {[
              'Student submits application',
              'Run AI matching agent',
              'Staff approves or rejects matches',
              'AI generates eligibility letters',
              'Staff approves letters',
              'Letters sent to students via email',
            ].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
