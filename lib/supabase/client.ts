import { createClient as supabaseCreateClient } from "@supabase/supabase-js"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    console.error("Attempted to read NEXT_PUBLIC_SUPABASE_URL, but it was undefined.")
    throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set.")
  }
  if (!supabaseAnonKey) {
    console.error("Attempted to read NEXT_PUBLIC_SUPABASE_ANON_KEY, but it was undefined.")
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set.")
  }

  return supabaseCreateClient(supabaseUrl, supabaseAnonKey)
}
