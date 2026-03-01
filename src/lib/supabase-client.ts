import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function createClient() {
  // Use dummy values for build time if env vars are missing
  // These will be replaced at runtime in the browser
  return createBrowserClient(
    supabaseUrl || 'http://localhost:54321',
    supabaseKey || 'dummy-key-for-build-time-only'
  )
}