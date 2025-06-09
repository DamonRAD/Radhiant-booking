import { createClient } from "@supabase/supabase-js"

export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const vercelEnv = process.env.VERCEL_ENV || "Not set"
  const vercelGitCommitRef = process.env.VERCEL_GIT_COMMIT_REF || "Not set"

  if (!supabaseUrl) {
    const errorMsg = `CRITICAL: SUPABASE_URL environment variable is not set. VERCEL_ENV: ${vercelEnv}, GIT_REF: ${vercelGitCommitRef}. Ensure it's scoped for the '${vercelEnv}' environment in Vercel project settings.`
    console.error(errorMsg.replace(/\s+/g, " ").trim())
    throw new Error(errorMsg.replace(/\s+/g, " ").trim())
  }
  if (!supabaseServiceRoleKey) {
    const errorMsg = `CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable is not set. VERCEL_ENV: ${vercelEnv}, GIT_REF: ${vercelGitCommitRef}. Ensure it's scoped for the '${vercelEnv}' environment in Vercel project settings.`
    console.error(errorMsg.replace(/\s+/g, " ").trim())
    throw new Error(errorMsg.replace(/\s+/g, " ").trim())
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey)
}
