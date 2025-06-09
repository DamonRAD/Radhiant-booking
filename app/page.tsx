import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllTruckStatuses, getUsers } from "@/lib/database" // These functions call getSupabaseClient
import { Truck, AlertTriangle, UserIcon } from "lucide-react"
import type { User, TruckStatus } from "@/lib/types"

// Module-level logs to check env var availability at import time
console.log(
  "[Server Component Log - app/page.tsx Module Level] SUPABASE_URL (at import):",
  process.env.SUPABASE_URL ? "SET" : "NOT SET",
)
console.log(
  "[Server Component Log - app/page.tsx Module Level] VERCEL_ENV (at import):",
  process.env.VERCEL_ENV || "NOT SET",
)

const isAdminUser = async (): Promise<boolean> => {
  try {
    const users: User[] = await getUsers()
    if (!Array.isArray(users)) {
      console.error("[Server Component Log - isAdminUser] getUsers did not return an array:", users)
      return false
    }
    return users.some((user) => user.role === "it")
  } catch (error) {
    console.error("[Server Component Log - isAdminUser] Error fetching users:", error)
    throw error // Re-throw to be caught by HomePage's try...catch
  }
}

export default async function HomePage() {
  let truckStatuses: TruckStatus[] | undefined = undefined
  let isAdmin = false
  let criticalError: string | undefined = undefined
  let errorDigest: string | undefined = undefined

  console.log(
    "[Server Component Log - HomePage render] Initializing. Checking VERCEL_ENV:",
    process.env.VERCEL_ENV || "NOT SET",
  )
  console.log(
    "[Server Component Log - HomePage render] Checking SUPABASE_URL:",
    process.env.SUPABASE_URL ? "SET" : "NOT SET",
  )

  try {
    truckStatuses = await getAllTruckStatuses()
    isAdmin = await isAdminUser()
    console.log("[Server Component Log - HomePage render] Data fetching successful.")

    // After the try-catch block where truckStatuses is fetched, add sorting
    if (truckStatuses && truckStatuses.length > 0) {
      truckStatuses.sort((a, b) => {
        // Extract the number from RAD-X format
        const numA = Number.parseInt(a.id.split("-")[1]) || 0
        const numB = Number.parseInt(b.id.split("-")[1]) || 0
        return numA - numB
      })
    }
  } catch (e: any) {
    console.error("[Server Component Log - HomePage render] CRITICAL ERROR DURING DATA FETCHING:", e.message)
    console.error("[Server Component Log - HomePage render] Full error object:", e)

    errorDigest = e.digest // Next.js specific error digest
    criticalError =
      `A critical server-side exception occurred (Digest: ${errorDigest || "N/A"}). ` +
      "This is very likely due to missing or incorrectly scoped 'SUPABASE_URL' or 'SUPABASE_SERVICE_ROLE_KEY' environment variables in your Vercel project settings for the current 'preview' environment. " +
      `Please verify these settings in the Vercel dashboard and ensure the project has been redeployed after any changes. Original error: ${e.message}`

    truckStatuses = []
    isAdmin = false
  }

  if (criticalError) {
    return (
      <div className="min-h-screen bg-red-50 p-4 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl max-w-2xl w-full">
          <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto mb-4 md:mb-6" />
          <h1 className="text-2xl md:text-3xl font-bold text-red-700 mb-3 md:mb-4">Application Configuration Error</h1>
          <p className="text-gray-700 mb-3 text-sm md:text-base">
            The Time & Attendance System cannot start due to a server-side configuration problem.
          </p>
          <div className="bg-red-100 border border-red-300 text-red-800 p-3 md:p-4 rounded-md text-left mb-4 md:mb-6 text-xs md:text-sm">
            <p className="font-semibold">Error Details:</p>
            <p className="break-words whitespace-pre-wrap">{criticalError}</p>
            <p className="mt-2">
              Please check the Vercel server logs for this deployment, specifically looking for Digest:{" "}
              <strong>{errorDigest || "N/A"}</strong> for the full stack trace.
            </p>
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">Action Required:</h2>
          <ul className="list-disc list-inside text-left text-gray-600 space-y-1 mb-4 md:mb-6 text-xs md:text-sm">
            <li>Go to your Vercel Project Settings {">"} Environment Variables.</li>
            <li>Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present and their values are correct.</li>
            <li>
              Crucially, verify these variables are scoped to include the "Preview" environment (since `VERCEL_ENV` is
              `preview` in logs).
            </li>
            <li>
              After confirming/correcting settings, **trigger a new deployment** for this branch in Vercel (preferably
              without build cache).
            </li>
            <li>
              If `VERCEL_GIT_COMMIT_REF` is consistently "Not set" in logs, this might indicate a Git integration issue
              with Vercel that should also be investigated with Vercel Support.
            </li>
            <li>
              If the issue persists after these steps, contact Vercel Support with these details and a link to the
              failing deployment.
            </li>
          </ul>
          <Link href="https://vercel.com/docs/projects/environment-variables" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-gray-400 text-gray-700 hover:bg-gray-100 text-xs md:text-sm">
              Vercel Environment Variables Docs
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Original page rendering logic if no critical error
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <header className="py-6 mb-8 flex flex-col items-center bg-radhiant-blue rounded-lg shadow-md">
          <Image
            src="/radhiant-logo-white-text.png"
            alt="Radhiant Diagnostic Imaging"
            width={250}
            height={70}
            priority
          />
          <h1 className="text-4xl font-bold text-white mt-4">Time & Attendance System</h1>
          <p className="text-radhiant-lightBlue">Select a truck to manage sign-ins and sign-outs</p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {(truckStatuses || []).map((status) => (
            <Card key={status.id} className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="bg-radhiant-blue text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {status.id}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Current Staff Section */}
                <div className="space-y-3 mb-4">
                  <h3 className="font-semibold text-radhiant-blue flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Current Staff
                  </h3>

                  {/* Driver Status */}
                  <div className="bg-radhiant-lightBlue p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-radhiant-blue text-sm">Driver:</span>
                      <span
                        className={
                          status.currentDriver ? "text-radhiant-green font-semibold text-sm" : "text-gray-500 text-sm"
                        }
                      >
                        {status.currentDriver ? status.currentDriver.userName : "Not signed in"}
                      </span>
                    </div>
                    {status.currentDriver && (
                      <div className="text-xs text-gray-600 mt-1">
                        Since:{" "}
                        {new Date(status.currentDriver.signInTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mammographer Status */}
                  <div className="bg-radhiant-lightGreen p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-radhiant-green text-sm">Mammographer:</span>
                      <span
                        className={
                          status.currentMammographer
                            ? "text-radhiant-green font-semibold text-sm"
                            : "text-gray-500 text-sm"
                        }
                      >
                        {status.currentMammographer ? status.currentMammographer.userName : "Not signed in"}
                      </span>
                    </div>
                    {status.currentMammographer && (
                      <div className="text-xs text-gray-600 mt-1">
                        Since:{" "}
                        {new Date(status.currentMammographer.signInTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Info (if admin) */}
                {isAdmin && (
                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-radhiant-blue">Driver: </span>
                      <span className={status.currentDriver ? "text-radhiant-green font-semibold" : "text-gray-500"}>
                        {status.currentDriver ? status.currentDriver.userName : "Not signed in"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-radhiant-blue">Mammographer: </span>
                      <span
                        className={status.currentMammographer ? "text-radhiant-green font-semibold" : "text-gray-500"}
                      >
                        {status.currentMammographer ? status.currentMammographer.userName : "Not signed in"}
                      </span>
                    </div>
                  </div>
                )}

                {!isAdmin && <p className="text-sm text-gray-600">Access this truck to sign in or out.</p>}

                <Link href={`/truck/${status.id}`}>
                  <Button className="w-full bg-radhiant-green hover:bg-radhiant-green/90 text-white">
                    Access {status.id}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
          {(!truckStatuses || truckStatuses.length === 0) && !criticalError && (
            <p className="text-center text-gray-500 col-span-full">No truck data available or could not be loaded.</p>
          )}
        </div>

        {isAdmin && (
          <div className="text-center">
            <Link href="/admin">
              <Button
                variant="outline"
                size="lg"
                className="border-radhiant-blue text-radhiant-blue hover:bg-radhiant-blue/10 bg-white/80 backdrop-blur-sm"
              >
                Admin Panel
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
