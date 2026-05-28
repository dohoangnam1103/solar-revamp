'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const DESKTOP_VIDEO_QUERY = '(min-width: 768px)'

function subscribeToDesktopVideo(callback: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_VIDEO_QUERY)
  mediaQuery.addEventListener('change', callback)
  return () => mediaQuery.removeEventListener('change', callback)
}

function getDesktopVideoSnapshot() {
  return window.matchMedia(DESKTOP_VIDEO_QUERY).matches
}

function getServerSnapshot() {
  return false
}

/**
 * Background video for the quote section. Loads only on desktop AND only
 * when the section approaches the viewport, to avoid eating bandwidth on
 * users who never scroll past the hero.
 */
export default function QuoteBackgroundVideo() {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldMount, setShouldMount] = useState(false)

  const isDesktop = useSyncExternalStore(
    subscribeToDesktopVideo,
    getDesktopVideoSnapshot,
    getServerSnapshot
  )

  // Lazy-mount the <video> only when the section is close to the viewport
  useEffect(() => {
    if (!isDesktop || shouldMount) return
    const node = sentinelRef.current
    if (!node) {
      setShouldMount(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldMount(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: '400px 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [isDesktop, shouldMount])

  useEffect(() => {
    if (!shouldMount) return
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => {
      // Browsers may block background autoplay — keep poster visible.
    })
  }, [shouldMount])

  if (!shouldMount) {
    return <div ref={sentinelRef} className="pointer-events-none absolute inset-0 z-0" />
  }

  return (
    <video
      ref={videoRef}
      className="pointer-events-none absolute inset-0 z-0 object-cover"
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
    >
      <source src="/videos/quote-background.mp4" type="video/mp4" />
    </video>
  )
}
