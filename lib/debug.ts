import { createSupabaseServiceClient } from "./supabase/service-client"

export async function debugRAD1Status() {
  console.log("[DEBUG] Checking RAD-1 status...")
  const supabase = createSupabaseServiceClient()

  // Check truck status
  const { data: truck, error: truckError } = await supabase.from("trucks").select("*").eq("id", "RAD-1").single()

  console.log("[DEBUG] RAD-1 truck data:", truck)
  if (truckError) console.error("[DEBUG] RAD-1 truck error:", truckError)

  // Check active time entries for RAD-1
  const { data: activeEntries, error: entriesError } = await supabase
    .from("time_entries")
    .select("*, users(name, role)")
    .eq("truck_id", "RAD-1")
    .is("sign_out_time", null)
    .order("sign_in_time", { ascending: false })

  console.log("[DEBUG] RAD-1 active time entries:", activeEntries)
  if (entriesError) console.error("[DEBUG] RAD-1 entries error:", entriesError)

  // Check if there's a current driver
  if (truck?.current_driver_id) {
    const { data: driver, error: driverError } = await supabase
      .from("users")
      .select("*")
      .eq("id", truck.current_driver_id)
      .single()

    console.log("[DEBUG] RAD-1 current driver:", driver)
    if (driverError) console.error("[DEBUG] RAD-1 driver error:", driverError)
  }

  return {
    truck,
    activeEntries,
    currentDriverId: truck?.current_driver_id,
  }
}

export async function fixRAD1Inconsistencies() {
  console.log("[DEBUG] Attempting to fix RAD-1 inconsistencies...")
  const supabase = createSupabaseServiceClient()
  const results = {
    status: "success",
    actions: [] as string[],
    errors: [] as string[],
  }

  try {
    // Get truck data
    const { data: truck, error: truckError } = await supabase.from("trucks").select("*").eq("id", "RAD-1").single()

    if (truckError) {
      results.errors.push(`Error fetching truck: ${truckError.message}`)
      results.status = "error"
      return results
    }

    // Get active entries
    const { data: activeEntries, error: entriesError } = await supabase
      .from("time_entries")
      .select("*")
      .eq("truck_id", "RAD-1")
      .is("sign_out_time", null)

    if (entriesError) {
      results.errors.push(`Error fetching active entries: ${entriesError.message}`)
      results.status = "error"
      return results
    }

    // Check for inconsistencies
    const activeDriverEntries =
      activeEntries?.filter((entry) => {
        // Get user role
        return supabase
          .from("users")
          .select("role")
          .eq("id", entry.user_id)
          .single()
          .then(({ data }) => data?.role === "driver" || data?.role === "locum_driver")
      }) || []

    // If there's a current driver in the truck but no active entries
    if (truck.current_driver_id && activeDriverEntries.length === 0) {
      // Clear the current driver
      const { error } = await supabase.from("trucks").update({ current_driver_id: null }).eq("id", "RAD-1")

      if (error) {
        results.errors.push(`Error clearing current driver: ${error.message}`)
      } else {
        results.actions.push(
          `Cleared current driver (${truck.current_driver_id}) from RAD-1 as no active entries were found`,
        )
      }
    }

    // If there are active entries but no current driver
    if (!truck.current_driver_id && activeDriverEntries.length > 0) {
      // Set the current driver to the most recent entry
      const mostRecentEntry = activeDriverEntries.sort(
        (a, b) => new Date(b.sign_in_time).getTime() - new Date(a.sign_in_time).getTime(),
      )[0]

      const { error } = await supabase
        .from("trucks")
        .update({ current_driver_id: mostRecentEntry.user_id })
        .eq("id", "RAD-1")

      if (error) {
        results.errors.push(`Error setting current driver: ${error.message}`)
      } else {
        results.actions.push(`Set current driver to ${mostRecentEntry.user_id} based on active entry`)
      }
    }

    if (results.errors.length > 0) {
      results.status = "partial"
    }

    return results
  } catch (error) {
    results.status = "error"
    results.errors.push(`Unexpected error: ${(error as Error).message}`)
    return results
  }
}
