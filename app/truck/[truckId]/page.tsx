import { getTruckData } from "@/lib/actions"
import TruckInterface from "./truck-interface"
import { notFound } from "next/navigation"

const VALID_TRUCKS = ["RAD-1", "RAD-2", "RAD-3", "RAD-4", "RAD-5", "RAD-6", "RAD-7"]

export default async function TruckPage({ params }: { params: { truckId: string } }) {
  if (!VALID_TRUCKS.includes(params.truckId)) {
    notFound()
  }

  let truckData
  try {
    truckData = await getTruckData(params.truckId)
  } catch (error) {
    console.error(`Failed to get truck data for ${params.truckId}:`, error)
    // Fallback to a default structure to prevent cascading client-side errors.
    // An error boundary or more specific error handling page would be ideal for production.
    truckData = { drivers: [], mammographers: [], status: null }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <TruckInterface
            truckId={params.truckId}
            drivers={truckData?.drivers || []}
            mammographers={truckData?.mammographers || []}
            status={truckData?.status}
          />
        </div>
      </div>
    </div>
  )
}
