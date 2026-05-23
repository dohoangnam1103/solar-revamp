'use client'

import Image from 'next/image'
import type { PointerEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

type ProjectImage = {
  src: string
  alt: string
}

type ProjectCarouselProps = {
  images: ProjectImage[]
}

export default function ProjectCarousel({ images }: ProjectCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef({ active: false, startX: 0, scrollLeft: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const carouselImages = useMemo(() => [...images, ...images, ...images], [images])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || images.length === 0) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const getSegmentWidth = () => scroller.scrollWidth / 3
    const centerTrack = () => {
      const segmentWidth = getSegmentWidth()
      if (segmentWidth > 0 && scroller.scrollLeft < 1) {
        scroller.scrollLeft = segmentWidth
      }
    }
    const normalizeLoop = () => {
      const segmentWidth = getSegmentWidth()
      if (segmentWidth <= 0) return

      if (scroller.scrollLeft >= segmentWidth * 2) {
        scroller.scrollLeft -= segmentWidth
      } else if (scroller.scrollLeft <= 0) {
        scroller.scrollLeft += segmentWidth
      }
    }

    centerTrack()

    if (prefersReducedMotion) return

    let frameId = 0
    let lastTime = performance.now()

    const tick = (time: number) => {
      const delta = time - lastTime
      lastTime = time

      if (!dragStateRef.current.active && !scroller.matches(':hover')) {
        scroller.scrollLeft += delta * 0.045
        normalizeLoop()
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [images.length])

  const normalizeLoopPosition = () => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const segmentWidth = scroller.scrollWidth / 3
    if (segmentWidth <= 0) return

    if (scroller.scrollLeft >= segmentWidth * 2) {
      scroller.scrollLeft -= segmentWidth
    } else if (scroller.scrollLeft <= 0) {
      scroller.scrollLeft += segmentWidth
    }
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller) return

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: scroller.scrollLeft,
    }
    setIsDragging(true)
    scroller.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller || !dragStateRef.current.active) return

    event.preventDefault()
    const delta = event.clientX - dragStateRef.current.startX
    scroller.scrollLeft = dragStateRef.current.scrollLeft - delta
    normalizeLoopPosition()
  }

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current
    if (!scroller || !dragStateRef.current.active) return

    dragStateRef.current.active = false
    setIsDragging(false)

    if (scroller.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId)
    }
    normalizeLoopPosition()
  }

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-32 bg-gradient-to-r from-[#f8fffe] to-transparent sm:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-32 bg-gradient-to-l from-[#f8fffe] to-transparent sm:block" />
      <div
        ref={scrollerRef}
        aria-label="Carousel công trình điện mặt trời đã lắp đặt"
        className={`project-carousel-scroll flex gap-4 overflow-x-hidden overflow-y-hidden px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
      >
        {carouselImages.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className="group relative h-56 w-[17rem] shrink-0 overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-[0_18px_55px_rgba(37,93,43,0.14)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(37,93,43,0.2)] sm:h-72 sm:w-[24rem] lg:h-80 lg:w-[30rem]"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              draggable={false}
              sizes="(max-width: 640px) 272px, (max-width: 1024px) 384px, 480px"
              className="pointer-events-none object-cover transition-transform duration-500 group-hover:scale-[1.035]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/34 via-transparent to-white/8" />
          </div>
        ))}
      </div>
    </div>
  )
}
