import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white/90 rounded-lg shadow-lg"></div>
            <img
              src="/images/radhiant-logo.png"
              alt="Radhiant Diagnostic Imaging"
              className="h-32 w-auto object-contain relative z-10 p-2"
              style={{
                filter: "brightness(1.0) contrast(1.2)",
              }}
            />
            <div className="absolute inset-0 border-2 border-slate-200 rounded-lg z-20 pointer-events-none"></div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Mobile Health Van Booking</h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-300 mb-8">
          Bringing advanced diagnostics to your doorstep—because your health can't wait.
        </p>

        {/* CTA Button */}
        <Link href="/book">
          <Button className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
            Book Your Appointment
          </Button>
        </Link>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-slate-300">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Mobile Service</h3>
            <p className="text-sm">We come to you across South Africa</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Quick Booking</h3>
            <p className="text-sm">Easy 4-step booking process</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Medical Aid</h3>
            <p className="text-sm">All major medical aids accepted</p>
          </div>
        </div>
      </div>
    </div>
  )
}
