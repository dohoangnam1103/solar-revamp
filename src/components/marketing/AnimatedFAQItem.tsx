'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { formatVietnameseCurrencyText } from '@/lib/quote/calculator'

type AnimatedFAQItemProps = {
  question: string
  answer: string
  className?: string
}

export default function AnimatedFAQItem({ question, answer, className = '' }: AnimatedFAQItemProps) {
  const [open, setOpen] = useState(false)
  const displayAnswer = formatVietnameseCurrencyText(answer)

  return (
    <div
      className={`motion-card glass overflow-hidden rounded-xl border transition-colors ${
        open ? 'border-green-300/80' : 'border-white/60'
      } ${className}`}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left font-medium transition-colors ${
          open ? 'text-green-700' : 'text-gray-800 hover:text-green-700'
        }`}
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-900 transition-transform duration-300 ease-out ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`border-t border-gray-100 px-5 pb-5 text-sm leading-relaxed text-gray-600 transition-all duration-300 ease-out ${
              open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
            }`}
          >
            <p className="pt-4">{displayAnswer}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
