'use client'
import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, institution_name: institutionName } }
    })
    if (authErr) { setError(authErr.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border p-8 w-full max-w-md">
        <Link href="/" className="text-blue-900 font-bold text-xl block mb-8">ScholarMatch AI</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create your account</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution name</label>
            <input type="text" value={institutionName} onChange={e => setInstitutionName(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-900 text-white py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50">
            {loading ? 'Creating account…' : 'Start free trial'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4 text-center">
          By signing up you agree to our Terms of Service.
        </p>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Already have an account? <Link href="/auth/login" className="text-blue-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
