"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface DropdownProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
}

export function Dropdown({ label, options, value, onChange, placeholder, disabled = false }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  console.log(`Dropdown ${label}:`, { options: options.length, value, disabled })

  const handleSelect = (option: string) => {
    console.log(`Selected ${label}:`, option)
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-left bg-white border rounded-md shadow-sm
            ${
              disabled
                ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                : "border-slate-300 hover:border-slate-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            }
          `}
        >
          <span className={value ? "text-slate-900" : "text-slate-500"}>{value || placeholder}</span>
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">No options available</div>
            ) : (
              options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-3 py-2 text-left text-sm hover:bg-slate-100 transition-colors
                    ${value === option ? "bg-green-50 text-green-900 font-medium" : "text-slate-700"}
                  `}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
