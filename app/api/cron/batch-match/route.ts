import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runMatchingAgent } from '@/lib/ai/matching-agent'

// Vercel Cron: runs nightly at 2am UTC
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: apps } = await supabase
    .from('applications')
    .select('id')
    .eq('status', 'submitted')
    .limit(50)

  const results = await Promise.allSettled(
    (apps ?? []).map(app => runMatchingAgent(app.id))
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ processed: apps?.length ?? 0, succeeded, failed })
}
