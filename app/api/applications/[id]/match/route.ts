import { NextRequest, NextResponse } from 'next/server'
import { runMatchingAgent } from '@/lib/ai/matching-agent'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await runMatchingAgent(id)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Matching agent error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
