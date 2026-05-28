'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

type Parsed = {
  prefix: string
  number: number
  decimals: number
  suffix: string
}

/**
 * Parse a string like "500+", "25 năm", "100%", "5+", "+12K", "1.234"
 * into prefix / number / decimals / suffix so we can animate just the digit part.
 */
function parseValue(raw: string): Parsed | null {
  const match = raw.match(/^(\D*)([\d.,]+)(.*)$/)
  if (!match) return null
  const prefix = match[1] ?? ''
  const numText = (match[2] ?? '').replace(/,/g, '')
  const suffix = match[3] ?? ''
  const decimals = numText.includes('.') ? numText.split('.')[1].length : 0
  const number = Number(numText)
  if (!Number.isFinite(number)) return null
  return { prefix, number, decimals, suffix }
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

type AnimatedNumberProps = {
  value: string
  duration?: number
  className?: string
}

export default function AnimatedNumber({ value, duration = 1600, className }: AnimatedNumberProps) {
  const parsed = useMemo(() => parseValue(value), [value])
  const [display, setDisplay] = useState<string>(() =>
    parsed ? `${parsed.prefix}${formatNumber(0, parsed.decimals)}${parsed.suffix}` : value
  )
  const ref = useRef<HTMLSpanElement | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    void pathname

    if (!parsed) {
      setDisplay(value)
      return
    }

    // Start fresh from 0 on every navigation
    setDisplay(`${parsed.prefix}${formatNumber(0, parsed.decimals)}${parsed.suffix}`)

    const node = ref.current
    if (!node) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setDisplay(`${parsed.prefix}${formatNumber(parsed.number, parsed.decimals)}${parsed.suffix}`)
      return
    }

    let rafId = 0
    let started = false

    const startCount = () => {
      if (started) return
      started = true

      const start = performance.now()
      const tick = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)
        const current = parsed.number * eased
        setDisplay(`${parsed.prefix}${formatNumber(current, parsed.decimals)}${parsed.suffix}`)
        if (progress < 1) {
          rafId = requestAnimationFrame(tick)
        } else {
          setDisplay(`${parsed.prefix}${formatNumber(parsed.number, parsed.decimals)}${parsed.suffix}`)
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    // If already in viewport, start immediately
    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      startCount()
      return () => {
        if (rafId) cancelAnimationFrame(rafId)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startCount()
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(node)

    return () => {
      observer.disconnect()
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [parsed, value, duration, pathname])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
