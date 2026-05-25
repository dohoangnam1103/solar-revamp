'use client'

import { useEffect } from 'react'

export default function PageMotionController() {
  useEffect(() => {
    document.documentElement.classList.add('reveal-motion-ready')

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal], [data-text-motion]'))
    if (targets.length === 0) {
      return () => document.documentElement.classList.remove('reveal-motion-ready')
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      targets.forEach((target) => {
        target.dataset.visible = 'true'
      })
      return () => document.documentElement.classList.remove('reveal-motion-ready')
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

    targets.forEach((target) => observer.observe(target))
    return () => {
      observer.disconnect()
      document.documentElement.classList.remove('reveal-motion-ready')
    }
  }, [])

  return null
}
