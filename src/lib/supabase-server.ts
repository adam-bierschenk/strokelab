import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function createClient() {
  const cookieStore = await cookies()

  // Use dummy values for build time if env vars are missing
  return createServerClient(
    supabaseUrl || 'http://localhost:54321',
    supabaseKey || 'dummy-key-for-build-time-only',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle error if called from Server Component
          }
        },
      },
    }
  )
}