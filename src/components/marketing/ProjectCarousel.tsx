'use client'

import Image from 'next/image'
import type { PointerEvent } from 'react'
import { useRef, useState } from 'react'

type ProjectImage = {
  src: string
  alt: string
}

type ProjectCarouselProps = {
  images: ProjectImage[]
}

export default function ProjectCarousel({ images }: ProjectCarouselProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragStateRef = useRef({ active: false, startX: 0, startTranslateX: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const carouselImages = [...images, ...images, ...images]

  const getTrackTranslateX = () => {
    const track = trackRef.current
    if (!track) return 0

    const transform = window.getComputedStyle(track).transform
    if (!transform || transform === 'none') return 0

    return new DOMMatrixReadOnly(transform).m41
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current
    const track = trackRef.current
    if (!frame || !track) return

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      startTranslateX: getTrackTranslateX(),
    }

    setIsDragging(true)
    track.style.animationPlayState = 'paused'
    track.style.transform = `translateX(${dragStateRef.current.startTranslateX}px)`
    frame.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track || !dragStateRef.current.active) return

    event.preventDefault()
    const delta = event.clientX - dragStateRef.current.startX
    track.style.transform = `translateX(${dragStateRef.current.startTranslateX + delta}px)`
  }

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current
    const track = trackRef.current
    if (!frame || !track || !dragStateRef.current.active) return

    dragStateRef.current.active = false
    setIsDragging(false)

    if (frame.hasPointerCapture(event.pointerId)) {
      frame.releasePointerCapture(event.pointerId)
    }

    track.style.animationPlayState = ''
    track.style.transform = ''
  }

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] py-5">
      <div
        ref={frameRef}
        aria-label="Carousel công trình điện mặt trời đã lắp đặt"
        className={`project-carousel-frame overflow-x-auto overflow-y-hidden ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
      >
        <div ref={trackRef} className="project-carousel-track flex w-max gap-4 px-5 sm:gap-5">
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
    </div>
  )
}
