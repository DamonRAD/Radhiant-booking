import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getTruckStatus } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { truckId } = await request.json()

    if (!truckId) {
      return NextResponse.json({ error: "Truck ID is required" }, { status: 400 })
    }

    console.log(`[Force Refresh] Refreshing truck ${truckId}`)

    // Get fresh truck status from database
    const status = await getTruckStatus(truckId)

    // Force revalidate all related paths
    revalidatePath(`/truck/${truckId}`)
    revalidatePath("/")
    revalidatePath("/admin")

    console.log(`[Force Refresh] Fresh status for ${truckId}:`, status)

    return NextResponse.json({
      success: true,
      status,
      message: `Truck ${truckId} status refreshed`,
    })
  } catch (error) {
    console.error("[Force Refresh] Error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
