import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/applications', label: 'Applications', icon: '📋' },
  { href: '/matches', label: 'Match Queue', icon: '🤖' },
  { href: '/letters', label: 'Letters', icon: '✉️' },
  { href: '/scholarships', label: 'Scholarships', icon: '🎓' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: instUser } = await supabase
    .from('institution_users')
    .select('institutions(name, primary_color)')
    .eq('supabase_auth_user_id', user.id)
    .single()

  const inst = (instUser as any)?.institutions
  const color = inst?.primary_color ?? '#003087'

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="px-5 py-4 border-b" style={{ borderLeftColor: color, borderLeftWidth: 4 }}>
          <span className="font-bold text-sm text-gray-900 truncate">{inst?.name ?? 'ScholarMatch AI'}</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t text-xs text-gray-500 truncate">{user.email}</div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
