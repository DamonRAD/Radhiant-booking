// Matches users table
export interface User {
  id: string // uuid
  name: string
  role: "driver" | "mammographer" | "locum_driver" | "it"
  is_active: boolean
  password?: string | null // Added password field
  created_at: string // timestamptz
  updated_at: string // timestamptz
  // assignedTrucks will be fetched separately or via a join
  assignedTrucks?: string[] // For convenience in application logic
}

// Matches time_entries table
export interface TimeEntry {
  id: string // uuid
  user_id: string
  truck_id: string
  sign_in_time: string // timestamptz
  sign_out_time?: string | null // timestamptz
  is_auto_sign_out: boolean
  total_hours?: number | null
  created_at: string // timestamptz
  updated_at: string // timestamptz
  // For convenience, to avoid extra lookups if joined
  userName?: string
  userRole?: "driver" | "mammographer" | "locum_driver"
}

// Matches trucks table
export interface Truck {
  id: string // varchar, e.g., "RAD-1"
  name: string
  current_driver_id?: string | null // uuid
  current_mammographer_id?: string | null // uuid
  created_at: string // timestamptz
  updated_at: string // timestamptz
}

// For truck status, combining truck info with user names
export interface TruckStatus extends Truck {
  currentDriver?: {
    userId: string
    userName: string
    signInTime: string // from time_entries
  }
  currentMammographer?: {
    userId: string
    userName: string
    signInTime: string // from time_entries
  }
}

// Matches user_truck_assignment table - updated to include comments
export interface UserTruckAssignment {
  user_id: string
  truck_id: string
  assigned_at: string // timestamptz
  comments?: string | null // Added comments field
}
