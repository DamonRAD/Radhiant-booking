import { NextResponse } from "next/server"
import { fixRAD1Inconsistencies } from "@/lib/debug"

export async function POST() {
  try {
    const result = await fixRAD1Inconsistencies()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[FIX API] Error:", error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
