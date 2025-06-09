"use server"

import {
  signIn as dbSignIn,
  signOut as dbSignOut,
  getUsersForTruck as dbGetUsersForTruck,
  getTruckStatus,
  getTimeEntries,
  addUser,
  updateUser,
  deleteUser,
  getUsers as dbGetUsers,
  getUserAssignedTrucks,
} from "./database"
import { revalidatePath } from "next/cache"
import type { User } from "@/app/types"

// Updated signIn action to handle notes
export async function signIn(userId: string, truckId: string, password: string, notes?: string) {
  console.log(`[signIn Action] Attempting sign in for user ${userId} on truck ${truckId}`)
  try {
    const result = await dbSignIn(userId, truckId, password, notes)
    console.log(`[signIn Action] Sign in successful for user ${userId}`)
    revalidatePath(`/truck/${truckId}`)
    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, data: result }
  } catch (error) {
    console.error(`[signIn Action] Sign in failed for user ${userId}:`, (error as Error).message)
    return { success: false, error: (error as Error).message }
  }
}

export async function signOut(userId: string, password: string) {
  console.log(`[signOut Action] Attempting sign out for user ${userId}`)
  try {
    const result = await dbSignOut(userId, password)
    console.log(`[signOut Action] Sign out successful for user ${userId}`)
    revalidatePath(`/truck/${result.truck_id || result.truckId}`)
    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, data: result }
  } catch (error) {
    console.error(`[signOut Action] Sign out failed for user ${userId}:`, (error as Error).message)
    return { success: false, error: (error as Error).message }
  }
}

export async function getTruckData(truckId: string) {
  const rawDrivers = await dbGetUsersForTruck(truckId, "driver")
  const rawLocums = await dbGetUsersForTruck(truckId, "locum_driver")
  const rawMammographers = await dbGetUsersForTruck(truckId, "mammographer")

  const status = await getTruckStatus(truckId)

  const populateAssignments = async (users: User[]) => {
    return Promise.all(
      users.map(async (user) => ({
        ...user,
        assignedTrucks: await getUserAssignedTrucks(user.id),
      })),
    )
  }

  return {
    drivers: await populateAssignments([...rawDrivers, ...rawLocums]),
    mammographers: await populateAssignments(rawMammographers),
    status,
  }
}

export async function getReportData(filters: {
  startDate?: string
  endDate?: string
  userId?: string
  truckId?: string
}) {
  console.log("[getReportData] Called with filters:", JSON.stringify(filters))

  const startDate = filters.startDate ? new Date(filters.startDate) : undefined
  const endDate = filters.endDate ? new Date(filters.endDate) : undefined

  const entries = await getTimeEntries({
    ...filters,
    startDate,
    endDate,
  })

  console.log(`[getReportData] Retrieved ${entries.length} entries`)

  // Log a sample entry for debugging
  if (entries.length > 0) {
    console.log("[getReportData] Sample entry:", JSON.stringify(entries[0]))
  }

  return entries
}

export async function createUser(userData: {
  name: string
  role: "driver" | "mammographer" | "locum_driver"
  assignedTrucks: string[]
  password?: string
}) {
  try {
    const result = await addUser({ ...userData, isActive: true })
    revalidatePath("/admin")
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function editUser(
  userId: string,
  userData: {
    name: string
    role: "driver" | "mammographer" | "locum_driver"
    assignedTrucks: string[]
    isActive: boolean
    password?: string | null
  },
) {
  try {
    const result = await updateUser(userId, userData)
    revalidatePath("/admin")
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function removeUser(userId: string) {
  try {
    await deleteUser(userId)
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getAllUsers() {
  // This is the function called by admin page
  const users = await dbGetUsers() // from ./database
  const usersWithAssignments = await Promise.all(
    users.map(async (user) => {
      const assignedTrucks = await getUserAssignedTrucks(user.id)
      return { ...user, assignedTrucks: assignedTrucks || [] } // Ensure assignedTrucks is always an array
    }),
  )
  return usersWithAssignments
}
