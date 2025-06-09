import { NextResponse } from "next/server"

export async function GET() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const nextPublicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const vercelEnv = process.env.VERCEL_ENV
  const vercelGitCommitRef = process.env.VERCEL_GIT_COMMIT_REF

  console.log("[API Route /api/check-env] VERCEL_ENV:", vercelEnv)
  console.log("[API Route /api/check-env] VERCEL_GIT_COMMIT_REF:", vercelGitCommitRef)

  console.log("[API Route /api/check-env] Attempting to read SUPABASE_URL:", supabaseUrl ? "SET" : "NOT SET")
  if (!supabaseUrl) {
    console.error("[API Route /api/check-env] CRITICAL: SUPABASE_URL is undefined.")
  }

  console.log(
    "[API Route /api/check-env] Attempting to read SUPABASE_SERVICE_ROLE_KEY:",
    supabaseServiceRoleKey ? "SET" : "NOT SET",
  )
  if (!supabaseServiceRoleKey) {
    console.error("[API Route /api/check-env] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is undefined.")
  }

  console.log(
    "[API Route /api/check-env] Attempting to read NEXT_PUBLIC_SUPABASE_URL:",
    nextPublicSupabaseUrl ? "SET" : "NOT SET",
  )
  if (!nextPublicSupabaseUrl) {
    console.warn("[API Route /api/check-env] WARNING: NEXT_PUBLIC_SUPABASE_URL is undefined. This is for client-side.")
  }

  // Log a few other common Vercel system env vars to see if they are present
  console.log("[API Route /api/check-env] VERCEL_URL:", process.env.VERCEL_URL ? "SET" : "NOT SET")
  console.log("[API Route /api/check-env] VERCEL_REGION:", process.env.VERCEL_REGION ? "SET" : "NOT SET")

  return NextResponse.json({
    supabaseUrlSet: !!supabaseUrl,
    supabaseServiceRoleKeySet: !!supabaseServiceRoleKey,
    nextPublicSupabaseUrlSet: !!nextPublicSupabaseUrl,
    vercelEnv: vercelEnv || "Not set",
    vercelGitCommitRef: vercelGitCommitRef || "Not set",
    message: "Checked environment variables. See server logs for details.",
  })
}
