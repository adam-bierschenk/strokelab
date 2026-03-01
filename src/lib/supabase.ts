import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client or mock for build time when env vars aren't available
let supabaseInstance: SupabaseClient

if (supabaseUrl && supabaseKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseKey)
} else {
  // This will only be used during build time - actual queries will fail at runtime
  // if env vars are missing. Use dummy values to satisfy TypeScript.
  supabaseInstance = createClient('http://localhost:54321', 'dummy-key-for-build-time-only')
}

export const supabase = supabaseInstance

export default supabase