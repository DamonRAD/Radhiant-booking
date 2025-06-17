interface CalendarEvent {
  subject: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location: {
    displayName: string
  }
  body: {
    content: string
    contentType: string
  }
  categories: string[]
  importance: string
}

export async function getMicrosoftAccessToken(): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  })

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Token request failed:", error)
    throw new Error(`Failed to get access token: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function createMicrosoftCalendarEvent(bookingData: any): Promise<string> {
  try {
    const accessToken = await getMicrosoftAccessToken()

    // Calculate end time
    const startDateTime = new Date(`${bookingData.selectedDate}T${bookingData.selectedTime}:00`)
    const endDateTime = new Date(startDateTime.getTime() + bookingData.estimatedDuration * 60000)

    const event: CalendarEvent = {
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
<h3>Patient Details:</h3>
<ul>
<li><strong>Name:</strong> ${bookingData.patientDetails.firstName} ${bookingData.patientDetails.lastName}</li>
<li><strong>ID Number:</strong> ${bookingData.patientDetails.idNumber}</li>
<li><strong>Phone:</strong> ${bookingData.patientDetails.phone}</li>
<li><strong>Email:</strong> ${bookingData.patientDetails.email}</li>
</ul>

<h3>Appointment Details:</h3>
<ul>
<li><strong>Service:</strong> ${bookingData.serviceType}</li>
<li><strong>Duration:</strong> ${bookingData.estimatedDuration} minutes</li>
<li><strong>Location:</strong> ${bookingData.town}, ${bookingData.province}</li>
</ul>

${
  bookingData.specialRequirements.notes
    ? `
<h3>Special Requirements:</h3>
<p>${bookingData.specialRequirements.notes}</p>
`
    : ""
}

<p><em>Booking created via Radhiant Mobile Health Van System</em></p>
        `,
        contentType: "html",
      },
      categories: ["Medical Appointment", "Mobile Van"],
      importance: "high",
    }

    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${process.env.MICROSOFT_USER_ID}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Microsoft Graph API Error:", errorData)
      throw new Error(`Failed to create calendar event: ${response.status}`)
    }

    const createdEvent = await response.json()
    console.log("Calendar event created successfully:", createdEvent.id)
    return createdEvent.id
  } catch (error) {
    console.error("Error creating Microsoft calendar event:", error)
    throw error
  }
}
