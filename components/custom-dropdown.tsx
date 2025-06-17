"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CustomDropdownProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
}

export function CustomDropdown({ options, value, onChange, placeholder, label }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}

      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-normal h-10"
      >
        <span className="text-left truncate">{value || placeholder}</span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="py-1">
            {options.length === 0 ? (
              <div className="px-4 py-2 text-sm text-slate-500">No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option}
                  className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 transition-colors ${
                    value === option ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-700"
                  }`}
                  onClick={() => {
                    onChange(option)
                    setIsOpen(false)
                  }}
                >
                  {option}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
