// app/api/graph/route.js
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Hello from Microsoft Graph API" });
}

