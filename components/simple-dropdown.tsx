"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface SimpleDropdownProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
  disabled?: boolean
}

export function SimpleDropdown({
  options,
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
}: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}

      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-left bg-white border border-slate-300 rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
            ${disabled ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "hover:border-slate-400 cursor-pointer"}
            ${isOpen ? "ring-2 ring-green-500 border-green-500" : ""}
          `}
        >
          <span className={value ? "text-slate-900" : "text-slate-500"}>{value || placeholder}</span>
          <ChevronDown
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-3 py-2 text-sm cursor-pointer hover:bg-slate-100
                    ${value === option ? "bg-green-50 text-green-900 font-medium" : "text-slate-700"}
                  `}
                >
                  {option}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
