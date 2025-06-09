import { createSupabaseServiceClient } from "./supabase/service-client"
import type { User, TimeEntry, Truck, TruckStatus } from "./types"
import type { PostgrestError } from "@supabase/supabase-js"

function handleError(error: PostgrestError | null, context: string): void {
  if (error) {
    console.error(`Supabase error in ${context}:`, error.message) // Log only message for brevity
    throw new Error(`Database operation failed in ${context}: ${error.message}`)
  }
}

function getSupabaseClient() {
  return createSupabaseServiceClient()
}

// First, let's modify the password validation function to accept any password of 1+ characters
export function validatePassword(password: string): { isValid: boolean; message: string } {
  if (password.length < 1) {
    return { isValid: false, message: "Password cannot be empty" }
  }

  return { isValid: true, message: "" }
}

// Verify user password
export async function verifyUserPassword(userId: string, password: string): Promise<boolean> {
  console.log(`[verifyUserPassword] Verifying password for user ${userId}`)
  const supabase = getSupabaseClient()

  // First check if the user exists
  const { data: userExists, error: userExistsError } = await supabase.from("users").select("id").eq("id", userId)

  if (userExistsError) {
    console.error(`[verifyUserPassword] Error checking if user exists:`, userExistsError)
    throw new Error(`Error checking if user exists: ${userExistsError.message}`)
  }

  if (!userExists || userExists.length === 0) {
    console.error(`[verifyUserPassword] User ${userId} not found in database`)
    throw new Error(`User not found in database`)
  }

  // Now get the password
  const { data: user, error } = await supabase.from("users").select("password").eq("id", userId).single()

  if (error) {
    console.error(`[verifyUserPassword] Error fetching password for user ${userId}:`, error)
    throw new Error(`Error fetching password: ${error.message}`)
  }

  if (!user || !user.password) {
    console.error(`[verifyUserPassword] User ${userId} does not have a password set`)
    throw new Error("User does not have a password set")
  }

  const isValid = user.password === password
  console.log(`[verifyUserPassword] Password verification for user ${userId}: ${isValid ? "SUCCESS" : "FAILED"}`)
  return isValid
}

// Auto cleanup old time entries (older than 3 months)
export async function cleanupOldTimeEntries(): Promise<void> {
  const supabase = getSupabaseClient()
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  console.log(`[cleanupOldTimeEntries] Cleaning up entries older than ${threeMonthsAgo.toISOString()}`)

  const { data: entriesToDelete, error: selectError } = await supabase
    .from("time_entries")
    .select("id, sign_in_time")
    .lt("sign_in_time", threeMonthsAgo.toISOString())

  if (selectError) {
    console.error(`[cleanupOldTimeEntries] Error finding old entries:`, selectError)
    return
  }

  if (!entriesToDelete || entriesToDelete.length === 0) {
    console.log(`[cleanupOldTimeEntries] No old entries found to delete`)
    return
  }

  console.log(`[cleanupOldTimeEntries] Found ${entriesToDelete.length} old entries to delete`)

  const { error: deleteError } = await supabase
    .from("time_entries")
    .delete()
    .lt("sign_in_time", threeMonthsAgo.toISOString())

  if (deleteError) {
    console.error(`[cleanupOldTimeEntries] Error deleting old entries:`, deleteError)
    throw new Error(`Failed to cleanup old entries: ${deleteError.message}`)
  }

  console.log(`[cleanupOldTimeEntries] Successfully deleted ${entriesToDelete.length} old time entries`)
}

export async function getUsers(): Promise<User[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("users").select("*")
  handleError(error, "getUsers")
  return data || []
}

export async function getUserById(userId: string): Promise<User | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
  if (error && error.code !== "PGRST116") {
    handleError(error, `getUserById for ${userId}`)
  }
  return data
}

export async function getUsersForTruck(truckId: string, role: User["role"]): Promise<User[]> {
  const supabase = getSupabaseClient()
  const { data: assignments, error: assignmentError } = await supabase
    .from("user_truck_assignments")
    .select("user_id")
    .eq("truck_id", truckId)
  handleError(assignmentError, `getUsersForTruck (assignments) for truck ${truckId}`)

  if (!assignments || assignments.length === 0) {
    if (role === "locum_driver") {
      const { data: locums, error: locumError } = await supabase
        .from("users")
        .select("*")
        .eq("role", role)
        .eq("is_active", true)
      handleError(locumError, `getUsersForTruck (locums) for truck ${truckId}`)
      return locums || []
    }
    return []
  }

  const userIds = assignments.map((a) => a.user_id)
  const query = supabase.from("users").select("*").in("id", userIds).eq("role", role).eq("is_active", true)

  const { data: users, error: userError } = await query
  handleError(userError, `getUsersForTruck (users) for truck ${truckId}`)

  if (role === "locum_driver") {
    const { data: allLocums, error: locumError } = await supabase
      .from("users")
      .select("*")
      .eq("role", "locum_driver")
      .eq("is_active", true)
    handleError(locumError, `getUsersForTruck (all locums) for truck ${truckId}`)
    const combined = [...(users || []), ...(allLocums || [])]
    return Array.from(new Map(combined.map((u) => [u.id, u])).values())
  }

  return users || []
}

export async function getTruckStatus(truckId: string): Promise<TruckStatus | null> {
  const supabase = getSupabaseClient()
  const { data: truck, error } = await supabase.from("trucks").select("*").eq("id", truckId).single()
  if (error && error.code !== "PGRST116") {
    handleError(error, `getTruckStatus for ${truckId}`)
  }
  if (!truck) return null

  const truckStatus: TruckStatus = { ...truck, currentDriver: undefined, currentMammographer: undefined }

  if (truck.current_driver_id) {
    const { data: driverUser } = await supabase
      .from("users")
      .select("id, name")
      .eq("id", truck.current_driver_id)
      .single()

    const { data: driverTimeEntry } = await supabase
      .from("time_entries")
      .select("sign_in_time")
      .eq("user_id", truck.current_driver_id)
      .eq("truck_id", truckId)
      .is("sign_out_time", null)
      .order("sign_in_time", { ascending: false })
      .limit(1)
      .single()
    if (driverUser && driverTimeEntry) {
      truckStatus.currentDriver = {
        userId: driverUser.id,
        userName: driverUser.name,
        signInTime: driverTimeEntry.sign_in_time,
      }
    } else if (driverUser) {
      truckStatus.currentDriver = {
        userId: driverUser.id,
        userName: driverUser.name,
        signInTime: new Date().toISOString(), // Fallback, consider if this is appropriate
      }
    }
  }

  if (truck.current_mammographer_id) {
    const { data: mamUser } = await supabase
      .from("users")
      .select("id, name")
      .eq("id", truck.current_mammographer_id)
      .single()

    const { data: mamTimeEntry } = await supabase
      .from("time_entries")
      .select("sign_in_time")
      .eq("user_id", truck.current_mammographer_id)
      .eq("truck_id", truckId)
      .is("sign_out_time", null)
      .order("sign_in_time", { ascending: false })
      .limit(1)
      .single()

    if (mamUser && mamTimeEntry) {
      truckStatus.currentMammographer = {
        userId: mamUser.id,
        userName: mamUser.name,
        signInTime: mamTimeEntry.sign_in_time,
      }
    } else if (mamUser) {
      truckStatus.currentMammographer = {
        userId: mamUser.id,
        userName: mamUser.name,
        signInTime: new Date().toISOString(), // Fallback
      }
    }
  }
  return truckStatus
}

export async function getAllTruckStatuses(): Promise<TruckStatus[]> {
  const supabase = getSupabaseClient()
  const { data: trucks, error } = await supabase.from("trucks").select("*")
  handleError(error, "getAllTruckStatuses (trucks)")
  if (!trucks) return []

  const statuses: TruckStatus[] = []
  for (const truck of trucks) {
    const status = await getTruckStatus(truck.id)
    if (status) statuses.push(status)
  }
  return statuses
}

// Updated signIn function to handle notes/comments
export async function signIn(userId: string, truckId: string, password: string, notes?: string): Promise<TimeEntry> {
  const supabase = getSupabaseClient()

  // Verify password first
  const isPasswordValid = await verifyUserPassword(userId, password)
  if (!isPasswordValid) {
    throw new Error("Invalid password")
  }

  const user = await getUserById(userId)
  if (!user) throw new Error("User not found")

  const { data: truck, error: truckError } = await supabase.from("trucks").select("*").eq("id", truckId).single()
  handleError(truckError, `signIn (truck check) for truck ${truckId}`)
  if (!truck) throw new Error("Truck not found")

  const { data: existingEntry, error: existingEntryError } = await supabase
    .from("time_entries")
    .select("id")
    .eq("user_id", userId)
    .is("sign_out_time", null)
    .limit(1)
  handleError(existingEntryError, `signIn (existing entry check) for user ${userId}`)
  if (existingEntry && existingEntry.length > 0) throw new Error("User is already signed in")

  if (user.role === "driver" || user.role === "locum_driver") {
    if (truck.current_driver_id) throw new Error("Truck already has a driver signed in")
  } else if (user.role === "mammographer") {
    if (truck.current_mammographer_id) throw new Error("Truck already has a mammographer signed in")
  }

  const signInTime = new Date().toISOString()
  const { data: newTimeEntry, error: insertError } = await supabase
    .from("time_entries")
    .insert({ user_id: userId, truck_id: truckId, sign_in_time: signInTime, is_auto_sign_out: false })
    .select()
    .single()
  handleError(insertError, `signIn (insert time_entry) for user ${userId}`)
  if (!newTimeEntry) throw new Error("Failed to create time entry")

  // Update user_truck_assignments with comments if provided
  if (notes && notes.trim()) {
    console.log(`[signIn] Updating user_truck_assignments with notes for user ${userId}, truck ${truckId}`)
    const { error: updateCommentsError } = await supabase
      .from("user_truck_assignments")
      .update({
        comments: notes.trim(),
        assigned_at: signInTime, // Update the timestamp as well
      })
      .eq("user_id", userId)
      .eq("truck_id", truckId)

    if (updateCommentsError) {
      console.error(`[signIn] Error updating comments:`, updateCommentsError)
      // Don't throw error here as the sign-in was successful, just log the issue
    } else {
      console.log(`[signIn] Successfully updated comments for user ${userId}, truck ${truckId}`)
    }
  }

  const truckUpdatePayload: Partial<Truck> = {}
  if (user.role === "driver" || user.role === "locum_driver") truckUpdatePayload.current_driver_id = userId
  else if (user.role === "mammographer") truckUpdatePayload.current_mammographer_id = userId
  truckUpdatePayload.updated_at = new Date().toISOString()

  const { error: updateTruckError } = await supabase.from("trucks").update(truckUpdatePayload).eq("id", truckId)
  handleError(updateTruckError, `signIn (update truck) for truck ${truckId}`)
  return { ...newTimeEntry, userName: user.name, userRole: user.role as TimeEntry["userRole"] }
}

export async function signOut(userId: string, password: string, isAutoSignOut = false): Promise<TimeEntry> {
  console.log(`[signOut] Starting sign out process for user ${userId}, isAutoSignOut: ${isAutoSignOut}`)
  const supabase = getSupabaseClient()

  // First check if the user exists
  const { data: userExists, error: userExistsError } = await supabase.from("users").select("id, role").eq("id", userId)

  if (userExistsError) {
    console.error(`[signOut] Error checking if user exists:`, userExistsError)
    throw new Error(`Error checking if user exists: ${userExistsError.message}`)
  }

  if (!userExists || userExists.length === 0) {
    console.error(`[signOut] User ${userId} not found in database`)
    throw new Error(`User not found in database`)
  }

  const userRole = userExists[0].role
  console.log(`[signOut] Found user ${userId} with role ${userRole}`)

  // Verify password first (unless it's an auto sign out)
  if (!isAutoSignOut) {
    console.log(`[signOut] Verifying password for user ${userId}`)
    try {
      const isPasswordValid = await verifyUserPassword(userId, password)
      if (!isPasswordValid) {
        console.error(`[signOut] Password verification failed for user ${userId}`)
        throw new Error("Invalid password")
      }
      console.log(`[signOut] Password verification successful for user ${userId}`)
    } catch (error) {
      console.error(`[signOut] Password verification error for user ${userId}:`, (error as Error).message)
      throw error
    }
  }

  // Find active time entry
  console.log(`[signOut] Looking for active time entry for user ${userId}`)
  const { data: activeEntries, error: activeEntriesError } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .is("sign_out_time", null)
    .order("sign_in_time", { ascending: false })

  if (activeEntriesError) {
    console.error(`[signOut] Error finding active entries for user ${userId}:`, activeEntriesError)
    throw new Error(`Error finding active entries: ${activeEntriesError.message}`)
  }

  if (!activeEntries || activeEntries.length === 0) {
    console.error(`[signOut] No active sign-in found for user ${userId}`)
    throw new Error("No active sign-in found for user")
  }

  // Use the most recent active entry
  const activeEntry = activeEntries[0]

  console.log(`[signOut] Found active entry for user ${userId}:`, {
    entryId: activeEntry.id,
    truckId: activeEntry.truck_id,
    signInTime: activeEntry.sign_in_time,
  })

  // Calculate total hours and update time entry
  const signOutTime = new Date()
  const totalHours = (signOutTime.getTime() - new Date(activeEntry.sign_in_time).getTime()) / (1000 * 60 * 60)

  console.log(`[signOut] Updating time entry ${activeEntry.id} with sign out time`)
  const { data: updatedEntry, error: updateError } = await supabase
    .from("time_entries")
    .update({
      sign_out_time: signOutTime.toISOString(),
      is_auto_sign_out: isAutoSignOut,
      total_hours: Math.round(totalHours * 100) / 100,
      updated_at: signOutTime.toISOString(),
    })
    .eq("id", activeEntry.id)
    .select()
    .single()

  if (updateError) {
    console.error(`[signOut] Error updating time entry ${activeEntry.id}:`, updateError)
    throw new Error(`Error updating time entry: ${updateError.message}`)
  }

  if (!updatedEntry) {
    console.error(`[signOut] Failed to update time entry for sign out`)
    throw new Error("Failed to update time entry for sign out")
  }

  console.log(`[signOut] Successfully updated time entry ${activeEntry.id}`)

  // Update truck status based on the user role we already retrieved
  const truckUpdatePayload: Partial<Truck> = {}
  if (userRole === "driver" || userRole === "locum_driver") {
    console.log(`[signOut] Clearing current_driver_id for truck ${activeEntry.truck_id}`)
    truckUpdatePayload.current_driver_id = null
  } else if (userRole === "mammographer") {
    console.log(`[signOut] Clearing current_mammographer_id for truck ${activeEntry.truck_id}`)
    truckUpdatePayload.current_mammographer_id = null
  }
  truckUpdatePayload.updated_at = signOutTime.toISOString()

  console.log(`[signOut] Updating truck ${activeEntry.truck_id} with payload:`, truckUpdatePayload)
  const { error: updateTruckError } = await supabase
    .from("trucks")
    .update(truckUpdatePayload)
    .eq("id", activeEntry.truck_id)

  if (updateTruckError) {
    console.error(`[signOut] Error updating truck ${activeEntry.truck_id}:`, updateTruckError)
    throw new Error(`Error updating truck: ${updateTruckError.message}`)
  }

  console.log(`[signOut] Successfully updated truck ${activeEntry.truck_id}`)
  console.log(`[signOut] Sign out process completed successfully for user ${userId}`)

  // Get user name for the response
  const { data: userData } = await supabase.from("users").select("name").eq("id", userId).single()

  return {
    ...updatedEntry,
    userName: userData?.name || "Unknown User",
    userRole: userRole as TimeEntry["userRole"],
  }
}

// Add this debugging function at the top of the file
function debugTimeEntry(entry: any, context: string) {
  if (
    entry &&
    (entry.id === "babfa755-d385-4988-aedb-fd346a43c605" ||
      entry.id === "fcf3e6de-f1e7-4775-bfa5-fee23c04f008" ||
      entry.userName === "George Skosana" ||
      entry.userName === "Damon" ||
      entry.userName === "Lea Riba")
  ) {
    console.log(
      `[DEBUG ${context}] Entry ${entry.id} for ${entry.userName || "unknown"}:`,
      JSON.stringify({
        id: entry.id,
        userName: entry.userName,
        sign_in_time: entry.sign_in_time,
        signInTime: entry.signInTime,
        sign_out_time: entry.sign_out_time,
        signOutTime: entry.signOutTime,
        totalHours: entry.totalHours,
        truckId: entry.truck_id || entry.truckId,
      }),
    )
  }
}

// Then update the getTimeEntries function
export async function getTimeEntries(filters?: {
  userId?: string
  truckId?: string
  startDate?: Date
  endDate?: Date
}): Promise<TimeEntry[]> {
  const supabase = getSupabaseClient()
  console.log("[getTimeEntries] Starting query with filters:", JSON.stringify(filters || {}))

  let query = supabase.from("time_entries").select("*, users (name, role)")

  if (filters?.userId && filters.userId !== "all") query = query.eq("user_id", filters.userId)
  if (filters?.truckId && filters.truckId !== "all") query = query.eq("truck_id", filters.truckId)
  if (filters?.startDate) query = query.gte("sign_in_time", filters.startDate.toISOString())
  if (filters?.endDate) {
    const inclusiveEndDate = new Date(filters.endDate)
    inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1) // Make endDate inclusive
    query = query.lt("sign_in_time", inclusiveEndDate.toISOString())
  }
  query = query.order("sign_in_time", { ascending: false })

  const { data, error } = await query
  handleError(error, "getTimeEntries")

  console.log(`[getTimeEntries] Retrieved ${data?.length || 0} entries`)

  // Log the raw data for debugging
  if (data && data.length > 0) {
    console.log("[getTimeEntries] First entry raw data:", JSON.stringify(data[0]))
  }

  // Transform the data to ensure consistent property names
  const transformedData = (data || []).map((entry: any) => {
    const transformed = {
      id: entry.id,
      user_id: entry.user_id,
      truck_id: entry.truck_id,
      signInTime: entry.sign_in_time,
      signOutTime: entry.sign_out_time,
      isAutoSignOut: entry.is_auto_sign_out,
      totalHours: entry.total_hours,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      userName: entry.users?.name,
      userRole: entry.users?.role,
    }

    debugTimeEntry(transformed, "After Transform")
    return transformed
  })

  return transformedData
}

export async function addUser(userData: {
  name: string
  role: User["role"]
  assignedTrucks: string[]
  is_active?: boolean
  password?: string
}): Promise<User> {
  const supabase = getSupabaseClient()
  const { name, role, assignedTrucks, is_active = true, password } = userData

  // Validate password if provided
  if (password) {
    const validation = validatePassword(password)
    if (!validation.isValid) {
      throw new Error(validation.message)
    }
  }

  const { data: newUser, error: userInsertError } = await supabase
    .from("users")
    .insert({ name, role, is_active, password })
    .select()
    .single()
  handleError(userInsertError, "addUser (insert user)")
  if (!newUser) throw new Error("Failed to create user")

  if (assignedTrucks && assignedTrucks.length > 0) {
    const assignments = assignedTrucks.map((truckId) => ({ user_id: newUser.id, truck_id: truckId }))
    const { error: assignmentError } = await supabase.from("user_truck_assignments").insert(assignments)
    handleError(assignmentError, "addUser (assign trucks)")
  }
  return { ...newUser, assignedTrucks }
}

// Fix the updateUser function to preserve password when not explicitly changed
export async function updateUser(
  userId: string,
  updates: {
    name?: string
    role?: User["role"]
    assignedTrucks?: string[]
    is_active?: boolean
    password?: string | null
  },
): Promise<User> {
  const supabase = getSupabaseClient()
  const { name, role, assignedTrucks, is_active, password } = updates

  // Only include password in the update if it was explicitly provided
  const userUpdatePayload: Partial<Omit<User, "id" | "created_at" | "updated_at" | "assignedTrucks">> = {}
  if (name !== undefined) userUpdatePayload.name = name
  if (role !== undefined) userUpdatePayload.role = role
  if (is_active !== undefined) userUpdatePayload.is_active = is_active
  if (password !== undefined) userUpdatePayload.password = password // Only update if explicitly provided
  userUpdatePayload.updated_at = new Date().toISOString()

  if (Object.keys(userUpdatePayload).length > 1) {
    // only update if there's something to update besides timestamp
    const { data: updatedUser, error: userUpdateError } = await supabase
      .from("users")
      .update(userUpdatePayload)
      .eq("id", userId)
      .select()
      .single()
    handleError(userUpdateError, `updateUser (update user details) for ${userId}`)
    if (!updatedUser) throw new Error("Failed to update user details")
  }

  if (assignedTrucks !== undefined) {
    const { error: deleteError } = await supabase.from("user_truck_assignments").delete().eq("user_id", userId)
    handleError(deleteError, `updateUser (delete old assignments) for ${userId}`)
    if (assignedTrucks.length > 0) {
      const newAssignments = assignedTrucks.map((truckId) => ({ user_id: userId, truck_id: truckId }))
      const { error: insertError } = await supabase.from("user_truck_assignments").insert(newAssignments)
      handleError(insertError, `updateUser (insert new assignments) for ${userId}`)
    }
  }

  const finalUser = await getUserById(userId) // Fetch the user again to get consolidated data
  if (!finalUser) throw new Error("Failed to fetch user after update")

  // Fetch final assignments to ensure the returned user object is complete
  const { data: finalAssignmentsData, error: finalAssignmentsError } = await supabase
    .from("user_truck_assignments")
    .select("truck_id")
    .eq("user_id", userId)
  handleError(finalAssignmentsError, `updateUser (fetch final assignments) for ${userId}`)

  return { ...finalUser, assignedTrucks: finalAssignmentsData?.map((a) => a.truck_id) || [] }
}

export async function deleteUser(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  // Remove assignments first
  const { error: assignmentError } = await supabase.from("user_truck_assignments").delete().eq("user_id", userId)
  handleError(assignmentError, `deleteUser (assignments) for ${userId}`)

  // Clear from current_driver_id or current_mammographer_id in trucks table
  await supabase
    .from("trucks")
    .update({ current_driver_id: null, updated_at: new Date().toISOString() })
    .eq("current_driver_id", userId)
  await supabase
    .from("trucks")
    .update({ current_mammographer_id: null, updated_at: new Date().toISOString() })
    .eq("current_mammographer_id", userId)
  const { error: timeEntryError } = await supabase.from("time_entries").delete().eq("user_id", userId)
  handleError(timeEntryError, `deleteUser (time_entries) for ${userId}`)
  const { error: userError } = await supabase.from("users").delete().eq("id", userId)
  handleError(userError, `deleteUser (user) for ${userId}`)
  return true
}

export async function getUserAssignedTrucks(userId: string): Promise<string[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("user_truck_assignments").select("truck_id").eq("user_id", userId)
  handleError(error, `getUserAssignedTrucks for ${userId}`)
  return data ? data.map((item) => item.truck_id) : []
}

export async function performAutoSignOut(): Promise<void> {
  const supabase = getSupabaseClient()
  const now = new Date()
  const cutoffTime = new Date()
  cutoffTime.setHours(20, 0, 0, 0)
  if (now < cutoffTime) return

  // Perform cleanup of old entries before auto sign out
  try {
    await cleanupOldTimeEntries()
  } catch (error) {
    console.error(`[performAutoSignOut] Error during cleanup:`, (error as Error).message)
    // Continue with auto sign out even if cleanup fails
  }

  const { data: activeEntries, error } = await supabase
    .from("time_entries")
    .select("id, user_id, sign_in_time")
    .is("sign_out_time", null)
    .lt("sign_in_time", cutoffTime.toISOString())
  handleError(error, "performAutoSignOut (fetch active entries)")
  if (activeEntries && activeEntries.length > 0) {
    for (const entry of activeEntries) {
      try {
        console.log(`Auto-signing out user ${entry.user_id} for entry ${entry.id}`)
        await signOut(entry.user_id, "", true) // Empty password for auto sign out
      } catch (e) {
        console.error(`Failed to auto-sign out user ${entry.user_id}:`, (e as Error).message)
      }
    }
  }
}
