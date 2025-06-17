import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()

    // Validate required fields
    if (!bookingData.patientDetails?.firstName || !bookingData.patientDetails?.email) {
      return NextResponse.json({ success: false, message: "Missing required patient information" }, { status: 400 })
    }

    // Process the booking (same logic as Server Action)
    console.log("Processing booking:", bookingData)

    // Here you would:
    // 1. Save to database
    // 2. Send emails/SMS
    // 3. Create calendar events
    // 4. Any other business logic

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully!",
      bookingId: `BK-${Date.now()}`,
      details: {
        patient: `${bookingData.patientDetails.firstName} ${bookingData.patientDetails.lastName}`,
        service: bookingData.serviceType,
        date: bookingData.selectedDate,
        time: bookingData.selectedTime,
      },
    })
  } catch (error) {
    console.error("Booking submission error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
