import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Radhiant Time & Attendance",
  description: "Employee time tracking for drivers and mammographers",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background`}>
        <div className="fixed inset-0 -z-10 bg-gray-50"></div>
        <div className="relative z-0">{children}</div>
      </body>
    </html>
  )
}
