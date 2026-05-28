'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function PageMotionController() {
  const pathname = usePathname()

  useEffect(() => {
    // Reference pathname so this effect re-runs on every client navigation.
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

    // Reset visibility for all targets so they re-trigger on each navigation
    targets.forEach((target) => {
      if (prefersReducedMotion) {
        target.dataset.visible = 'true'
      } else if (target.dataset.visible !== 'true') {
        target.dataset.visible = 'false'
      }
    })

    if (prefersReducedMotion) {
      return () => {
        document.documentElement.classList.remove('reveal-motion-ready')
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const target = entry.target as HTMLElement
          target.dataset.visible = 'true'
          observer.unobserve(target)
        })
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12,
      }
    )

    targets.forEach((target) => {
      // If target is already visible (in viewport on mount), trigger immediately
      const rect = target.getBoundingClientRect()
      const inViewport = rect.top < window.innerHeight && rect.bottom > 0
      if (inViewport) {
        target.dataset.visible = 'true'
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
