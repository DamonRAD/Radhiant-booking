"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { MapPin, Clock, Truck, CheckCircle } from "lucide-react"
import { format, addMinutes } from "date-fns"

// South African provinces and towns data - DIRECTLY INLINE
const southAfricanData = {
  "Eastern Cape": {
    towns: ["Port Elizabeth", "East London", "Uitenhage", "King William's Town", "Grahamstown", "Queenstown"],
  },
  "Free State": {
    towns: ["Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg", "Phuthaditjhaba"],
  },
  Gauteng: {
    towns: ["Johannesburg", "Pretoria", "Soweto", "Sandton", "Randburg", "Roodepoort"],
  },
  "KwaZulu-Natal": {
    towns: ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Ladysmith", "Empangeni"],
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
  "Western Cape": {
    towns: ["Cape Town", "Stellenbosch", "Paarl", "Worcester", "George", "Mossel Bay"],
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
  {
    id: "ultrasound",
    name: "Ultrasound",
    duration: 30,
    description: "Non-invasive imaging using sound waves to view internal structures",
  },
]

// Mock van schedules
const mockVanSchedules = {
  "Cape Town": {
    vanId: "VAN-001",
    vanName: "Radhiant Mobile Unit Alpha",
    location: "Tygerberg Hospital Parking",
    capabilities: ["mammogram", "ultrasound"],
  },
  Johannesburg: {
    vanId: "VAN-002",
    vanName: "Radhiant Mobile Unit Beta",
    location: "Charlotte Maxeke Hospital Parking",
    capabilities: ["mammogram", "ultrasound"],
  },
  Durban: {
    vanId: "VAN-003",
    vanName: "Radhiant Mobile Unit Gamma",
    location: "Addington Hospital Parking",
    capabilities: ["mammogram", "ultrasound"],
  },
  Pretoria: {
    vanId: "VAN-004",
    vanName: "Radhiant Mobile Unit Delta",
    location: "Steve Biko Academic Hospital Parking",
    capabilities: ["mammogram", "ultrasound"],
  },
  "Port Elizabeth": {
    vanId: "VAN-005",
    vanName: "Radhiant Mobile Unit Echo",
    location: "Livingstone Hospital Parking",
    capabilities: ["mammogram", "ultrasound"],
  },
  Bloemfontein: {
    vanId: "VAN-006",
    vanName: "Radhiant Mobile Unit Foxtrot",
    location: "Universitas Hospital Parking",
    capabilities: ["mammogram", "ultrasound"],
  },
  Polokwane: {
    vanId: "VAN-007",
    vanName: "Radhiant Mobile Unit Golf",
    location: "Pietersburg Hospital Parking",
    capabilities: ["mammogram", "ultrasound"],
  },
  Nelspruit: {
    vanId: "VAN-008",
    vanName: "Radhiant Mobile Unit Hotel",
    location: "Rob Ferreira Hospital Parking",
    capabilities: ["mammogram", "ultrasound"],
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
  patientDetails: {
    firstName: string
    lastName: string
    idNumber: string
    phone: string
    email: string
  }
}

const RadiantLogo = ({ className = "", size = "h-28" }: { className?: string; size?: string }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-white/90 rounded-lg shadow-lg"></div>
        <img
          src="/images/radhiant-logo.png"
          alt="Radhiant Diagnostic Imaging"
          className={`${size} w-auto object-contain relative z-10 p-2`}
          style={{ filter: "brightness(1.0) contrast(1.2)" }}
        />
        <div className="absolute inset-0 border-2 border-slate-200 rounded-lg z-20 pointer-events-none"></div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBookingComplete, setIsBookingComplete] = useState(false)

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
    patientDetails: {
      firstName: "",
      lastName: "",
      idNumber: "",
      phone: "",
      email: "",
    },
  })

  // Get provinces and towns from the mock data
  const provinces = Object.keys(southAfricanData)
  const towns = bookingData.province
    ? southAfricanData[bookingData.province as keyof typeof southAfricanData]?.towns || []
    : []
  const vanSchedule = mockVanSchedules[bookingData.town as keyof typeof mockVanSchedules] || null

  // Debug logging
  useEffect(() => {}, [provinces, bookingData.province, towns])

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value

    setBookingData({
      ...bookingData,
      province: province,
      town: "",
      serviceType: "",
    })
  }

  const handleTownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const town = e.target.value

    setBookingData({
      ...bookingData,
      town: town,
      serviceType: "",
    })
  }

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleBookingSubmit = async () => {
    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsBookingComplete(true)
    } catch (error) {
      console.error("Error submitting booking:", error)
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
        return true
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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <img
            src="/images/radhiant-logo.png"
            alt="Radhiant Diagnostic Imaging"
            className="w-[800px] h-auto object-contain"
          />
        </div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-green-400/10 rounded-full blur-lg"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <RadiantLogo size="h-28" />
          </div>
          <p className="text-slate-300">Mobile Health Van Booking</p>
          <p className="text-slate-400 text-sm">
            Bringing advanced diagnostics to your doorstep—because your health can't wait.
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step <= currentStep ? "bg-green-600 text-white shadow-lg" : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 transition-all duration-300 ${
                      step < currentStep ? "bg-green-600" : "bg-slate-700"
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
              {currentStep === 3 && "Provide any special requirements"}
              {currentStep === 4 && "Provide your details to complete the booking"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Step 1: Location & Service Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Province Selection */}
                <div>
                  <Label htmlFor="province" className="text-slate-700 font-medium">
                    Province
                  </Label>
                  <div className="mt-1">
                    <select
                      id="province"
                      value={bookingData.province}
                      onChange={handleProvinceChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select your province</option>
                      {provinces.map((province) => (
                        <option key={province} value={province}>
                          {province}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Town Selection */}
                <div>
                  <Label htmlFor="town" className="text-slate-700 font-medium">
                    City/Town
                  </Label>
                  <div className="mt-1">
                    <select
                      id="town"
                      value={bookingData.town}
                      onChange={handleTownChange}
                      disabled={!bookingData.province}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">Select your city/town</option>
                      {towns.map((town) => (
                        <option key={town} value={town}>
                          {town}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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
                      <Label className="text-slate-700 font-medium">Service Type</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {serviceTypes.map((service) => (
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
                      disabled={(date) => date < new Date()}
                      className="rounded-md border border-slate-300"
                    />
                  </div>
                </div>

                {bookingData.selectedDate && (
                  <div>
                    <Label className="text-slate-700 font-medium">Available Time Slots</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[
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
                      ].map((slot) => (
                        <Button
                          key={slot}
                          variant={bookingData.selectedTime === slot ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBookingData({ ...bookingData, selectedTime: slot })}
                          className={`flex items-center space-x-1 transition-all duration-200 ${
                            bookingData.selectedTime === slot
                              ? "bg-green-600 text-white shadow-lg"
                              : "border-slate-300 hover:border-green-400 hover:bg-green-50"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{slot}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {bookingData.selectedDate && bookingData.selectedTime && (
                  <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2">Appointment Summary</h4>
                    <div className="space-y-1 text-sm text-slate-700">
                      <p>
                        <strong>Service:</strong>{" "}
                        {serviceTypes.find((s) => s.id === bookingData.serviceType)?.name || ""}
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

            {/* Step 3: Special Requirements */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-800 border-b border-slate-200 pb-2">
                    Special Requirements
                  </h3>

                  <div>
                    <Label htmlFor="specialRequirements" className="text-slate-700 font-medium">
                      Please describe any special requirements or needs
                    </Label>
                    <textarea
                      id="specialRequirements"
                      placeholder="Please describe any special requirements such as wheelchair access, fasting requirements, pregnancy, contrast media needs, or any other special accommodations..."
                      value={bookingData.specialRequirements.other}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          specialRequirements: {
                            wheelchairAccess: false,
                            fasting: false,
                            pregnancy: false,
                            contrast: false,
                            other: e.target.value,
                          },
                        })
                      }
                      rows={6}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      This information helps us prepare for your appointment and ensure we can accommodate your needs.
                    </p>
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
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                <span>Next</span>
              </Button>
            ) : (
              <Button
                onClick={handleBookingSubmit}
                disabled={!canProceedFromStep(currentStep) || isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
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
