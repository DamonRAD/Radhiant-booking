"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Clock, Truck, CheckCircle } from "lucide-react"
import { format, addDays, isSameDay, addMinutes } from "date-fns"
import { CustomDropdown } from "@/components/custom-dropdown"

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

// South African Medical Aid Schemes and their plans
const medicalAidSchemes = {
  "Discovery Health": {
    plans: [
      "Discovery Health Medical Scheme Executive Plan",
      "Discovery Health Medical Scheme Comprehensive Series",
      "Discovery Health Medical Scheme Priority Series",
      "Discovery Health Medical Scheme Classic Series",
      "Discovery Health Medical Scheme Essential Series",
      "Discovery Health Medical Scheme Smart Series",
      "Discovery Health Medical Scheme Coastal Saver Series",
      "Discovery Health Medical Scheme KeyCare Series",
    ],
  },
  "Bonitas Medical Fund": {
    plans: [
      "Bonitas BonComprehensive",
      "Bonitas BonCap",
      "Bonitas BonEssential",
      "Bonitas BonFit",
      "Bonitas Standard",
      "Bonitas Primary",
      "Bonitas BonCura",
      "Bonitas BonStart",
    ],
  },
  "Momentum Health": {
    plans: [
      "Momentum Health Ingwe",
      "Momentum Health Summit",
      "Momentum Health Extender",
      "Momentum Health Custom",
      "Momentum Health Incentive",
      "Momentum Health Access",
      "Momentum Health Evolve",
      "Momentum Health Mira",
    ],
  },
  "Medshield Medical Scheme": {
    plans: [
      "Medshield MediElite",
      "Medshield MediExec",
      "Medshield MediCore",
      "Medshield MediValue",
      "Medshield MediSaver",
      "Medshield MediBonus",
      "Medshield MediCross",
    ],
  },
  "Bestmed Medical Scheme": {
    plans: [
      "Bestmed Beat 1",
      "Bestmed Beat 2",
      "Bestmed Beat 3",
      "Bestmed Beat 4",
      "Bestmed Pace 1",
      "Bestmed Pace 2",
      "Bestmed Pace 3",
      "Bestmed Pulse 1",
      "Bestmed Pulse 2",
    ],
  },
  "Fedhealth Medical Scheme": {
    plans: [
      "Fedhealth Maxima Executive",
      "Fedhealth Maxima Entrant",
      "Fedhealth Maxima Ultima",
      "Fedhealth Maxima Traditional",
      "Fedhealth Maxima Coastal",
      "Fedhealth Maxima Dimension",
      "Fedhealth Maxima Entrant Saver",
    ],
  },
  "GEMS (Government Employees Medical Scheme)": {
    plans: ["GEMS Emerald", "GEMS Ruby", "GEMS Sapphire", "GEMS Diamond", "GEMS Tanzanite", "GEMS Beryl", "GEMS Onyx"],
  },
  "Keyhealth Medical Scheme": {
    plans: [
      "Keyhealth KeyCare Plus",
      "Keyhealth KeyCare Core",
      "Keyhealth KeyCare Start",
      "Keyhealth Comprehensive",
      "Keyhealth Priority",
      "Keyhealth Essential",
    ],
  },
  "Medihelp Medical Scheme": {
    plans: ["Medihelp Prime", "Medihelp Necesse", "Medihelp Impello", "Medihelp Basis", "Medihelp Unitas"],
  },
  "Profmed Medical Scheme": {
    plans: ["Profmed Pinnacle", "Profmed Compcare", "Profmed Comprehensive", "Profmed Maxima"],
  },
}

// South African Gap Cover Insurers
const gapCoverInsurers = [
  "Stratum Benefits",
  "Turnberry Risk & Healthcare Specialists",
  "Zestlife",
  "Sirago",
  "Ambledown Financial Services",
  "Wellworx",
  "Resolution Health",
  "Oxygen Healthcare",
  "Universal Healthcare",
  "Sasolmed Gap Cover",
  "Topmed Gap Cover",
  "Medshield Gap Cover",
  "Discovery Gap Cover",
  "Momentum Gap Cover",
  "Bonitas Gap Cover",
  "Fedhealth Gap Cover",
  "Bestmed Gap Cover",
  "Keyhealth Gap Cover",
  "Medihelp Gap Cover",
  "Profmed Gap Cover",
  "Other",
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
    wheelchairAccess: boolean
    fasting: boolean
    pregnancy: boolean
    contrast: boolean
    other: string
  }
  referringDoctor: {
    name: string
    practiceNumber: string
    contactNumber: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  patientDetails: {
    firstName: string
    lastName: string
    idNumber: string
    phone: string
    email: string
    medicalAid: string
    medicalAidSchemeName: string
    medicalAidPlan: string
    medicalAidNumber: string
    mainMemberName: string
    mainMemberIdNumber: string
    relationshipToMainMember: string
    dependentCode: string
    medicalAidContactNumber: string
    hasGapCover: string
    gapCoverInsurer: string
    requiresPreAuth: string
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
  const [bookingData, setBookingData] = useState<BookingData>({
    province: "",
    town: "",
    selectedDate: null,
    selectedTime: "",
    serviceType: "",
    estimatedDuration: 0,
    specialRequirements: {
      wheelchairAccess: false,
      fasting: false,
      pregnancy: false,
      contrast: false,
      other: "",
    },
    referringDoctor: {
      name: "",
      practiceNumber: "",
      contactNumber: "",
    },
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    patientDetails: {
      firstName: "",
      lastName: "",
      idNumber: "",
      phone: "",
      email: "",
      medicalAid: "",
      medicalAidSchemeName: "",
      medicalAidPlan: "",
      medicalAidNumber: "",
      mainMemberName: "",
      mainMemberIdNumber: "",
      relationshipToMainMember: "",
      dependentCode: "",
      medicalAidContactNumber: "",
      hasGapCover: "",
      gapCoverInsurer: "",
      requiresPreAuth: "",
    },
  })
  const [isBookingComplete, setIsBookingComplete] = useState(false)

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

    try {
      // Simulate booking submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you can add your own calendar integration logic
      console.log("Booking submitted:", bookingData)

      setIsBookingComplete(true)
    } catch (error) {
      console.error("Error submitting booking:", error)
      // Still show success for demo purposes
      setIsBookingComplete(true)
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
                setBookingData({
                  province: "",
                  town: "",
                  selectedDate: null,
                  selectedTime: "",
                  serviceType: "",
                  estimatedDuration: 0,
                  specialRequirements: {
                    wheelchairAccess: false,
                    fasting: false,
                    pregnancy: false,
                    contrast: false,
                    other: "",
                  },
                  referringDoctor: {
                    name: "",
                    practiceNumber: "",
                    contactNumber: "",
                  },
                  emergencyContact: {
                    name: "",
                    relationship: "",
                    phone: "",
                  },
                  patientDetails: {
                    firstName: "",
                    lastName: "",
                    idNumber: "",
                    phone: "",
                    email: "",
                    medicalAid: "",
                    medicalAidSchemeName: "",
                    medicalAidPlan: "",
                    medicalAidNumber: "",
                    mainMemberName: "",
                    mainMemberIdNumber: "",
                    relationshipToMainMember: "",
                    dependentCode: "",
                    medicalAidContactNumber: "",
                    hasGapCover: "",
                    gapCoverInsurer: "",
                    requiresPreAuth: "",
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
              {currentStep === 3 && "Provide any special requirements and referring doctor information"}
              {currentStep === 4 && "Provide your details to complete the booking"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
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

                {bookingData.town && vanSchedule && (
                  <>
                    <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-800">Van Available!</span>
                      </div>
                      <p className="text-sm text-emerald-700">
                        <strong>{vanSchedule.vanName}</strong> will be at {vanSchedule.location}
                      </p>
                    </div>

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
                  </>
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
              </div>
            )}

            {/* Step 2: Date and Time Selection */}
            {currentStep === 2 && vanSchedule && (
              <div className="space-y-6">
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

            {/* Step 3: Special Requirements and Referring Doctor */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Special Requirements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                    Special Requirements
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wheelchairAccess"
                        checked={bookingData.specialRequirements.wheelchairAccess}
                        onCheckedChange={(checked) =>
                          setBookingData({
                            ...bookingData,
                            specialRequirements: {
                              ...bookingData.specialRequirements,
                              wheelchairAccess: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="wheelchairAccess" className="text-slate-700">
                        Wheelchair Access Required
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fasting"
                        checked={bookingData.specialRequirements.fasting}
                        onCheckedChange={(checked) =>
                          setBookingData({
                            ...bookingData,
                            specialRequirements: {
                              ...bookingData.specialRequirements,
                              fasting: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="fasting" className="text-slate-700">
                        Fasting Required (for blood tests)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pregnancy"
                        checked={bookingData.specialRequirements.pregnancy}
                        onCheckedChange={(checked) =>
                          setBookingData({
                            ...bookingData,
                            specialRequirements: {
                              ...bookingData.specialRequirements,
                              pregnancy: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="pregnancy" className="text-slate-700">
                        Pregnancy (important for certain scans)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="contrast"
                        checked={bookingData.specialRequirements.contrast}
                        onCheckedChange={(checked) =>
                          setBookingData({
                            ...bookingData,
                            specialRequirements: {
                              ...bookingData.specialRequirements,
                              contrast: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="contrast" className="text-slate-700">
                        Contrast Media Required
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="otherRequirements" className="text-slate-700 font-medium">
                      Other Requirements or Notes
                    </Label>
                    <Input
                      id="otherRequirements"
                      placeholder="Any other special requirements or notes"
                      value={bookingData.specialRequirements.other}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          specialRequirements: {
                            ...bookingData.specialRequirements,
                            other: e.target.value,
                          },
                        })
                      }
                      className="border-slate-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Patient Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Basic Patient Information */}
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
