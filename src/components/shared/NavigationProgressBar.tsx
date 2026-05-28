'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * A top-of-page progress bar that animates during client-side navigation.
 *
 * Strategy:
 *  1. Intercept clicks on internal anchor links and show the bar immediately
 *     so the user gets feedback BEFORE Next.js starts fetching the new RSC payload.
 *  2. Hide the bar after `pathname` changes (which means the new route has rendered).
 */
export default function NavigationProgressBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const animationRef = useRef<number | null>(null)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastPathnameRef = useRef(pathname)

  const stopAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    stopAnimation()
    setVisible(true)
    setProgress(8)

    const tick = () => {
      setProgress((current) => {
        if (current >= 88) return current
        // Ease toward 88% — never finish until navigation completes
        const next = current + (90 - current) * 0.04
        return next
      })
      animationRef.current = requestAnimationFrame(tick)
    }
    animationRef.current = requestAnimationFrame(tick)
  }, [stopAnimation])

  const finish = useCallback(() => {
    stopAnimation()
    setProgress(100)
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    hideTimeoutRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 220)
  }, [stopAnimation])

  // Intercept link clicks to start the bar BEFORE the navigation latency
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      // Ignore middle/right click, modifier keys, etc.
      if (event.defaultPrevented) return
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // External links / new-tab / hashes / mailto / tel — skip
      if (anchor.target === '_blank') return
      if (anchor.hasAttribute('download')) return
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return

      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname && url.search === window.location.search) return
      } catch {
        return
      }

      start()
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true } as EventListenerOptions)
  }, [start])

  // When pathname changes the new page has rendered → finish + scroll to top
  useEffect(() => {
    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname
      finish()
      // Scroll to top of new page (Next.js doesn't always do this on RSC navigation)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [pathname, finish])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnimation()
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    }
  }, [stopAnimation])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-orange-400 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.7)] transition-[width,opacity] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  )
}
