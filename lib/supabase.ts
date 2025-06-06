import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Province {
  id: string
  name: string
  created_at: string
}

export interface Town {
  id: string
  name: string
  province_id: string
  created_at: string
}

export interface Van {
  id: string
  name: string
  location: string
  capabilities: string[]
  town_id: string
  created_at: string
}

export interface ServiceType {
  id: string
  name: string
  description: string
  duration: number
  created_at: string
}

export interface Appointment {
  id: string
  van_id: string
  service_type_id: string
  appointment_date: string
  appointment_time: string
  patient_details: {
    firstName: string
    lastName: string
    idNumber: string
    phone: string
    email: string
  }
  special_requirements: string
  status: "pending" | "confirmed" | "cancelled"
  created_at: string
}
