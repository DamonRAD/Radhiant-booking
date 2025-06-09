// Matches users table
export interface User {
  id: string // uuid
  name: string
  role: "driver" | "mammographer" | "locum_driver" | "it"
  is_active: boolean
  created_at: string // timestamptz
  updated_at: string // timestamptz
  // assignedTrucks will be fetched separately or via a join
  assignedTrucks?: string[] // For convenience in application logic
}
