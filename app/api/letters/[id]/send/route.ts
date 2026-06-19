import { NextRequest, NextResponse } from 'next/server'
import { sendLetter } from '@/lib/ai/letter-agent'
import { generateEligibilityLetter } from '@/lib/ai/letter-agent'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = await req.json()
    if (action === 'generate') {
      const letterId = await generateEligibilityLetter(id) // id = matchId here
      return NextResponse.json({ letterId })
    }
    if (action === 'send') {
      await sendLetter(id) // id = letterId
      return NextResponse.json({ sent: true })
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
