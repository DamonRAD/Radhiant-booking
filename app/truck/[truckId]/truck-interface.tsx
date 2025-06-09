"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { signIn, signOut } from "@/lib/actions"
import PasswordDialog from "@/components/password-dialog"
import SignOutPasswordDialog from "@/components/signout-password-dialog"
import type { User, TruckStatus } from "@/lib/types"
import { Clock, UserIcon, Truck, RefreshCw } from "lucide-react"

interface TruckInterfaceProps {
  truckId: string
  drivers: User[]
  mammographers: User[]
  status?: TruckStatus | null
}

export default function TruckInterface({ truckId, drivers, mammographers, status }: TruckInterfaceProps) {
  const router = useRouter()
  const [selectedDriver, setSelectedDriver] = useState<string>("")
  const [selectedMammographer, setSelectedMammographer] = useState<string>("")
  const [loading, setLoading] = useState<string>("")
  const [showLocumDrivers, setShowLocumDrivers] = useState<boolean>(false)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Password dialog state for sign in
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean
    userId: string
    userName: string
    role: string
  }>({
    isOpen: false,
    userId: "",
    userName: "",
    role: "",
  })

  // Password dialog state for sign out
  const [signOutDialog, setSignOutDialog] = useState<{
    isOpen: boolean
    userId: string
    userName: string
  }>({
    isOpen: false,
    userId: "",
    userName: "",
  })

  const handleSignInClick = (userId: string, role: string) => {
    const user = [...drivers, ...mammographers].find((u) => u.id === userId)
    if (!user) return

    setPasswordDialog({
      isOpen: true,
      userId,
      userName: user.name,
      role,
    })
  }

  const handleSignOutClick = (userId: string) => {
    const user = [...drivers, ...mammographers].find((u) => u.id === userId)
    if (!user) return

    console.log(`[TruckInterface] Initiating sign out for user ${userId} (${user.name})`)
    setSignOutDialog({
      isOpen: true,
      userId,
      userName: user.name,
    })
  }

  // Updated to handle notes parameter
  const handlePasswordSubmit = async (password: string, notes: string) => {
    setLoading(passwordDialog.userId)
    try {
      const result = await signIn(passwordDialog.userId, truckId, password, notes)
      if (!result.success) {
        alert(result.error)
      } else {
        if (passwordDialog.role === "driver" || passwordDialog.role === "locum_driver") setSelectedDriver("")
        if (passwordDialog.role === "mammographer") setSelectedMammographer("")
        setPasswordDialog({ isOpen: false, userId: "", userName: "", role: "" })
        router.refresh()
      }
    } catch (error) {
      console.error("[TruckInterface] Sign in error:", error)
      alert("An error occurred during sign in")
    } finally {
      setLoading("")
    }
  }

  const handleSignOutPasswordSubmit = async (password: string) => {
    console.log(`[TruckInterface] Processing sign out for user ${signOutDialog.userId}`)
    setLoading(signOutDialog.userId)
    try {
      const result = await signOut(signOutDialog.userId, password)
      console.log(`[TruckInterface] Sign out result:`, result)
      if (!result.success) {
        console.error(`[TruckInterface] Sign out failed:`, result.error)
        alert(`Sign out failed: ${result.error}`)
      } else {
        console.log(`[TruckInterface] Sign out successful`)
        setSignOutDialog({ isOpen: false, userId: "", userName: "" })
        router.refresh()
      }
    } catch (error) {
      console.error("[TruckInterface] Sign out error:", error)
      alert(`An error occurred during sign out: ${(error as Error).message}`)
    } finally {
      setLoading("")
    }
  }

  const handlePasswordDialogClose = () => {
    setPasswordDialog({ isOpen: false, userId: "", userName: "", role: "" })
  }

  const handleSignOutDialogClose = () => {
    setSignOutDialog({ isOpen: false, userId: "", userName: "" })
  }

  const handleForceRefresh = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/force-refresh-truck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truckId }),
      })

      const data = await response.json()
      console.log("[Force Refresh] Result:", data)

      if (data.success) {
        // Force a hard refresh of the page
        window.location.reload()
      } else {
        alert("Failed to refresh truck status")
      }
    } catch (error) {
      console.error("[Force Refresh] Error:", error)
      alert("Error refreshing truck status")
    } finally {
      setRefreshing(false)
    }
  }

  const formatTime = (dateInput: Date | string | undefined | null): string => {
    if (!dateInput) return "N/A"
    const dateObj = new Date(dateInput)
    if (isNaN(dateObj.getTime())) return "Invalid Date"
    return dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  }

  const availableDriversToDisplay = useMemo(() => {
    if (!drivers) return []
    if (showLocumDrivers) {
      return drivers.filter((d) => d.role === "locum_driver")
    }
    return drivers.filter((d) => d.role === "driver")
  }, [drivers, showLocumDrivers])

  // Reset selected driver if the filter changes and the current selection is no longer valid
  useEffect(() => {
    if (selectedDriver) {
      const currentSelectionStillAvailable = availableDriversToDisplay.some((d) => d.id === selectedDriver)
      if (!currentSelectionStillAvailable) {
        setSelectedDriver("")
      }
    }
  }, [showLocumDrivers, availableDriversToDisplay, selectedDriver])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 flex-1">{truckId} - Time & Attendance</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Force Refresh"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Current Status - {truckId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-radhiant-lightBlue rounded-lg">
              <h3 className="font-semibold text-radhiant-blue mb-2">Driver</h3>
              {status?.currentDriver ? (
                <div className="space-y-2">
                  <p className="font-medium">{status.currentDriver.userName}</p>
                  <p className="text-sm text-gray-600">Signed in: {formatTime(status.currentDriver.signInTime)}</p>
                  <Button
                    onClick={() => handleSignOutClick(status.currentDriver!.userId)}
                    disabled={loading === status.currentDriver!.userId}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {loading === status.currentDriver!.userId ? "Signing Out..." : "Sign Out"}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No driver signed in</p>
              )}
            </div>
            <div className="p-4 bg-radhiant-lightGreen rounded-lg">
              <h3 className="font-semibold text-radhiant-green mb-2">Mammographer</h3>
              {status?.currentMammographer ? (
                <div className="space-y-2">
                  <p className="font-medium">{status.currentMammographer.userName}</p>
                  <p className="text-sm text-gray-600">
                    Signed in: {formatTime(status.currentMammographer.signInTime)}
                  </p>
                  <Button
                    onClick={() => handleSignOutClick(status.currentMammographer!.userId)}
                    disabled={loading === status.currentMammographer!.userId}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {loading === status.currentMammographer!.userId ? "Signing Out..." : "Sign Out"}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No mammographer signed in</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Driver Sign In
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
            <SelectTrigger>
              <SelectValue placeholder={showLocumDrivers ? "Select a locum driver" : "Select a driver"} />
            </SelectTrigger>
            <SelectContent>
              {availableDriversToDisplay.map((driver) => (
                <SelectItem key={driver.id} value={driver.id}>
                  {driver.name}
                </SelectItem>
              ))}
              {availableDriversToDisplay.length === 0 && (
                <div className="p-2 text-sm text-gray-500">
                  No {showLocumDrivers ? "locum drivers" : "drivers"} available.
                </div>
              )}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="locumDriverToggle"
              checked={showLocumDrivers}
              onCheckedChange={(checked) => setShowLocumDrivers(Boolean(checked))}
              className="border-radhiant-green data-[state=checked]:bg-radhiant-green"
            />
            <Label htmlFor="locumDriverToggle" className="text-sm font-medium text-gray-700">
              View Locum Drivers
            </Label>
          </div>
          {selectedDriver && !status?.currentDriver && (
            <Button
              onClick={() => handleSignInClick(selectedDriver, showLocumDrivers ? "locum_driver" : "driver")}
              disabled={loading === selectedDriver}
              className="w-full bg-radhiant-green hover:bg-radhiant-green/90 text-white"
            >
              {loading === selectedDriver ? "Signing In..." : "Sign In"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Mammographer Sign In
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedMammographer} onValueChange={setSelectedMammographer}>
            <SelectTrigger>
              <SelectValue placeholder="Select a mammographer" />
            </SelectTrigger>
            <SelectContent>
              {(mammographers || []).map((mammographer) => (
                <SelectItem key={mammographer.id} value={mammographer.id}>
                  {mammographer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedMammographer && !status?.currentMammographer && (
            <Button
              onClick={() => handleSignInClick(selectedMammographer, "mammographer")}
              disabled={loading === selectedMammographer}
              className="w-full bg-radhiant-green hover:bg-radhiant-green/90 text-white"
            >
              {loading === selectedMammographer ? "Signing In..." : "Sign In"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sign In Password Dialog */}
      <PasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={handlePasswordDialogClose}
        onSubmit={handlePasswordSubmit}
        userName={passwordDialog.userName}
        loading={loading === passwordDialog.userId}
      />

      {/* Sign Out Password Dialog */}
      <SignOutPasswordDialog
        isOpen={signOutDialog.isOpen}
        onClose={handleSignOutDialogClose}
        onSubmit={handleSignOutPasswordSubmit}
        userName={signOutDialog.userName}
        loading={loading === signOutDialog.userId}
      />
    </div>
  )
}
