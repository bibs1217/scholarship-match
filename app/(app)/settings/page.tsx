'use client'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const supabase = createBrowserClient()
  const [inst, setInst] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [billingLoading, setBillingLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('institution_users')
        .select('institutions(*)')
        .eq('supabase_auth_user_id', user.id)
        .single()
        .then(({ data }) => setInst((data as any)?.institutions))
    })
  }, [])

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('institutions').update({
      name: inst.name,
      primary_color: inst.primary_color,
    }).eq('id', inst.id)
    setMsg(error ? `Error: ${error.message}` : '✅ Saved')
    setSaving(false)
  }

  async function openBillingPortal() {
    setBillingLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
    setBillingLoading(false)
  }

  if (!inst) return <div className="p-8 text-gray-500">Loading…</div>

  const PLAN_BADGE: Record<string, string> = {
    starter: 'bg-gray-100 text-gray-700',
    standard: 'bg-blue-100 text-blue-700',
    enterprise: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      {/* Institution */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Institution</h2>
        <form onSubmit={saveSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution name</label>
            <input type="text" value={inst.name}
              onChange={e => setInst((prev: any) => ({ ...prev, name: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={inst.primary_color ?? '#003087'}
                onChange={e => setInst((prev: any) => ({ ...prev, primary_color: e.target.value }))}
                className="w-10 h-10 rounded border cursor-pointer" />
              <span className="text-sm text-gray-600">{inst.primary_color}</span>
            </div>
          </div>
          {msg && <p className="text-sm">{msg}</p>}
          <button type="submit" disabled={saving}
            className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>

      {/* Billing */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Billing</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-700 font-medium capitalize">{inst.plan_tier} plan</p>
            <p className="text-xs text-gray-500 capitalize">Status: {inst.subscription_status}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PLAN_BADGE[inst.plan_tier] ?? ''}`}>
            {inst.plan_tier}
          </span>
        </div>
        <button onClick={openBillingPortal} disabled={billingLoading}
          className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          {billingLoading ? 'Loading…' : 'Manage billing & subscription'}
        </button>
      </div>
    </div>
  )
}
