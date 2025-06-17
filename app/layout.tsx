import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Radhiant Diagnostic Imaging - Mobile Health Van Booking",
  description:
    "Book your mobile health van appointment with Radhiant Diagnostic Imaging. Bringing advanced diagnostics to your doorstep across South Africa.",
  keywords: "mobile health van, diagnostic imaging, mammogram, South Africa, medical booking",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
