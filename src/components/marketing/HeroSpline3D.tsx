'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Phone, Sparkles } from 'lucide-react'

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <Skeleton label="Đang tải mô phỏng 3D" />,
})

// ─── SCENE URL ───────────────────────────────────────────────────────────────
// Paste your own Spline scene's .splinecode URL here.
// How to get one:
//   1. Sign up at https://spline.design (free)
//   2. Create or remix a scene from https://community.spline.design
//   3. File → Export → Code Export → React → copy the URL ending in /scene.splinecode
// Leave empty to show the static fallback below.
const SPLINE_SCENE_URL = ''
const SHOW_HERO_VISUAL = false
// ─────────────────────────────────────────────────────────────────────────────

function Skeleton({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_30%,rgba(255,184,75,0.18),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(14,165,233,0.16),transparent_55%)]">
      <div className="flex flex-col items-center gap-3 text-emerald-700/80">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600/30 border-t-emerald-600" />
        <span className="text-xs font-medium uppercase tracking-[0.18em]">{label}</span>
      </div>
    </div>
  )
}

function StaticFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,184,75,0.45),transparent_45%),radial-gradient(circle_at_72%_78%,rgba(14,165,233,0.35),transparent_45%),linear-gradient(135deg,#fff7ed_0%,#ecfdf5_50%,#e0f2fe_100%)]" />
      <div className="absolute inset-x-6 top-6 inline-flex items-center gap-2 self-start rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-emerald-700 backdrop-blur w-fit">
        <Sparkles className="h-3.5 w-3.5" />
        Mô phỏng 3D sẽ sớm ra mắt
      </div>
      <div className="absolute inset-0 grid place-items-center p-8">
        <Image
          src="/hero/solar-node-house.webp"
          alt="Hệ thống điện mặt trời SOLIQ"
          width={520}
          height={520}
          priority
          className="h-auto max-h-full w-auto max-w-full object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  )
}

function SplineSceneWithErrorBoundary({ url }: { url: string }) {
  const [errored, setErrored] = useState(false)
  if (errored) return <StaticFallback />
  return (
    <Spline
      scene={url}
      onError={(err) => {
        console.warn('Spline scene failed to load:', err)
        setErrored(true)
      }}
    />
  )
}

export default function HeroSpline3D() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const showScene = SPLINE_SCENE_URL && !reducedMotion

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f8fffe_0%,#effdf8_50%,#e8f7ff_100%)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(37,93,43,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(37,93,43,0.045)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute -left-24 top-16 -z-10 h-96 w-96 rounded-full bg-orange-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 -z-10 h-[28rem] w-[28rem] rounded-full bg-cyan-300/22 blur-3xl" />

      <div
        className={`mx-auto grid max-w-7xl gap-10 px-4 pb-8 pt-12 sm:px-6 sm:pt-16 lg:gap-8 lg:px-8 lg:pb-12 lg:pt-20 ${
          SHOW_HERO_VISUAL ? 'lg:grid-cols-[1.05fr_1.1fr]' : ''
        }`}
      >
        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
            SOLIQ ENERGY
          </p>
          <h1
            data-text-motion
            className="motion-title motion-title-soft mt-4 text-4xl font-extrabold leading-[1.08] text-gray-900 sm:text-5xl lg:text-6xl"
          >
            Năng lượng mặt trời <span className="text-green-700">cho tổ ấm thông minh</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Hệ thống điện mặt trời hòa lưới và hybrid lưu trữ, thiết kế tối ưu theo nhu cầu của
            gia đình và doanh nghiệp. Khảo sát miễn phí, báo giá minh bạch, bảo hành 25 năm.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/bao-gia-dien-mat-troi"
              className="cta-shine inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-7 py-3.5 text-base font-bold text-white shadow-lg transition-colors hover:bg-green-800"
            >
              Tính báo giá miễn phí
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="tel:0902211893"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white/85 px-7 py-3.5 text-base font-bold text-orange-600 backdrop-blur transition-colors hover:bg-orange-50"
            >
              <Phone className="h-5 w-5" />
              090.22.11.893
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Công trình</dt>
              <dd className="mt-1 text-2xl font-extrabold text-green-700">500+</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Bảo hành pin</dt>
              <dd className="mt-1 text-2xl font-extrabold text-green-700">25 năm</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Tiết kiệm</dt>
              <dd className="mt-1 text-2xl font-extrabold text-green-700">50-100%</dd>
            </div>
          </dl>
        </div>

        {SHOW_HERO_VISUAL && (
          <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-2xl backdrop-blur sm:h-[520px] lg:h-[600px]">
            {showScene ? (
              <SplineSceneWithErrorBoundary url={SPLINE_SCENE_URL} />
            ) : (
              <StaticFallback />
            )}
          </div>
        )}
      </div>
    </section>
  )
}
