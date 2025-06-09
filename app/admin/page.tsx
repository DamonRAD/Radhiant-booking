import { getAllUsers } from "@/lib/actions"
import AdminInterface from "./admin-interface"

export default async function AdminPage() {
  const users = await getAllUsers() // This now calls the action that includes assignments.

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <AdminInterface users={users} />
      </div>
    </div>
  )
}
