'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

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

export default function QuoteBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const shouldLoadVideo = useSyncExternalStore(
    subscribeToDesktopVideo,
    getDesktopVideoSnapshot,
    getServerSnapshot
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.play().catch(() => {
      // Keep the poster visible when a browser blocks background autoplay.
    })
  }, [shouldLoadVideo])

  if (!shouldLoadVideo) {
    return null
  }

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 object-cover"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster="/illustrations/solar-ev-charging.webp"
    >
      <source src="/videos/quote-background.mp4" type="video/mp4" />
    </video>
  )
}
