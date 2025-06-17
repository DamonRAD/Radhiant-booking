"use server"

import { supabase, type BookingRecord } from "@/lib/supabase"
import { createMicrosoftCalendarEvent } from "@/lib/microsoft-graph"

interface BookingSubmission {
  province: string
  town: string
  selectedDate: Date | null
  selectedTime: string
  serviceType: string
  estimatedDuration: number
  specialRequirements: {
    notes: string
  }
  patientDetails: {
    firstName: string
    lastName: string
    idNumber: string
    phone: string
    email: string
  }
  vanDetails?: {
    vanId: string
    vanName: string
    location: string
  }
}

export async function submitBooking(bookingData: BookingSubmission) {
  try {
    // 1. Validate the data
    if (!bookingData.patientDetails.firstName || !bookingData.patientDetails.email) {
      throw new Error("Missing required patient information")
    }

    if (!bookingData.selectedDate) {
      throw new Error("Missing appointment date")
    }

    // 2. Generate booking reference
    const bookingReference = `RDH-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // 3. Get van details (you can expand this based on your van schedule logic)
    const vanDetails = getVanDetails(bookingData.town)

    // 4. Prepare booking record for database
    const bookingRecord: Omit<BookingRecord, "id" | "created_at" | "updated_at"> = {
      patient_name: `${bookingData.patientDetails.firstName} ${bookingData.patientDetails.lastName}`,
      first_name: bookingData.patientDetails.firstName,
      last_name: bookingData.patientDetails.lastName,
      id_number: bookingData.patientDetails.idNumber,
      email: bookingData.patientDetails.email,
      phone: bookingData.patientDetails.phone,
      province: bookingData.province,
      town: bookingData.town,
      service_type: bookingData.serviceType,
      appointment_date: bookingData.selectedDate.toISOString().split("T")[0],
      appointment_time: bookingData.selectedTime,
      estimated_duration: bookingData.estimatedDuration,
      special_notes: bookingData.specialRequirements.notes || null,
      van_id: vanDetails.vanId,
      van_name: vanDetails.vanName,
      van_location: vanDetails.location,
      status: "confirmed",
      booking_reference: bookingReference,
    }

    // 5. Save to Supabase database
    const { data: savedBooking, error: dbError } = await supabase
      .from("bookings")
      .insert([bookingRecord])
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      throw new Error("Failed to save booking to database")
    }

    console.log("Booking saved to database:", savedBooking.id)

    // 6. Create Microsoft Calendar event
    let calendarEventId: string | null = null
    try {
      calendarEventId = await createMicrosoftCalendarEvent({
        ...bookingData,
        bookingReference,
        vanDetails,
      })
    } catch (calendarError) {
      console.error("Calendar creation failed:", calendarError)
      // Don't fail the entire booking if calendar creation fails
      // You might want to update the booking record to indicate calendar creation failed
    }

    // 7. Send confirmation email (you can implement this later)
    try {
      await sendConfirmationEmail(bookingData, bookingReference)
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // Don't fail the booking if email fails
    }

    // 8. Send SMS confirmation (you can implement this later)
    try {
      await sendSMSConfirmation(bookingData, bookingReference)
    } catch (smsError) {
      console.error("SMS sending failed:", smsError)
      // Don't fail the booking if SMS fails
    }

    // 9. Log successful booking
    console.log("Booking submitted successfully:", {
      bookingId: savedBooking.id,
      bookingReference,
      patient: `${bookingData.patientDetails.firstName} ${bookingData.patientDetails.lastName}`,
      service: bookingData.serviceType,
      date: bookingData.selectedDate,
      time: bookingData.selectedTime,
      calendarEventId,
    })

    return {
      success: true,
      message: "Booking confirmed successfully!",
      bookingId: savedBooking.id,
      bookingReference,
      calendarEventId,
      details: {
        patient: `${bookingData.patientDetails.firstName} ${bookingData.patientDetails.lastName}`,
        service: bookingData.serviceType,
        date: bookingData.selectedDate.toLocaleDateString(),
        time: bookingData.selectedTime,
        location: bookingData.town,
        vanName: vanDetails.vanName,
      },
    }
  } catch (error) {
    console.error("Booking submission error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Booking failed. Please try again.",
    }
  }
}

// Helper function to get van details based on town
function getVanDetails(town: string) {
  const vanSchedules: Record<string, { vanId: string; vanName: string; location: string }> = {
    "Cape Town": {
      vanId: "VAN-001",
      vanName: "Radhiant Mobile Unit Alpha",
      location: "Tygerberg Hospital Parking",
    },
    Johannesburg: {
      vanId: "VAN-002",
      vanName: "Radhiant Mobile Unit Beta",
      location: "Charlotte Maxeke Hospital Parking",
    },
    Durban: {
      vanId: "VAN-003",
      vanName: "Radhiant Mobile Unit Gamma",
      location: "Addington Hospital Parking",
    },
  }

  return (
    vanSchedules[town] || {
      vanId: "VAN-000",
      vanName: "Radhiant Mobile Unit",
      location: `${town} - Location TBD`,
    }
  )
}

// Placeholder functions for email and SMS (implement these later)
async function sendConfirmationEmail(bookingData: BookingSubmission, bookingReference: string) {
  // TODO: Implement email sending using your preferred service
  console.log(`Would send confirmation email to ${bookingData.patientDetails.email} for booking ${bookingReference}`)
}

async function sendSMSConfirmation(bookingData: BookingSubmission, bookingReference: string) {
  // TODO: Implement SMS sending using your preferred service
  console.log(`Would send SMS to ${bookingData.patientDetails.phone} for booking ${bookingReference}`)
}
