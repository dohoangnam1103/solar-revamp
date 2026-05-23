'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Moon, ShieldCheck, Sun, Zap } from 'lucide-react'
import { useState } from 'react'

type Mode = 'solar' | 'storage' | 'backup'

const MODES: Record<
  Mode,
  {
    label: string
    title: string
    description: string
    icon: typeof Sun
    accent: string
  }
> = {
  solar: {
    label: 'Nắng cao điểm',
    title: 'Điện mặt trời ưu tiên cấp tải tức thời',
    description: 'Dòng năng lượng chạy từ mái pin vào hệ thống, cấp điện cho nhà và sạc phần dư vào pin lưu trữ.',
    icon: Sun,
    accent: 'from-orange-400 to-emerald-300',
  },
  storage: {
    label: 'Buổi tối',
    title: 'Pin lưu trữ giữ ngôi nhà sáng sau khi hết nắng',
    description: 'Hệ hybrid chuyển sang dùng điện đã lưu, giảm mua điện giờ cao điểm và giữ tải quan trọng ổn định.',
    icon: Moon,
    accent: 'from-cyan-300 to-blue-400',
  },
  backup: {
    label: 'Mất điện lưới',
    title: 'Backup tự động cho các thiết bị thiết yếu',
    description: 'Khi lưới gặp sự cố, inverter tách tải quan trọng và duy trì nguồn từ pin lưu trữ.',
    icon: ShieldCheck,
    accent: 'from-emerald-300 to-lime-300',
  },
}

const FLOW_PATHS = {
  solar: [
    'M242 205 C340 148 438 180 505 286',
    'M505 304 C426 335 328 330 226 282',
    'M520 302 C618 314 693 382 742 458',
    'M505 314 C465 370 419 420 382 488',
  ],
  storage: [
    'M848 228 C746 194 631 214 530 286',
    'M382 488 C424 412 466 350 505 306',
    'M520 316 C622 338 696 392 742 458',
    'M500 304 C420 270 326 242 242 205',
  ],
  backup: [
    'M382 488 C424 410 464 350 505 306',
    'M504 306 C420 270 326 242 242 205',
    'M520 316 C622 338 696 392 742 458',
  ],
}

const SYSTEM_NODES = [
  {
    name: 'Nhà dùng điện mặt trời',
    tooltip: 'Nhà đang sử dụng điện từ hệ hybrid',
    src: '/hero/solar-node-house.png',
    className: 'left-[1%] top-[6%] w-[42%] sm:w-[39%]',
  },
  {
    name: 'Inverter hybrid',
    tooltip: 'Inverter',
    src: '/hero/solar-node-inverter.png',
    className: 'left-[39%] top-[20%] w-[22%] sm:w-[20%]',
  },
  {
    name: 'Pin lưu trữ',
    tooltip: 'Pin lưu trữ',
    src: '/hero/solar-node-battery.png',
    className: 'left-[25%] top-[61%] w-[28%] sm:w-[25%]',
  },
  {
    name: 'Sạc xe điện',
    tooltip: 'Sạc ô tô điện',
    src: '/hero/solar-node-ev.png',
    className: 'left-[58%] top-[56%] w-[43%] sm:w-[39%]',
  },
  {
    name: 'Lưới điện',
    tooltip: 'Điện lưới',
    src: '/hero/solar-node-grid.png',
    className: 'left-[75%] top-[1%] w-[22%] sm:w-[20%]',
  },
]

export default function SolarSystemExperience() {
  const [mode, setMode] = useState<Mode>('solar')
  const active = MODES[mode]
  const ActiveIcon = active.icon

  return (
    <section className="relative isolate min-h-[calc(100vh-4rem)] overflow-hidden bg-[#f4fffb] text-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_24%_18%,rgba(255,184,77,0.24),transparent_28%),radial-gradient(circle_at_78%_25%,rgba(53,199,232,0.18),transparent_30%),radial-gradient(circle_at_56%_76%,rgba(52,211,153,0.18),transparent_32%),linear-gradient(135deg,#ffffff_0%,#f2fff8_42%,#e9f8ff_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(37,93,43,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(37,93,43,0.055)_1px,transparent_1px)] bg-[size:56px_56px] opacity-70" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-white to-transparent" />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-14 px-4 py-14 sm:gap-20 sm:px-6 lg:px-8 lg:py-16 xl:grid-cols-[0.42fr_0.58fr] xl:gap-10 xl:py-12">
        <div className="contents xl:relative xl:z-20 xl:block xl:w-full xl:max-w-xl">
          <div className="relative z-20 order-1 mx-auto w-full max-w-3xl text-center xl:mx-0 xl:max-w-xl xl:text-left">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-600/18 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-800 shadow-[0_16px_45px_rgba(37,93,43,0.08)] backdrop-blur">
              <Zap className="h-4 w-4 text-orange-500" />
              Mô phỏng dòng điện
            </div>
            <h2 data-text-motion className="motion-title motion-title-soft text-4xl font-black leading-[1.1] tracking-normal sm:text-5xl lg:text-[4.35rem]">
              Nhìn thấy dòng điện mặt trời vận hành trước khi lắp đặt.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg xl:mx-0 xl:max-w-lg">
              Một mô phỏng trực quan cho hệ hybrid: tạo điện, lưu trữ, cấp tải và
              backup khi lưới gặp sự cố.
            </p>
          </div>

          <div className="relative z-20 order-3 -mt-4 mx-auto w-full max-w-3xl text-center sm:-mt-8 xl:mt-0 xl:mx-0 xl:max-w-xl xl:text-left">
            <div className="mx-auto mt-4 grid max-w-2xl grid-cols-3 gap-2 sm:mt-5 xl:mt-8 xl:mx-0">
              {(Object.keys(MODES) as Mode[]).map((item) => {
                const itemData = MODES[item]
                const Icon = itemData.icon
                const selected = item === mode

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={`cursor-pointer rounded-2xl border px-2 py-3 text-left transition-all sm:px-4 ${
                      selected
                        ? 'border-emerald-500/70 bg-emerald-50 text-emerald-950 shadow-[0_18px_45px_rgba(16,185,129,0.16)]'
                        : 'border-emerald-900/10 bg-white/65 text-slate-700 hover:border-emerald-500/35 hover:bg-white'
                    }`}
                  >
                    <Icon className={`mb-2 h-4 w-4 sm:h-5 sm:w-5 ${selected ? 'text-orange-500' : 'text-emerald-700/75'}`} />
                    <span className="block text-xs font-bold leading-tight sm:text-sm">{itemData.label}</span>
                  </button>
                )
              })}
            </div>

            <Link
              href="/he-thong-hybrid-luu-tru"
              className="mt-8 inline-flex items-center rounded-2xl bg-orange-500 px-6 py-3 font-bold text-white shadow-[0_20px_55px_rgba(255,138,0,0.24)] transition-colors hover:bg-orange-600"
            >
              Xem giải pháp Hybrid
            </Link>
          </div>
        </div>

        <div className="relative order-2 mx-auto min-h-[390px] w-full max-w-4xl sm:min-h-[520px] lg:min-h-[610px] xl:order-none xl:min-h-[690px] xl:max-w-none">
          <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/28 blur-3xl" />

          <div className="absolute inset-x-0 -bottom-10 z-20 mx-auto aspect-[1000/640] w-full max-w-[900px] origin-center xl:bottom-8 xl:w-[112%]">
            <div className="absolute inset-0 rounded-[2rem] border border-emerald-900/10 bg-white/48 shadow-[0_35px_110px_rgba(37,93,43,0.14)] backdrop-blur-[2px]" />
            {mode !== 'storage' ? (
              <div
                className="energy-spark absolute left-[13%] top-[8%] z-40 flex h-7 w-7 items-center justify-center rounded-full border border-orange-300/70 bg-orange-100/80 text-orange-500 shadow-[0_0_70px_rgba(251,191,36,0.45)] backdrop-blur-sm sm:h-16 sm:w-16"
                aria-hidden="true"
              >
                <Sun className="h-4 w-4 sm:h-10 sm:w-10" />
              </div>
            ) : null}

            <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" viewBox="0 0 1000 640" aria-hidden="true">
              <defs>
                <linearGradient id="flowSolar" x1="0" x2="1" y1="0" y2="0">
                  <stop stopColor="#ffb84d" />
                  <stop offset="0.52" stopColor="#34d399" />
                  <stop offset="1" stopColor="#22d3ee" />
                </linearGradient>
                <filter id="flowGlow">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {FLOW_PATHS[mode].map((path, index) => (
                <path
                  key={path}
                  d={path}
                  className="energy-stream"
                  style={{ animationDelay: `${index * -0.35}s` }}
                  stroke="url(#flowSolar)"
                  strokeLinecap="round"
                  strokeWidth="4"
                  fill="none"
                  filter="url(#flowGlow)"
                />
              ))}
            </svg>

            {SYSTEM_NODES.map((node, index) => (
              <div
                key={node.name}
                className={`group absolute z-30 aspect-square outline-none ${node.className}`}
                style={{ animationDelay: `${index * -0.18}s` }}
                tabIndex={0}
              >
                <Image
                  src={node.src}
                  alt={node.name}
                  fill
                  priority={index < 2}
                  sizes="(min-width: 1024px) 340px, 42vw"
                  className="object-contain drop-shadow-[0_28px_70px_rgba(0,0,0,0.48)]"
                />
                <div className="pointer-events-none absolute left-1/2 top-0 z-50 -translate-x-1/2 -translate-y-[70%] whitespace-nowrap rounded-full border border-white/18 bg-slate-950/86 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:-translate-y-[86%] group-hover:opacity-100 group-focus:-translate-y-[86%] group-focus:opacity-100">
                  {node.tooltip}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute -top-10 left-1/2 z-40 w-[min(88%,20rem)] -translate-x-1/2 rounded-3xl border border-emerald-900/10 bg-white/76 p-4 shadow-[0_24px_70px_rgba(37,93,43,0.16)] backdrop-blur-xl sm:-top-16 lg:-top-12 xl:top-0">
            <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${active.accent}`} />
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black leading-snug text-slate-950">{active.title}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-600">{active.description}</p>
              </div>
            </div>
          </div>

          <div className="absolute left-4 top-16 z-10 h-28 w-28 rounded-full bg-orange-200/35 blur-2xl" />
        </div>
      </div>
    </section>
  )
}
