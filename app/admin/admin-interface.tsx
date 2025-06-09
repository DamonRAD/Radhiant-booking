"use client"

import { CommandItem } from "@/components/ui/command"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { createUser, editUser, removeUser, getReportData } from "@/lib/actions"
import { validatePassword } from "@/lib/database"
import type { User, TimeEntry } from "@/lib/types"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  FileText,
  Download,
  UserCheck,
  UserCog,
  UserPlus,
  Filter,
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  ChevronDown,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminInterfaceProps {
  users: User[]
}

type UserRoleTab = "driver" | "mammographer" | "locum_driver"
type AdminTab = "users" | "reports"
type ReportUserRoleFilter = "all" | "driver" | "mammographer" | "locum_driver"

const TRUCKS = ["RAD-1", "RAD-2", "RAD-3", "RAD-4", "RAD-5", "RAD-6", "RAD-7"]
const USER_ROLES_FOR_REPORT_FILTER: { value: ReportUserRoleFilter; label: string }[] = [
  { value: "all", label: "All Roles" },
  { value: "driver", label: "Driver" },
  { value: "mammographer", label: "Mammographer" },
  { value: "locum_driver", label: "Locum Driver" },
]

export default function AdminInterface({ users: initialUsers }: AdminInterfaceProps) {
  const router = useRouter()
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("users")
  const [activeUserRoleTab, setActiveUserRoleTab] = useState<UserRoleTab>("driver")

  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null) // Changed to track specific user ID
  const [reportData, setReportData] = useState<TimeEntry[]>([])
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers)

  const [mammographerTruckFilter, setMammographerTruckFilter] = useState<string>("all")
  const [showPassword, setShowPassword] = useState(false)
  const [userSearchOpen, setUserSearchOpen] = useState(false)

  const [reportFilters, setReportFilters] = useState({
    startDate: "",
    endDate: "",
    role: "all" as ReportUserRoleFilter,
    userId: "all",
    truckId: "all",
  })

  useEffect(() => {
    setAllUsers(initialUsers)
  }, [initialUsers])

  const [userForm, setUserForm] = useState({
    name: "",
    role: "driver" as "driver" | "mammographer" | "locum_driver",
    assignedTrucks: [] as string[],
    isActive: true,
    password: "",
  })

  const resetUserForm = () => {
    setUserForm({
      name: "",
      role: activeUserRoleTab,
      assignedTrucks: [],
      isActive: true,
      password: "",
    })
    setEditingUserId(null)
    setShowUserForm(false)
    setShowPassword(false)
  }

  const handleUserFormSubmit = async () => {
    // Only validate password if it's provided and not empty
    if (userForm.password && userForm.password.trim() !== "") {
      const validation = validatePassword(userForm.password)
      if (!validation.isValid) {
        alert(validation.message)
        return
      }
    }

    // When editing, only include password in the payload if it's not empty
    const payload = editingUserId
      ? [
          editingUserId,
          {
            ...userForm,
            // Only include password if it's not empty, otherwise don't change it
            password: userForm.password.trim() !== "" ? userForm.password : undefined,
          },
        ]
      : [userForm]

    // @ts-ignore
    const result = await (editingUserId ? editUser : createUser)(...payload)

    if (result.success) {
      if (editingUserId) {
        setAllUsers((prevUsers) => prevUsers.map((u) => (u.id === editingUserId ? { ...userForm, ...result.data } : u)))
      } else {
        setAllUsers((prevUsers) => [...prevUsers, result.data as User])
      }
      resetUserForm()
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const result = await removeUser(userId)
      if (result.success) {
        setAllUsers(allUsers.filter((u) => u.id !== userId))
        router.refresh()
      } else {
        alert(result.error)
      }
    }
  }

  const startEditUser = (user: User) => {
    setEditingUserId(user.id)
    setUserForm({
      name: user.name,
      role: user.role as "driver" | "mammographer" | "locum_driver",
      assignedTrucks: user.assignedTrucks || [],
      isActive: user.isActive,
      password: "", // Don't pre-fill password for security
    })
    setActiveUserRoleTab(user.role as UserRoleTab)
    setShowUserForm(false) // Don't show the main form when editing inline
  }

  const handleClearPassword = async (userId: string) => {
    if (
      confirm(
        "Are you sure you want to remove this user's password? They will not be able to sign in until a new password is set.",
      )
    ) {
      const user = allUsers.find((u) => u.id === userId)
      if (!user) return

      const result = await editUser(userId, {
        name: user.name,
        role: user.role as "driver" | "mammographer" | "locum_driver",
        assignedTrucks: user.assignedTrucks || [],
        isActive: user.isActive,
        password: null,
      })

      if (result.success) {
        setAllUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? { ...u, password: null } : u)))
        router.refresh()
      } else {
        alert(result.error)
      }
    }
  }

  const handleGenerateReport = async () => {
    // Validate that required filters are selected
    if (!reportFilters.startDate || !reportFilters.endDate) {
      alert("Please select both start and end dates to generate a report.")
      return
    }

    if (reportFilters.role === "all") {
      alert("Please select a specific role to generate a report.")
      return
    }

    console.log("[AdminInterface] Generating report with filters:", reportFilters)
    const result = await getReportData({
      startDate: reportFilters.startDate,
      endDate: reportFilters.endDate,
      truckId: reportFilters.truckId === "all" ? undefined : reportFilters.truckId,
      userId: reportFilters.userId === "all" ? undefined : reportFilters.userId,
    })
    console.log("[AdminInterface] Report data received:", result.length, "entries")
    setReportData(result)
  }

  const exportToCSV = () => {
    if (reportData.length === 0) {
      alert("No report data to export. Please generate a report first.")
      return
    }

    const headers = ["Name", "Role", "Truck", "Date", "Sign In", "Sign Out", "Total Hours", "Auto Sign Out"]
    const rows = reportData.map((entry) => [
      entry.userName || "N/A",
      entry.userRole || "N/A",
      entry.truck_id || entry.truckId,
      new Date(entry.signInTime).toLocaleDateString(),
      new Date(entry.signInTime).toLocaleTimeString(),
      entry.signOutTime ? new Date(entry.signOutTime).toLocaleTimeString() : "",
      entry.totalHours?.toFixed(2) || "",
      entry.isAutoSignOut ? "Yes" : "No",
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `time-attendance-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatTime = (dateInput: Date | string | undefined | null): string => {
    if (!dateInput) return ""
    try {
      const dateObj = new Date(dateInput)
      if (isNaN(dateObj.getTime())) {
        console.error("Invalid date input:", dateInput)
        return ""
      }
      return dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    } catch (error) {
      console.error("Error formatting time:", error, "Input:", dateInput)
      return ""
    }
  }

  const formatDate = (dateInput: Date | string | undefined | null): string => {
    if (!dateInput) return ""
    try {
      const dateObj = new Date(dateInput)
      if (isNaN(dateObj.getTime())) {
        console.error("Invalid date input:", dateInput)
        return ""
      }
      return dateObj.toLocaleDateString("en-US")
    } catch (error) {
      console.error("Error formatting date:", error, "Input:", dateInput)
      return ""
    }
  }

  const displayedUsers = useMemo(() => {
    let usersToDisplay = allUsers.filter((user) => user.role === activeUserRoleTab && user.role !== "it")
    if (activeUserRoleTab === "mammographer" && mammographerTruckFilter !== "all") {
      usersToDisplay = usersToDisplay.filter(
        (user) => user.assignedTrucks && user.assignedTrucks.includes(mammographerTruckFilter),
      )
    }
    return usersToDisplay
  }, [allUsers, activeUserRoleTab, mammographerTruckFilter])

  const usersForReportNameFilter = useMemo(() => {
    let filteredUsers = allUsers.filter((u) => u.role !== "it")

    // Filter by role if not "all"
    if (reportFilters.role !== "all") {
      filteredUsers = filteredUsers.filter((u) => u.role === reportFilters.role)
    }

    // Filter by truck if not "all"
    if (reportFilters.truckId !== "all") {
      filteredUsers = filteredUsers.filter((u) => u.assignedTrucks && u.assignedTrucks.includes(reportFilters.truckId))
    }

    return filteredUsers
  }, [allUsers, reportFilters.role, reportFilters.truckId])

  const openAddUserFormForCurrentTab = () => {
    resetUserForm()
    setUserForm((prev) => ({ ...prev, role: activeUserRoleTab }))
    setShowUserForm(true)
  }

  return (
    <div className="space-y-6 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md">
      <header className="py-4 mb-6 flex flex-col items-center bg-radhiant-blue rounded-lg shadow-md">
        <Image src="/radhiant-logo-white-text.png" alt="Radhiant Diagnostic Imaging" width={200} height={56} />
        <h1 className="text-3xl font-bold text-white mt-3">Admin Panel</h1>
        <p className="text-radhiant-lightBlue">Manage users and generate reports</p>
      </header>
      <div className="flex justify-center space-x-4 border-b-2 border-radhiant-green pb-2">
        <Button
          variant={activeAdminTab === "users" ? "default" : "ghost"}
          onClick={() => setActiveAdminTab("users")}
          className={`flex items-center gap-2 ${activeAdminTab === "users" ? "bg-radhiant-green text-white" : "text-radhiant-blue hover:bg-radhiant-blue/10"}`}
        >
          <Users className="h-4 w-4" />
          User Management
        </Button>
        <Button
          variant={activeAdminTab === "reports" ? "default" : "ghost"}
          onClick={() => setActiveAdminTab("reports")}
          className={`flex items-center gap-2 ${activeAdminTab === "reports" ? "bg-radhiant-green text-white" : "text-radhiant-blue hover:bg-radhiant-blue/10"}`}
        >
          <FileText className="h-4 w-4" />
          Reports
        </Button>
      </div>

      {/* User Management Tab Content */}
      {activeAdminTab === "users" && (
        <div className="space-y-6">
          {/* User Role Tab Navigation */}
          <div className="flex justify-center space-x-2 sm:space-x-4 bg-white p-2 rounded-md shadow">
            {(["driver", "mammographer", "locum_driver"] as UserRoleTab[]).map((role) => (
              <Button
                key={role}
                variant={activeUserRoleTab === role ? "default" : "outline"}
                onClick={() => {
                  setActiveUserRoleTab(role)
                  setShowUserForm(false)
                  setEditingUserId(null)
                  if (role !== "mammographer") setMammographerTruckFilter("all")
                }}
                className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 ${activeUserRoleTab === role ? "bg-radhiant-green text-white" : "text-radhiant-green border-radhiant-green hover:bg-radhiant-green/10"}`}
              >
                {role === "driver" && <UserCog className="h-3 w-3 sm:h-4 sm:w-4" />}
                {role === "mammographer" && <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />}
                {role === "locum_driver" && <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />}
                {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}s
              </Button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-radhiant-blue">
              {activeUserRoleTab.charAt(0).toUpperCase() + activeUserRoleTab.slice(1).replace("_", " ")}s
              {activeUserRoleTab === "mammographer" &&
                mammographerTruckFilter !== "all" &&
                ` (Truck: ${mammographerTruckFilter})`}
            </h2>
            <Button
              onClick={openAddUserFormForCurrentTab}
              className="flex items-center gap-2 bg-radhiant-green hover:bg-radhiant-green/90 text-white"
            >
              <Plus className="h-4 w-4" />
              Add {activeUserRoleTab.replace("_", " ")}
            </Button>
          </div>

          {/* Mammographer Truck Filter */}
          {activeUserRoleTab === "mammographer" && (
            <Card className="bg-white">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-md flex items-center gap-2 text-radhiant-blue">
                  <Filter className="h-4 w-4" />
                  Filter by Truck
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <Select value={mammographerTruckFilter} onValueChange={setMammographerTruckFilter}>
                  <SelectTrigger className="border-radhiant-green focus:border-radhiant-blue text-radhiant-blue">
                    <SelectValue placeholder="Filter by truck" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mammographers</SelectItem>
                    {TRUCKS.map((truck) => (
                      <SelectItem key={truck} value={truck}>
                        {truck}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* User Form - Only show when adding new user */}
          {showUserForm && !editingUserId && (
            <Card className="bg-white">
              <CardHeader className="bg-radhiant-blue text-white rounded-t-md">
                <CardTitle>Add New {userForm.role.replace("_", " ")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="name" className="text-radhiant-blue">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Enter user name"
                    className="border-radhiant-green focus:border-radhiant-blue"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-radhiant-blue">
                    Password (required)
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="Enter password"
                      className="border-radhiant-green focus:border-radhiant-blue pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-radhiant-blue">Assigned Trucks</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {TRUCKS.map((truck) => (
                      <div key={truck} className="flex items-center space-x-2">
                        <Checkbox
                          id={`truck-${truck}`}
                          checked={userForm.assignedTrucks.includes(truck)}
                          onCheckedChange={(checked) => {
                            setUserForm((prev) => ({
                              ...prev,
                              assignedTrucks: checked
                                ? [...prev.assignedTrucks, truck]
                                : prev.assignedTrucks.filter((t) => t !== truck),
                            }))
                          }}
                          className="border-radhiant-green data-[state=checked]:bg-radhiant-green"
                        />
                        <Label htmlFor={`truck-${truck}`} className="text-sm text-radhiant-blue">
                          {truck}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleUserFormSubmit}
                    className="bg-radhiant-blue hover:bg-radhiant-blue/90 text-white"
                  >
                    Create User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetUserForm}
                    className="border-radhiant-green text-radhiant-green hover:bg-radhiant-green/10"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List for current role tab */}
          <div className="grid gap-4">
            {displayedUsers.map((user) => (
              <div key={user.id} className="space-y-4">
                <Card className="bg-white">
                  <CardContent className="flex justify-between items-center p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-radhiant-blue">{user.name}</h3>
                        {!user.password && <AlertTriangle className="h-4 w-4 text-red-500" title="No password set" />}
                        {user.password && <Key className="h-4 w-4 text-green-500" title="Password set" />}
                      </div>
                      <p className="text-sm text-gray-600">
                        Trucks:{" "}
                        {user.assignedTrucks && user.assignedTrucks.length > 0
                          ? user.assignedTrucks.join(", ")
                          : "None"}
                      </p>
                      <p className="text-sm">
                        Status:{" "}
                        <span className={user.isActive ? "text-radhiant-green" : "text-red-600"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </p>
                      <p className="text-sm">
                        Password:{" "}
                        <span className={user.password ? "text-green-600" : "text-red-600"}>
                          {user.password ? "Set" : "Not Set"}
                        </span>
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditUser(user)}
                        className="border-radhiant-blue text-radhiant-blue hover:bg-radhiant-blue/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.password && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleClearPassword(user.id)}
                          className="border-orange-500 text-orange-500 hover:bg-orange-50"
                          title="Clear password"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Inline Edit Form - Shows below the user when editing */}
                {editingUserId === user.id && (
                  <Card className="bg-gray-50 border-2 border-radhiant-blue">
                    <CardHeader className="bg-radhiant-blue text-white rounded-t-md">
                      <div className="flex justify-between items-center">
                        <CardTitle>Edit {userForm.role.replace("_", " ")}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetUserForm}
                          className="text-white hover:bg-white/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="edit-name" className="text-radhiant-blue">
                          Name
                        </Label>
                        <Input
                          id="edit-name"
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          placeholder="Enter user name"
                          className="border-radhiant-green focus:border-radhiant-blue"
                        />
                      </div>

                      <div>
                        <Label htmlFor="edit-password" className="text-radhiant-blue">
                          Password (leave blank to keep current)
                        </Label>
                        <div className="relative">
                          <Input
                            id="edit-password"
                            type={showPassword ? "text" : "password"}
                            value={userForm.password}
                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                            placeholder="Enter new password or leave blank"
                            className="border-radhiant-green focus:border-radhiant-blue pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-radhiant-blue">Assigned Trucks</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          {TRUCKS.map((truck) => (
                            <div key={truck} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-truck-${truck}`}
                                checked={userForm.assignedTrucks.includes(truck)}
                                onCheckedChange={(checked) => {
                                  setUserForm((prev) => ({
                                    ...prev,
                                    assignedTrucks: checked
                                      ? [...prev.assignedTrucks, truck]
                                      : prev.assignedTrucks.filter((t) => t !== truck),
                                  }))
                                }}
                                className="border-radhiant-green data-[state=checked]:bg-radhiant-green"
                              />
                              <Label htmlFor={`edit-truck-${truck}`} className="text-sm text-radhiant-blue">
                                {truck}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-isActive"
                          checked={userForm.isActive}
                          onCheckedChange={(checked) => setUserForm({ ...userForm, isActive: !!checked })}
                          className="border-radhiant-green data-[state=checked]:bg-radhiant-green"
                        />
                        <Label htmlFor="edit-isActive" className="text-radhiant-blue">
                          Active
                        </Label>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          onClick={handleUserFormSubmit}
                          className="bg-radhiant-blue hover:bg-radhiant-blue/90 text-white"
                        >
                          Update User
                        </Button>
                        <Button
                          variant="outline"
                          onClick={resetUserForm}
                          className="border-radhiant-green text-radhiant-green hover:bg-radhiant-green/10"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
            {displayedUsers.length === 0 && !showUserForm && (
              <p className="text-center text-gray-500">
                No {activeUserRoleTab.replace("_", " ")}s found
                {activeUserRoleTab === "mammographer" &&
                  mammographerTruckFilter !== "all" &&
                  ` for truck ${mammographerTruckFilter}`}
                .
              </p>
            )}
          </div>
        </div>
      )}

      {activeAdminTab === "reports" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-radhiant-blue">Time & Attendance Reports</h2>
            <Button
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-radhiant-green hover:bg-radhiant-green/90 text-white"
              disabled={reportData.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <Card className="bg-white">
            <CardHeader className="bg-radhiant-blue text-white rounded-t-md">
              <CardTitle>Report Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div>
                <Label htmlFor="startDate" className="text-radhiant-blue">
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                  className="border-radhiant-green focus:border-radhiant-blue"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-radhiant-blue">
                  End Date *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                  className="border-radhiant-green focus:border-radhiant-blue"
                />
              </div>
              <div>
                <Label htmlFor="roleFilter" className="text-radhiant-blue">
                  Role *
                </Label>
                <Select
                  value={reportFilters.role}
                  onValueChange={(value) =>
                    setReportFilters({ ...reportFilters, role: value as ReportUserRoleFilter, userId: "all" })
                  }
                >
                  <SelectTrigger className="border-radhiant-green focus:border-radhiant-blue text-radhiant-blue">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES_FOR_REPORT_FILTER.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="truckFilter" className="text-radhiant-blue">
                  Truck
                </Label>
                <Select
                  value={reportFilters.truckId}
                  onValueChange={(value) => setReportFilters({ ...reportFilters, truckId: value, userId: "all" })}
                >
                  <SelectTrigger className="border-radhiant-green focus:border-radhiant-blue text-radhiant-blue">
                    <SelectValue placeholder="Select truck" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All trucks</SelectItem>
                    {TRUCKS.map((truck) => (
                      <SelectItem key={truck} value={truck}>
                        {truck}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Select "All trucks" to see activity across multiple trucks</p>
              </div>
              <div>
                <Label htmlFor="userFilter" className="text-radhiant-blue">
                  User
                </Label>
                <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userSearchOpen}
                      className="w-full justify-between border-radhiant-green focus:border-radhiant-blue text-radhiant-blue"
                    >
                      {reportFilters.userId === "all"
                        ? `All Users (${usersForReportNameFilter.length})`
                        : usersForReportNameFilter.find((user) => user.id === reportFilters.userId)?.name ||
                          "Select user..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search users..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="all"
                            onSelect={() => {
                              setReportFilters({ ...reportFilters, userId: "all" })
                              setUserSearchOpen(false)
                            }}
                          >
                            All Users ({usersForReportNameFilter.length})
                          </CommandItem>
                          {usersForReportNameFilter.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.name}
                              onSelect={() => {
                                setReportFilters({ ...reportFilters, userId: user.id })
                                setUserSearchOpen(false)
                              }}
                            >
                              {user.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <Button
                  onClick={handleGenerateReport}
                  className="w-full bg-radhiant-green hover:bg-radhiant-green/90 text-white"
                >
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="bg-radhiant-blue text-white rounded-t-md">
              <div className="flex justify-between items-center">
                <CardTitle>Report Results ({reportData.length} entries)</CardTitle>
                <Button
                  onClick={() => setReportData([])}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-radhiant-blue opacity-60 hover:opacity-100 transition-opacity duration-200"
                >
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {reportData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No report generated yet.</p>
                  <p className="text-sm text-gray-400">
                    Select dates and role above, then click "Generate Report" to view results.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    * Date and role are required. Truck and user can be "All" to show activity across multiple
                    trucks/users.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-radhiant-green">
                      <tr className="text-radhiant-blue">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-left p-2">Truck</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Sign In</th>
                        <th className="text-left p-2">Sign Out</th>
                        <th className="text-left p-2">Hours</th>
                        <th className="text-left p-2">Auto Sign Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((entry) => {
                        return (
                          <tr key={entry.id} className="border-b border-gray-200 hover:bg-radhiant-lightBlue/50">
                            <td className="p-2 text-gray-700">{entry.userName || "N/A"}</td>
                            <td className="p-2 text-gray-700 capitalize">
                              {(entry.userRole || "N/A").replace("_", " ")}
                            </td>
                            <td className="p-2 text-gray-700">{entry.truck_id || entry.truckId}</td>
                            <td className="p-2 text-gray-700">{formatDate(entry.signInTime)}</td>
                            <td className="p-2 text-gray-700">{formatTime(entry.signInTime)}</td>
                            <td className="p-2 text-gray-700">
                              {entry.signOutTime ? formatTime(entry.signOutTime) : ""}
                            </td>
                            <td className="p-2 text-gray-700">
                              {entry.totalHours ? `${entry.totalHours.toFixed(2)} hrs` : ""}
                            </td>
                            <td className="p-2">
                              <span className={entry.isAutoSignOut ? "text-red-600 font-semibold" : "text-green-600"}>
                                {entry.isAutoSignOut ? "Yes" : "No"}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
