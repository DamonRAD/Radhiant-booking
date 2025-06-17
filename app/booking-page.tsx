"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Clock, Truck, CheckCircle, AlertCircle } from "lucide-react"
import { format, addDays, isSameDay, addMinutes } from "date-fns"
import { CustomDropdown } from "@/components/custom-dropdown"
import { submitBooking } from "@/app/actions/booking-actions"

// South African provinces and towns data
const southAfricanData = {
  "Western Cape": {
    towns: ["Cape Town", "Stellenbosch", "Paarl", "Worcester", "George", "Mossel Bay", "Hermanus", "Swellendam"],
  },
  Gauteng: {
    towns: ["Johannesburg", "Pretoria", "Soweto", "Sandton", "Randburg", "Roodepoort", "Germiston", "Benoni"],
  },
  "KwaZulu-Natal": {
    towns: ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Ladysmith", "Empangeni", "Pinetown"],
  },
  "Eastern Cape": {
    towns: ["Port Elizabeth", "East London", "Uitenhage", "King William's Town", "Grahamstown", "Queenstown"],
  },
  "Free State": {
    towns: ["Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg", "Phuthaditjhaba"],
  },
  Limpopo: {
    towns: ["Polokwane", "Tzaneen", "Thohoyandou", "Phalaborwa", "Louis Trichardt", "Mokopane"],
  },
  Mpumalanga: {
    towns: ["Nelspruit", "Witbank", "Secunda", "Standerton", "Middelburg", "Ermelo"],
  },
  "North West": {
    towns: ["Rustenburg", "Klerksdorp", "Potchefstroom", "Mahikeng", "Brits", "Vryburg"],
  },
  "Northern Cape": {
    towns: ["Kimberley", "Upington", "Kuruman", "Springbok", "De Aar", "Postmasburg"],
  },
}

// Service types and their durations
const serviceTypes = [
  {
    id: "mammogram",
    name: "Mammogram",
    duration: 15,
    description: "Specialized breast X-ray screening for early detection of breast cancer",
  },
]

// Mock calendar data with van schedules - 15 minute increments
const mockVanSchedules = {
  "Cape Town": {
    vanId: "VAN-001",
    vanName: "Radhiant Mobile Unit Alpha",
    location: "Tygerberg Hospital Parking",
    capabilities: ["mammogram"],
    availableDates: [
      {
        date: new Date(),
        slots: [
          "09:00",
          "09:15",
          "09:30",
          "09:45",
          "10:00",
          "10:15",
          "10:30",
          "10:45",
          "11:00",
          "11:15",
          "11:30",
          "11:45",
          "14:00",
          "14:15",
          "14:30",
          "14:45",
          "15:00",
          "15:15",
          "15:30",
          "15:45",
          "16:00",
          "16:15",
          "16:30",
          "16:45",
        ],
      },
      {
        date: addDays(new Date(), 1),
        slots: [
          "08:00",
          "08:15",
          "08:30",
          "08:45",
          "09:00",
          "09:15",
          "09:30",
          "09:45",
          "10:00",
          "10:15",
          "10:30",
          "10:45",
          "11:00",
          "11:15",
          "11:30",
          "11:45",
          "13:00",
          "13:15",
          "13:30",
          "13:45",
          "14:00",
          "14:15",
          "14:30",
          "14:45",
          "15:00",
          "15:15",
          "15:30",
          "15:45",
        ],
      },
      {
        date: addDays(new Date(), 2),
        slots: [
          "09:00",
          "09:15",
          "09:30",
          "09:45",
          "10:00",
          "10:15",
          "10:30",
          "10:45",
          "14:00",
          "14:15",
          "14:30",
          "14:45",
          "15:00",
          "15:15",
          "15:30",
          "15:45",
          "16:00",
          "16:15",
          "16:30",
          "16:45",
        ],
      },
      {
        date: addDays(new Date(), 5),
        slots: [
          "08:00",
          "08:15",
          "08:30",
          "08:45",
          "09:00",
          "09:15",
          "09:30",
          "09:45",
          "10:00",
          "10:15",
          "10:30",
          "10:45",
          "11:00",
          "11:15",
          "11:30",
          "11:45",
          "13:00",
          "13:15",
          "13:30",
          "13:45",
          "14:00",
          "14:15",
          "14:30",
          "14:45",
          "15:00",
          "15:15",
          "15:30",
          "15:45",
          "16:00",
          "16:15",
          "16:30",
          "16:45",
        ],
      },
      {
        date: addDays(new Date(), 7),
        slots: [
          "09:00",
          "09:15",
          "09:30",
          "09:45",
          "10:00",
          "10:15",
          "10:30",
          "10:45",
          "11:00",
          "11:15",
          "11:30",
          "11:45",
          "14:00",
          "14:15",
          "14:30",
          "14:45",
          "15:00",
          "15:15",
          "15:30",
          "15:45",
        ],
      },
    ],
    bookedSlots: [
      { date: new Date(), slot: "12:00" },
      { date: new Date(), slot: "12:15" },
      { date: new Date(), slot: "12:30" },
    ],
  },
  Johannesburg: {
    vanId: "VAN-002",
    vanName: "Radhiant Mobile Unit Beta",
    location: "Charlotte Maxeke Hospital Parking",
    capabilities: ["mammogram"],
    availableDates: [
      {
        date: new Date(),
        slots: [
          "08:00",
          "08:15",
          "08:30",
          "08:45",
          "09:00",
          "09:15",
          "09:30",
          "09:45",
          "10:00",
          "10:15",
          "10:30",
          "10:45",
          "11:00",
          "11:15",
          "11:30",
          "11:45",
          "14:00",
          "14:15",
          "14:30",
          "14:45",
          "15:00",
          "15:15",
          "15:30",
          "15:45",
        ],
      },
      {
        date: addDays(new Date(), 1),
        slots: [
          "08:00",
          "08:15",
          "08:30",
          "08:45",
          "09:00",
          "09:15",
          "09:30",
          "09:45",
          "10:00",
          "10:15",
          "10:30",
          "10:45",
          "11:00",
          "11:15",
          "11:30",
          "11:45",
          "14:00",
          "14:15",
          "14:30",
          "14:45",
          "15:00",
          "15:15",
          "15:30",
          "15:45",
        ],
      },
    ],
    bookedSlots: [
      { date: new Date(), slot: "12:00" },
      { date: new Date(), slot: "12:15" },
      { date: new Date(), slot: "13:00" },
      { date: addDays(new Date(), 1), slot: "12:00" },
      { date: addDays(new Date(), 1), slot: "13:00" },
    ],
  },
  Durban: {
    vanId: "VAN-003",
    vanName: "Radhiant Mobile Unit Gamma",
    location: "Addington Hospital Parking",
    capabilities: ["mammogram"],
    availableDates: [
      {
        date: new Date(),
        slots: [
          "08:00",
          "08:15",
          "08:30",
          "08:45",
          "09:00",
          "09:15",
          "09:30",
          "09:45",
          "10:00",
          "10:15",
          "10:30",
          "10:45",
          "14:00",
          "14:15",
          "14:30",
          "14:45",
          "15:00",
          "15:15",
          "15:30",
          "15:45",
        ],
      },
    ],
    bookedSlots: [
      { date: new Date(), slot: "11:00" },
      { date: new Date(), slot: "11:15" },
      { date: new Date(), slot: "12:00" },
      { date: new Date(), slot: "13:00" },
    ],
  },
}

interface BookingData {
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
}

// Simplified Logo Component with better contrast
const RadiantLogo = ({
  className = "",
  size = "h-28",
}: {
  className?: string
  size?: string
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Clean background for better contrast */}
        <div className="absolute inset-0 bg-white/90 rounded-lg shadow-lg"></div>

        <img
          src="/images/radhiant-logo.png"
          alt="Radhiant Diagnostic Imaging"
          className={`${size} w-auto object-contain relative z-10 p-2`}
          style={{
            filter: "brightness(1.0) contrast(1.2)",
          }}
        />

        {/* Simple border for definition */}
        <div className="absolute inset-0 border-2 border-slate-200 rounded-lg z-20 pointer-events-none"></div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingData>({
    province: "",
    town: "",
    selectedDate: null,
    selectedTime: "",
    serviceType: "",
    estimatedDuration: 0,
    specialRequirements: {
      notes: "",
    },
    patientDetails: {
      firstName: "",
      lastName: "",
      idNumber: "",
      phone: "",
      email: "",
    },
  })
  const [isBookingComplete, setIsBookingComplete] = useState(false)
  const [bookingResult, setBookingResult] = useState<any>(null)

  const availableTowns = useMemo(() => {
    if (!bookingData.province) return []
    return southAfricanData[bookingData.province as keyof typeof southAfricanData]?.towns || []
  }, [bookingData.province])

  const vanSchedule = useMemo(() => {
    return mockVanSchedules[bookingData.town as keyof typeof mockVanSchedules] || null
  }, [bookingData.town])

  const availableServices = useMemo(() => {
    if (!vanSchedule) return []
    return serviceTypes.filter((service) => vanSchedule.capabilities.includes(service.id))
  }, [vanSchedule])

  const getAvailableSlots = (date: Date) => {
    if (!vanSchedule) return []

    const daySchedule = vanSchedule.availableDates.find((d) => isSameDay(d.date, date))
    if (!daySchedule) return []

    const bookedSlotsForDay = vanSchedule.bookedSlots
      .filter((booking) => isSameDay(booking.date, date))
      .map((booking) => booking.slot)

    return daySchedule.slots.filter((slot) => !bookedSlotsForDay.includes(slot))
  }

  const getDateAvailabilityInfo = (date: Date) => {
    if (!vanSchedule) return null

    const daySchedule = vanSchedule.availableDates.find((d) => isSameDay(d.date, date))
    if (!daySchedule) return null

    const totalSlots = daySchedule.slots.length
    const availableSlots = getAvailableSlots(date)
    const bookedSlots = totalSlots - availableSlots.length

    return {
      totalSlots,
      availableSlots: availableSlots.length,
      bookedSlots,
      firstAvailable: availableSlots[0] || null,
      lastAvailable: availableSlots[availableSlots.length - 1] || null,
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBookingSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await submitBooking(bookingData)

      if (result.success) {
        setBookingResult(result)
        setIsBookingComplete(true)
      } else {
        setSubmitError(result.message)
      }
    } catch (error) {
      console.error("Error submitting booking:", error)
      setSubmitError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleServiceTypeChange = (serviceTypeId: string) => {
    const selectedService = serviceTypes.find((service) => service.id === serviceTypeId)
    if (selectedService) {
      setBookingData({
        ...bookingData,
        serviceType: serviceTypeId,
        estimatedDuration: selectedService.duration,
      })
    }
  }

  const getEndTime = () => {
    if (!bookingData.selectedTime || !bookingData.estimatedDuration) return ""

    const [hours, minutes] = bookingData.selectedTime.split(":").map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0)

    const endDate = addMinutes(startDate, bookingData.estimatedDuration)
    return format(endDate, "HH:mm")
  }

  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!bookingData.province && !!bookingData.town && !!bookingData.serviceType
      case 2:
        return !!bookingData.selectedDate && !!bookingData.selectedTime
      case 3:
        return true // No mandatory fields in step 3
      case 4:
        return (
          !!bookingData.patientDetails.firstName &&
          !!bookingData.patientDetails.lastName &&
          !!bookingData.patientDetails.idNumber &&
          !!bookingData.patientDetails.phone &&
          !!bookingData.patientDetails.email
        )
      default:
        return false
    }
  }

  if (isBookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <img
            src="/images/radhiant-logo.png"
            alt="Radhiant Diagnostic Imaging"
            className="w-[500px] h-auto object-contain"
          />
        </div>

        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-emerald-700">Booking Confirmed!</CardTitle>
            <CardDescription className="text-slate-600">
              Your appointment has been successfully scheduled
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Booking Reference:</span>
                <span className="text-slate-900 font-mono">{bookingResult?.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Service:</span>
                <span className="text-slate-900">
                  {serviceTypes.find((s) => s.id === bookingData.serviceType)?.name || ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Date:</span>
                <span className="text-slate-900">
                  {bookingData.selectedDate ? format(bookingData.selectedDate, "EEEE, MMMM d, yyyy") : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Time:</span>
                <span className="text-slate-900">
                  {bookingData.selectedTime} - {getEndTime()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Location:</span>
                <span className="text-slate-900">
                  {vanSchedule?.location}, {bookingData.town}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-700">Van:</span>
                <span className="text-slate-900">{vanSchedule?.vanName}</span>
              </div>
            </div>
            <div className="text-sm text-slate-600 text-center">
              A confirmation SMS will be sent to {bookingData.patientDetails.phone}
            </div>
            <Button
              onClick={() => {
                setIsBookingComplete(false)
                setCurrentStep(1)
                setBookingResult(null)
                setSubmitError(null)
                setBookingData({
                  province: "",
                  town: "",
                  selectedDate: null,
                  selectedTime: "",
                  serviceType: "",
                  estimatedDuration: 0,
                  specialRequirements: {
                    notes: "",
                  },
                  patientDetails: {
                    firstName: "",
                    lastName: "",
                    idNumber: "",
                    phone: "",
                    email: "",
                  },
                })
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white"
            >
              Book Another Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large Transparent Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <img
            src="/images/radhiant-logo.png"
            alt="Radhiant Diagnostic Imaging"
            className="w-[800px] h-auto object-contain"
          />
        </div>

        {/* Simple Accent Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-green-400/10 rounded-full blur-lg"></div>
      </div>

      {/* Content with higher z-index */}
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <RadiantLogo size="h-28" />
          </div>
          <p className="text-slate-300">Mobile Health Van Booking</p>
          <p className="text-slate-400 text-sm">
            Bringing advanced diagnostics to your doorstep—because your health can't wait.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-gradient-to-r from-green-500 via-emerald-500 to-pink-500 text-white shadow-lg"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all duration-300 ${
                      step < currentStep ? "bg-gradient-to-r from-green-500 to-pink-500" : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-slate-200 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
            <CardTitle className="text-xl">
              {currentStep === 1 && "Select Location & Service"}
              {currentStep === 2 && "Choose Date & Time"}
              {currentStep === 3 && "Special Requirements"}
              {currentStep === 4 && "Patient Details"}
            </CardTitle>
            <CardDescription className="text-slate-200">
              {currentStep === 1 && "Choose your province, town and the service you require"}
              {currentStep === 2 && "Pick your preferred appointment date and time"}
              {currentStep === 3 && "Add any special requirements or notes for your appointment"}
              {currentStep === 4 && "Provide your details to complete the booking"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Error Display */}
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm">{submitError}</p>
              </div>
            )}

            {/* Step 1: Province, Town Selection and Service Type */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="province" className="text-slate-700 font-medium">
                    Province
                  </Label>
                  <CustomDropdown
                    options={Object.keys(southAfricanData)}
                    value={bookingData.province}
                    onChange={(value) => setBookingData({ ...bookingData, province: value, town: "" })}
                    placeholder="Select your province"
                  />
                </div>

                {bookingData.province && (
                  <div>
                    <Label htmlFor="town" className="text-slate-700 font-medium">
                      Town/City
                    </Label>
                    <CustomDropdown
                      options={availableTowns}
                      value={bookingData.town}
                      onChange={(value) => {
                        setBookingData({
                          ...bookingData,
                          town: value,
                          serviceType: "", // Reset service type when town changes
                        })
                      }}
                      placeholder="Select your town/city"
                    />
                  </div>
                )}

                {bookingData.town && !vanSchedule && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <span className="font-medium text-amber-800">No Van Currently Scheduled</span>
                    </div>
                    <p className="text-sm text-amber-700">
                      We don't currently have a van scheduled for {bookingData.town}. Please check back later or contact
                      us directly.
                    </p>
                  </div>
                )}

                {bookingData.town && vanSchedule && (
                  <div className="space-y-4">
                    <Label htmlFor="serviceType" className="text-slate-700 font-medium">
                      Service Type
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableServices.map((service) => (
                        <div
                          key={service.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            bookingData.serviceType === service.id
                              ? "border-green-500 bg-green-50 shadow-md"
                              : "border-slate-200 hover:border-green-300 hover:bg-green-50/50"
                          }`}
                          onClick={() => handleServiceTypeChange(service.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-slate-800">{service.name}</h4>
                              <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                            </div>
                            <div className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-1 rounded">
                              {service.duration} min
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Date and Time Selection */}
            {currentStep === 2 && vanSchedule && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Calendar Section */}
                  <div>
                    <Label className="text-slate-700 font-medium">Available Dates</Label>
                    <div className="mt-2">
                      <Calendar
                        mode="single"
                        selected={bookingData.selectedDate || undefined}
                        onSelect={(date) =>
                          setBookingData({ ...bookingData, selectedDate: date || null, selectedTime: "" })
                        }
                        disabled={(date) => {
                          const hasAvailability = vanSchedule.availableDates.some((d) => isSameDay(d.date, date))
                          return !hasAvailability || date < new Date()
                        }}
                        className="rounded-md border border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Van Information Section */}
                  <div className="space-y-4">
                    {/* Van Available Info */}
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-800">Van Available!</span>
                      </div>
                      <div className="space-y-1 text-sm text-emerald-700">
                        <p>
                          <strong>{vanSchedule.vanName}</strong>
                        </p>
                        <p>{vanSchedule.location}</p>
                        <p>{bookingData.town}</p>
                      </div>
                    </div>

                    {/* Date-specific availability info */}
                    {bookingData.selectedDate &&
                      (() => {
                        const availabilityInfo = getDateAvailabilityInfo(bookingData.selectedDate)
                        return availabilityInfo ? (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">
                              {format(bookingData.selectedDate, "EEEE, MMMM d")} Availability
                            </h4>
                            <div className="space-y-1 text-sm text-blue-700">
                              <p>
                                <strong>Available slots:</strong> {availabilityInfo.availableSlots} of{" "}
                                {availabilityInfo.totalSlots}
                              </p>
                              <p>
                                <strong>Booked slots:</strong> {availabilityInfo.bookedSlots}
                              </p>
                              {availabilityInfo.firstAvailable && availabilityInfo.lastAvailable && (
                                <p>
                                  <strong>Time range:</strong> {availabilityInfo.firstAvailable} -{" "}
                                  {availabilityInfo.lastAvailable}
                                </p>
                              )}
                              {availabilityInfo.availableSlots === 0 && (
                                <p className="text-red-600 font-medium">Fully booked - please select another date</p>
                              )}
                            </div>
                          </div>
                        ) : null
                      })()}
                  </div>
                </div>

                {bookingData.selectedDate && (
                  <div>
                    <Label className="text-slate-700 font-medium">Available Time Slots</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {getAvailableSlots(bookingData.selectedDate).map((slot) => (
                        <Button
                          key={slot}
                          variant={bookingData.selectedTime === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBookingData({ ...bookingData, selectedTime: slot })}
                          className={`flex items-center space-x-1 transition-all duration-200 ${
                            bookingData.selectedTime === slot
                              ? "bg-gradient-to-r from-green-500 via-emerald-500 to-pink-500 text-white shadow-lg"
                              : "border-slate-300 hover:border-green-400 hover:bg-green-50"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{slot}</span>
                        </Button>
                      ))}
                    </div>

                    {getAvailableSlots(bookingData.selectedDate).length === 0 && (
                      <p className="text-sm text-slate-500 mt-2">No available slots for this date</p>
                    )}
                  </div>
                )}

                {bookingData.selectedDate && bookingData.selectedTime && (
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2">Appointment Summary</h4>
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>
                        <strong>Service:</strong> {serviceTypes.find((s) => s.id === bookingData.serviceType)?.name}
                      </p>
                      <p>
                        <strong>Date:</strong> {format(bookingData.selectedDate, "EEEE, MMMM d, yyyy")}
                      </p>
                      <p>
                        <strong>Time:</strong> {bookingData.selectedTime} - {getEndTime()} (
                        {bookingData.estimatedDuration} min)
                      </p>
                      <p>
                        <strong>Location:</strong> {vanSchedule.location}, {bookingData.town}
                      </p>
                      <p>
                        <strong>Van:</strong> {vanSchedule.vanName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Special Requirements Notes */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                    Special Requirements Notes
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="specialNotes" className="text-slate-700 font-medium">
                      Special Requirements or Notes (Optional)
                    </Label>
                    <p className="text-sm text-slate-600">
                      Please let us know if you have any special requirements such as wheelchair access, pregnancy,
                      allergies, or any other important information we should be aware of.
                    </p>
                    <Textarea
                      id="specialNotes"
                      placeholder="e.g., Wheelchair access required, pregnancy, allergies, fasting requirements, or any other special needs..."
                      value={bookingData.specialRequirements.notes}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          specialRequirements: {
                            notes: e.target.value,
                          },
                        })
                      }
                      className="border-slate-300 focus:border-green-500 focus:ring-green-500 min-h-[120px]"
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Patient Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-slate-700 font-medium">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={bookingData.patientDetails.firstName}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            patientDetails: { ...bookingData.patientDetails, firstName: e.target.value },
                          })
                        }
                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-slate-700 font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={bookingData.patientDetails.lastName}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            patientDetails: { ...bookingData.patientDetails, lastName: e.target.value },
                          })
                        }
                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="idNumber" className="text-slate-700 font-medium">
                      ID Number
                    </Label>
                    <Input
                      id="idNumber"
                      placeholder="e.g., 8001015009087"
                      value={bookingData.patientDetails.idNumber}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          patientDetails: { ...bookingData.patientDetails, idNumber: e.target.value },
                        })
                      }
                      className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-slate-700 font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        placeholder="e.g., 082 123 4567"
                        value={bookingData.patientDetails.phone}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            patientDetails: { ...bookingData.patientDetails, phone: e.target.value },
                          })
                        }
                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-slate-700 font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={bookingData.patientDetails.email}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            patientDetails: { ...bookingData.patientDetails, email: e.target.value },
                          })
                        }
                        className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 font-medium text-center">Cash price R1200</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation Buttons */}
          <div className="flex justify-between p-6 pt-0">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <span>Back</span>
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedFromStep(currentStep)}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 via-emerald-500 to-pink-500 hover:from-green-600 hover:via-emerald-600 hover:to-pink-600 text-white shadow-lg"
              >
                <span>Next</span>
              </Button>
            ) : (
              <Button
                onClick={handleBookingSubmit}
                disabled={!canProceedFromStep(currentStep) || isSubmitting}
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-pink-600 hover:from-green-700 hover:via-emerald-700 hover:to-pink-700 text-white shadow-lg"
              >
                {isSubmitting ? "Creating Appointment..." : "Confirm Booking"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
