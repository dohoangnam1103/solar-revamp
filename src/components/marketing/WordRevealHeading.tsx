'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

type Props = {
  text: string
  as?: ElementType
  className?: string
  /** Delay between words in ms */
  staggerMs?: number
  /** Total duration of each word's animation in ms */
  durationMs?: number
  /** Extra content rendered after the animated words (e.g. a period) */
  trailing?: ReactNode
}

/**
 * Splits text into words and animates them one-by-one (fade + slide-up)
 * when the heading scrolls into view. Falls back to instant rendering
 * when the user prefers reduced motion.
 */
export default function WordRevealHeading({
  text,
  as,
  className,
  staggerMs = 80,
  durationMs = 600,
  trailing,
}: Props) {
  const Tag = (as || 'h2') as ElementType
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    void pathname
    setVisible(false) // reset on navigation
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduced(reduce)
    if (reduce) {
      setVisible(true)
      return
    }

    const node = ref.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { threshold: 0.25 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [pathname])

  const words = text.split(/(\s+)/) // keep whitespace tokens

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((word, index) => {
        if (/^\s+$/.test(word)) return word
        const delay = reduced ? 0 : index * staggerMs
        return (
          <span
            key={`word-${index}-${word}`}
            className="word-reveal-token"
            data-visible={visible ? 'true' : 'false'}
            style={{
              transitionDelay: `${delay}ms`,
              transitionDuration: `${durationMs}ms`,
            }}
          >
            {word}
          </span>
        )
      })}
      {trailing}
    </Tag>
  )
}
