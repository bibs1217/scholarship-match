import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Alias so pages can import { createBrowserClient } from '@/lib/supabase/client'
export const createBrowserClient = createClient
