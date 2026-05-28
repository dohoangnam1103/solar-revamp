'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Watches for elements with [data-reveal], [data-text-motion] or [data-stagger]
 * and toggles `data-visible="true"` on them when they enter the viewport.
 *
 * Important: we never write `data-visible="false"`. We only ADD the attribute
 * (set to "true") on first intersection. CSS handles the hidden state by
 * default. This avoids hydration mismatches where the server renders elements
 * without `data-visible` but the client has mutated the DOM with it.
 *
 * On client-side navigation we remove the attribute entirely so the new page's
 * elements start hidden again and re-trigger their reveal.
 */
export default function PageMotionController() {
  const pathname = usePathname()

  useEffect(() => {
    void pathname
    document.documentElement.classList.add('reveal-motion-ready')

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal], [data-text-motion], [data-stagger]')
    )

    if (targets.length === 0) {
      return () => {
        document.documentElement.classList.remove('reveal-motion-ready')
      }
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      targets.forEach((target) => {
        target.setAttribute('data-visible', 'true')
      })
      return () => {
        document.documentElement.classList.remove('reveal-motion-ready')
      }
    }

    // Reset attribute so the reveal can re-trigger after navigation
    targets.forEach((target) => {
      target.removeAttribute('data-visible')
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const target = entry.target as HTMLElement
          target.setAttribute('data-visible', 'true')
          observer.unobserve(target)
        })
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12,
      }
    )

    targets.forEach((target) => {
      // If element is already in viewport on mount, reveal immediately
      const rect = target.getBoundingClientRect()
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0
      if (inViewport) {
        target.setAttribute('data-visible', 'true')
      } else {
        observer.observe(target)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [pathname])

  return null
}
