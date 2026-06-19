import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-blue-900">ScholarMatch</span>
        <div className="flex gap-4 text-sm">
          <Link href="/apply" className="text-gray-600 hover:text-gray-900">My application</Link>
          <Link href="/my-matches" className="text-gray-600 hover:text-gray-900">My matches</Link>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto py-10 px-4">{children}</main>
    </div>
  )
}
