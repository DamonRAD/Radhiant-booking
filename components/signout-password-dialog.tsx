"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, EyeOff, LogOut } from "lucide-react"

interface SignOutPasswordDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (password: string) => void
  userName: string
  loading: boolean
}

export default function SignOutPasswordDialog({
  isOpen,
  onClose,
  onSubmit,
  userName,
  loading,
}: SignOutPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [imageReportSent, setImageReportSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim() && imageReportSent) {
      onSubmit(password)
    }
  }

  const handleClose = () => {
    setPassword("")
    setShowPassword(false)
    setImageReportSent(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-red-600" />
            Confirm Sign Out
          </DialogTitle>
          <DialogDescription>
            Please enter your password to confirm sign out for <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signout-password">Password</Label>
              <div className="relative">
                <Input
                  id="signout-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  autoFocus
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="image-report-sent"
                checked={imageReportSent}
                onCheckedChange={(checked) => setImageReportSent(!!checked)}
                className="border-2 border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 h-7 w-7"
              />
              <Label htmlFor="image-report-sent" className="text-base font-medium">
                Image report sent
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!password.trim() || !imageReportSent || loading}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Signing Out..." : "Sign Out"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
