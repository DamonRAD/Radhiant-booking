import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface BookingRecord {
  id?: string
  patient_name: string
  first_name: string
  last_name: string
  id_number: string
  email: string
  phone: string
  province: string
  town: string
  service_type: string
  appointment_date: string
  appointment_time: string
  estimated_duration: number
  special_notes?: string
  van_id: string
  van_name: string
  van_location: string
  status: "confirmed" | "pending" | "cancelled"
  booking_reference: string
  created_at?: string
  updated_at?: string
}
