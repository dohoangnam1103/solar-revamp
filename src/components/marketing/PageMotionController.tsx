'use client'

import { useEffect } from 'react'

export default function PageMotionController() {
  useEffect(() => {
    let style = document.getElementById('soliq-page-motion-styles')
    if (!style) {
      style = document.createElement('style')
      style.id = 'soliq-page-motion-styles'
      document.head.appendChild(style)
    }

    style.textContent = `
        [data-reveal] {
          opacity: 0;
          transform: translate3d(0, 24px, 0);
          filter: blur(8px);
          transition:
            opacity 700ms ease,
            transform 700ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 700ms ease;
          transition-delay: var(--reveal-delay, 0ms);
          will-change: opacity, transform, filter;
        }
        [data-reveal][data-visible='true'] {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          filter: blur(0);
        }
        [data-text-motion] {
          opacity: 0;
          transform: translate3d(0, 18px, 0);
          filter: blur(7px);
          transition:
            opacity 820ms ease,
            transform 820ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 820ms ease;
          transition-delay: calc(var(--reveal-delay, 0ms) + 120ms);
          will-change: opacity, transform, filter;
        }
        [data-reveal][data-visible='true'] [data-text-motion],
        [data-text-motion][data-visible='true'] {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          filter: blur(0);
        }
        .motion-title {
          position: relative;
          display: inline-block;
          background-image:
            linear-gradient(90deg, currentColor 0%, currentColor 42%, rgba(22, 163, 74, 0.72) 50%, currentColor 58%, currentColor 100%);
          background-size: 230% 100%;
          background-position: 100% 50%;
          -webkit-background-clip: text;
          background-clip: text;
        }
        [data-reveal][data-visible='true'] .motion-title,
        .motion-title[data-visible='true'] {
          animation: motion-title-sweep 1400ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(var(--reveal-delay, 0ms) + 260ms);
        }
        @keyframes motion-title-sweep {
          from { background-position: 100% 50%; }
          to { background-position: 0% 50%; }
        }
        .motion-surface,
        .motion-card,
        .motion-glass-button {
          transition:
            transform 240ms ease,
            border-color 240ms ease,
            box-shadow 240ms ease,
            background-color 240ms ease;
        }
        .motion-surface:hover,
        .motion-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 70px rgba(37, 93, 43, 0.16);
        }
        .motion-card:hover {
          border-color: rgba(34, 197, 94, 0.34);
        }
        .motion-icon,
        .motion-icon-box {
          transition: transform 240ms ease;
        }
        .motion-card:hover .motion-icon,
        .motion-icon-box:hover {
          transform: scale(1.08) rotate(-3deg);
        }
        .motion-glass-button:hover {
          transform: translateY(-2px);
        }
        .cta-shine {
          overflow: hidden;
        }
        .cta-shine:not(.absolute):not(.fixed):not(.sticky) {
          position: relative;
        }
        .cta-shine::after {
          content: '';
          position: absolute;
          inset: -40% auto -40% 0;
          width: 42%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.34), transparent);
          animation: cta-shine 4.8s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes cta-shine {
          0% { transform: translateX(-130%) skewX(-18deg); }
          34%, 100% { transform: translateX(260%) skewX(-18deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] {
            opacity: 1;
            transform: none;
            filter: none;
            transition: none;
          }
          [data-text-motion] {
            opacity: 1;
            transform: none;
            filter: none;
            transition: none;
          }
          .motion-title {
            animation: none;
            background-image: none;
          }
          .motion-surface,
          .motion-card,
          .motion-glass-button,
          .motion-icon,
          .motion-icon-box {
            transition: none;
          }
          .motion-surface:hover,
          .motion-card:hover,
          .motion-card:hover .motion-icon,
          .motion-icon-box:hover,
          .motion-glass-button:hover {
            transform: none;
          }
          .cta-shine::after {
            animation: none;
            display: none;
          }
        }
    `

    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal], [data-text-motion]'))
    if (targets.length === 0) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      targets.forEach((target) => {
        target.dataset.visible = 'true'
      })
      return
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
    return () => observer.disconnect()
  }, [])

  return null
}
