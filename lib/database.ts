import { supabase } from "./supabase"
import type { Province, Town, Van, ServiceType, Appointment } from "./supabase"

// Fetch all provinces
export async function getProvinces(): Promise<Province[]> {
  const { data, error } = await supabase.from("provinces").select("*").order("name")

  if (error) {
    console.error("Error fetching provinces:", error)
    return []
  }

  return data || []
}

// Fetch towns for a specific province
export async function getTownsByProvince(provinceName: string): Promise<Town[]> {
  const { data, error } = await supabase
    .from("towns")
    .select(`
      *,
      provinces!inner(name)
    `)
    .eq("provinces.name", provinceName)
    .order("name")

  if (error) {
    console.error("Error fetching towns:", error)
    return []
  }

  return data || []
}

// Fetch van for a specific town
export async function getVanByTown(townName: string): Promise<Van | null> {
  const { data, error } = await supabase
    .from("vans")
    .select(`
      *,
      towns!inner(name)
    `)
    .eq("towns.name", townName)
    .single()

  if (error) {
    console.error("Error fetching van:", error)
    return null
  }

  return data
}

// Fetch available service types for a van
export async function getServiceTypes(): Promise<ServiceType[]> {
  const { data, error } = await supabase.from("service_types").select("*").order("name")

  if (error) {
    console.error("Error fetching service types:", error)
    return []
  }

  return data || []
}

// Check available time slots for a date and van
export async function getAvailableSlots(vanId: string, date: string): Promise<string[]> {
  // Get all booked slots for this van on this date
  const { data: bookedSlots, error } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("van_id", vanId)
    .eq("appointment_date", date)
    .eq("status", "confirmed")

  if (error) {
    console.error("Error fetching booked slots:", error)
    return []
  }

  // All possible time slots (15-minute intervals)
  const allSlots = [
    "08:00",
    "08:15",
    "08:30",
    "08:45",
    "09:00",
    "09:15",
    "09:30",
    "09:45",
    "10:00",
    "10:15",
    "10:30",
    "10:45",
    "11:00",
    "11:15",
    "11:30",
    "11:45",
    "13:00",
    "13:15",
    "13:30",
    "13:45",
    "14:00",
    "14:15",
    "14:30",
    "14:45",
    "15:00",
    "15:15",
    "15:30",
    "15:45",
    "16:00",
    "16:15",
    "16:30",
    "16:45",
  ]

  // Filter out booked slots
  const bookedTimes = bookedSlots?.map((slot) => slot.appointment_time) || []
  return allSlots.filter((slot) => !bookedTimes.includes(slot))
}

// Create a new appointment
export async function createAppointment(
  appointmentData: Omit<Appointment, "id" | "created_at" | "status">,
): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      ...appointmentData,
      status: "confirmed",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating appointment:", error)
    return null
  }

  return data
}

// Get appointment count for a specific date and van
export async function getDateAvailability(vanId: string, date: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("appointment_time")
    .eq("van_id", vanId)
    .eq("appointment_date", date)
    .eq("status", "confirmed")

  if (error) {
    console.error("Error fetching date availability:", error)
    return { totalSlots: 0, bookedSlots: 0, availableSlots: 0 }
  }

  const totalSlots = 32 // Total possible slots per day
  const bookedSlots = data?.length || 0
  const availableSlots = totalSlots - bookedSlots

  return {
    totalSlots,
    bookedSlots,
    availableSlots,
  }
}
