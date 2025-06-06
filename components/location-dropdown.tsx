"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LocationDropdownProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  label?: string
  disabled?: boolean
}

export function LocationDropdown({
  options,
  value,
  onChange,
  placeholder,
  label,
  disabled = false,
}: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Close dropdown when pressing Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

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
    <div className="relative w-full" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}

      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "w-full justify-between bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-normal h-11",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "ring-2 ring-green-500 border-green-500",
        )}
      >
        <span className="text-left truncate">{value || placeholder}</span>
        <ChevronDown className={cn("ml-2 h-4 w-4 transition-transform flex-shrink-0", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[100] mt-1 bg-white border border-slate-200 rounded-md shadow-lg">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No options available</div>
            ) : (
              options.map((option) => (
                <div
                  key={option}
                  className={cn(
                    "px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between",
                    value === option && "bg-green-50 text-green-900 font-medium",
                  )}
                  onClick={() => handleSelect(option)}
                >
                  <span>{option}</span>
                  {value === option && <Check className="h-4 w-4 text-green-600" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
