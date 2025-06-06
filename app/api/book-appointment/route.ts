import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()

    console.log("Processing booking:", {
      patient: `${bookingData.patientDetails.firstName} ${bookingData.patientDetails.lastName}`,
      service: bookingData.serviceType,
      date: bookingData.selectedDate,
      time: bookingData.selectedTime,
    })

    // Create Microsoft Calendar Event
    let calendarResponse = null
    try {
      calendarResponse = await createMicrosoftCalendarEvent(bookingData)
      console.log("Calendar event created successfully:", calendarResponse.id)
    } catch (error) {
      console.error("Calendar creation failed:", error)
      throw new Error("Failed to create calendar appointment. Please try again.")
    }

    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      calendarId: calendarResponse?.id,
      details: {
        patient: `${bookingData.patientDetails.firstName} ${bookingData.patientDetails.lastName}`,
        service: bookingData.serviceType,
        date: bookingData.selectedDate,
        time: bookingData.selectedTime,
        location: bookingData.town,
      },
    })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Booking failed. Please try again or contact support.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function createMicrosoftCalendarEvent(bookingData: any) {
  try {
    const accessToken = await getMicrosoftAccessToken()

    // Calculate end time
    const startDateTime = new Date(`${bookingData.selectedDate}T${bookingData.selectedTime}:00`)
    const endDateTime = new Date(startDateTime.getTime() + bookingData.estimatedDuration * 60000)

    const event = {
      subject: `${bookingData.serviceType} - ${bookingData.patientDetails.firstName} ${bookingData.patientDetails.lastName}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "Africa/Johannesburg",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "Africa/Johannesburg",
      },
      location: {
        displayName: `${bookingData.town} - Mobile Van`,
      },
      body: {
        content: `
Patient Details:
- Name: ${bookingData.patientDetails.firstName} ${bookingData.patientDetails.lastName}
- ID: ${bookingData.patientDetails.idNumber}
- Phone: ${bookingData.patientDetails.phone}
- Email: ${bookingData.patientDetails.email}

Service: ${bookingData.serviceType}
Duration: ${bookingData.estimatedDuration} minutes

Medical Aid: ${bookingData.patientDetails.medicalAidSchemeName || "Cash Patient"}
${bookingData.patientDetails.medicalAidPlan ? `Plan: ${bookingData.patientDetails.medicalAidPlan}` : ""}

Emergency Contact: ${bookingData.emergencyContact.name} (${bookingData.emergencyContact.relationship}) - ${bookingData.emergencyContact.phone}

Special Requirements:
${bookingData.specialRequirements.wheelchairAccess ? "- Wheelchair Access Required\n" : ""}
${bookingData.specialRequirements.fasting ? "- Fasting Required\n" : ""}
${bookingData.specialRequirements.pregnancy ? "- Pregnancy\n" : ""}
${bookingData.specialRequirements.contrast ? "- Contrast Media Required\n" : ""}
${bookingData.specialRequirements.other ? `- Other: ${bookingData.specialRequirements.other}\n` : ""}

${bookingData.referringDoctor.name ? `Referring Doctor: ${bookingData.referringDoctor.name} (${bookingData.referringDoctor.practiceNumber})` : ""}
        `,
        contentType: "text",
      },
      categories: ["Medical Appointment"],
      importance: "high",
    }

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${process.env.MICROSOFT_DEFAULT_USER_ID}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Microsoft Graph API Error:", errorData)
      throw new Error(`Failed to create calendar event: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating Microsoft calendar event:", error)
    throw error
  }
}

async function getMicrosoftAccessToken() {
  const accessToken = process.env.MICROSOFT_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error("Microsoft access token not configured")
  }

  return accessToken
}
