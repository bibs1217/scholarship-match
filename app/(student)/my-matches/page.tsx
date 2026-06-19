import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MyMatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('supabase_auth_user_id', user.id)
    .single()

  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, academic_year')
    .eq('student_id', (student as any)?.id ?? '')

  const appIds = applications?.map(a => a.id) ?? []

  const { data: matches } = appIds.length
    ? await supabase
        .from('scholarship_matches')
        .select('id, status, confidence_score, scholarships(name, scope, award_amount_min, award_amount_max, description)')
        .in('application_id', appIds)
        .in('status', ['staff_approved', 'letter_generated', 'letter_sent'])
    : { data: [] }

  const STATUS_LABEL: Record<string, string> = {
    staff_approved: 'Approved — letter being prepared',
    letter_generated: 'Letter ready for review',
    letter_sent: '✉️ Letter sent to your email',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My scholarship matches</h1>
      <p className="text-gray-500 text-sm mb-8">Scholarships your institution has approved you for.</p>

      {matches?.length ? (
        <div className="space-y-4">
          {matches.map((m: any) => (
            <div key={m.id} className="bg-white border rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">{m.scholarships?.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5 capitalize">{m.scholarships?.scope} scholarship</p>
                  {m.scholarships?.description && (
                    <p className="text-sm text-gray-600 mt-2 max-w-md">{m.scholarships.description}</p>
                  )}
                </div>
                <div className="text-right ml-4 shrink-0">
                  {m.scholarships?.award_amount_max && (
                    <div className="text-lg font-bold text-green-700">
                      Up to ${Number(m.scholarships.award_amount_max).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">{STATUS_LABEL[m.status] ?? m.status}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-2">No matches yet</p>
          <p className="text-sm text-gray-500">
            {applications?.length
              ? 'Your application is being reviewed. Check back soon.'
              : 'Submit your application to get matched with scholarships.'}
          </p>
        </div>
      )}
    </div>
  )
}
