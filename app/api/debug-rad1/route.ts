import { NextResponse } from "next/server"
import { debugRAD1Status } from "@/lib/debug"

export async function POST() {
  try {
    const debugInfo = await debugRAD1Status()
    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("[DEBUG API] Error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
