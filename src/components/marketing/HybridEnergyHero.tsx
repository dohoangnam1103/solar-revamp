'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import {
  BatteryCharging,
  CalendarCheck,
  Cpu,
  Leaf,
  Moon,
  ShieldCheck,
  Sun,
  TriangleAlert,
} from 'lucide-react'

type Mode = 'day' | 'night' | 'outage'
type NodeKey = 'solar' | 'inverter' | 'battery' | 'charger' | 'grid'

const MODES: Array<{
  id: Mode
  label: string
  icon: typeof Sun
  title: string
  description: string
  production: string
  battery: string
  grid: string
}> = [
  {
    id: 'day',
    label: 'Ban ngày',
    icon: Sun,
    title: 'Ánh sáng mặt trời',
    description: 'Tạo điện tức thời, cấp tải trong nhà, sạc pin và xuất phần dư ra lưới.',
    production: '24.75 kWh',
    battery: '85%',
    grid: '+2.45 kWh',
  },
  {
    id: 'night',
    label: 'Buổi tối',
    icon: Moon,
    title: 'Pin lưu trữ cấp tải',
    description: 'Khi hết nắng, hệ hybrid ưu tiên dùng điện đã lưu để giảm mua điện giờ cao điểm.',
    production: '0.8 kWh',
    battery: '62%',
    grid: '0.35 kWh',
  },
  {
    id: 'outage',
    label: 'Mất điện',
    icon: TriangleAlert,
    title: 'Backup tải thiết yếu',
    description: 'Tự động tách lưới và giữ các thiết bị quan trọng hoạt động bằng pin lưu trữ.',
    production: '8.2 kWh',
    battery: '48%',
    grid: 'Tách lưới',
  },
]

const ENERGY_FLOWS: Record<
  Mode,
  Array<{
    d: string
    gradient: FlowGradient
    delay?: string
  }>
> = {
  day: [
    { d: 'M540 318 C660 370 812 474 898 640', gradient: 'solarLine', delay: '-0.2s' },
    { d: 'M1392 505 C1240 560 1080 602 922 648', gradient: 'greenLine', delay: '-0.45s' },
    { d: 'M895 655 C850 646 812 664 760 706', gradient: 'greenLine', delay: '-0.65s' },
    { d: 'M920 670 C986 694 1050 704 1118 692', gradient: 'cyanLine', delay: '-0.8s' },
  ],
  night: [
    { d: 'M760 706 C812 664 850 646 895 655', gradient: 'greenLine' },
    { d: 'M920 670 C986 694 1050 704 1118 692', gradient: 'cyanLine', delay: '-0.35s' },
  ],
  outage: [
    { d: 'M540 318 C660 370 812 474 898 640', gradient: 'solarLine', delay: '-0.2s' },
    { d: 'M895 655 C850 646 812 664 760 706', gradient: 'greenLine', delay: '-0.35s' },
    { d: 'M920 670 C986 694 1050 704 1118 692', gradient: 'cyanLine', delay: '-0.5s' },
  ],
}

export default function HybridEnergyHero() {
  const [mode, setMode] = useState<Mode>('day')
  const [activeNode, setActiveNode] = useState<NodeKey | null>(null)

  return (
    <section className="relative min-h-screen overflow-hidden bg-white text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_32%,rgba(16,185,129,0.16),transparent_26%),radial-gradient(circle_at_84%_78%,rgba(14,165,233,0.14),transparent_24%),linear-gradient(135deg,#ffffff_0%,#f8fffb_48%,#eefaf6_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,118,110,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.055)_1px,transparent_1px)] bg-[size:54px_54px] opacity-75" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[0.42fr_0.58fr] lg:px-8 lg:pb-20 lg:pt-32">
        <div className="relative z-20 flex flex-col justify-start pb-8 pt-8 lg:justify-center lg:pb-0 lg:pt-0">
          <p className="text-sm font-bold uppercase tracking-[0.36em] text-emerald-700">
            SOLIQ ENERGY
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-black uppercase leading-[1.08] tracking-normal sm:text-5xl lg:text-[3.35rem]">
            Năng lượng mặt trời, giải pháp năng lượng thông minh cho tương lai
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-700 sm:text-lg">
            SOLIQ ENERGY cung cấp giải pháp điện mặt trời hybrid tích hợp lưu trữ,
            tối ưu hiệu quả, vận hành thông minh và bền vững.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="tel:0902211893"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-[0_18px_52px_rgba(255,138,0,0.28)] transition-colors hover:bg-orange-600"
            >
              <CalendarCheck className="h-4 w-4" />
              Nhận tư vấn miễn phí
            </a>
            <Link
              href="/he-thong-hybrid-luu-tru"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-700/35 bg-white/70 px-6 py-3 font-bold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50"
            >
              <Cpu className="h-4 w-4" />
              Khám phá giải pháp
            </Link>
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-4 divide-x divide-emerald-900/12">
            {[
              { icon: ShieldCheck, label: 'Công nghệ hiện đại' },
              { icon: Leaf, label: 'Hiệu quả tối ưu' },
              { icon: BatteryCharging, label: 'Lưu trữ thông minh' },
              { icon: Cpu, label: 'Vận hành tự động' },
            ].map((item) => (
              <div key={item.label} className="px-3 first:pl-0">
                <item.icon className="mx-auto h-7 w-7 text-emerald-700" />
                <p className="mt-2 text-center text-xs font-medium leading-5 text-slate-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 min-h-[620px] lg:min-h-0">
          <div className="absolute right-0 top-0 z-30 grid w-full max-w-md grid-cols-3 rounded-2xl border border-emerald-700/20 bg-white/80 p-1.5 shadow-lg backdrop-blur-md">
            {MODES.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`rounded-xl px-3 py-3 text-sm font-bold transition-all ${
                    mode === item.id
                      ? 'bg-emerald-600 text-white shadow-[0_12px_30px_rgba(16,185,129,0.18)]'
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Icon className={`mx-auto mb-1 h-5 w-5 ${mode === item.id ? 'text-white' : 'text-emerald-700'}`} />
                  {item.label}
                </button>
              )
            })}
          </div>

          <div className="absolute left-0 right-0 top-24 h-[560px] lg:top-20">
            <SolarHouse onSelect={setActiveNode} activeNode={activeNode} mode={mode} />
          </div>

        </div>
      </div>
    </section>
  )
}

function SolarHouse({
  activeNode,
  mode,
  onSelect,
}: {
  activeNode: NodeKey | null
  mode: Mode
  onSelect: (node: NodeKey) => void
}) {
  return (
    <div className="absolute inset-0">
      <div className="absolute bottom-0 left-[8%] right-[-12%] top-[17%] z-20">
        <Image
          src="/hero/hybrid-system-3d-transparent-grid-clean.png"
          alt="Hệ thống điện mặt trời hybrid gồm nhà lắp pin, pin lưu trữ, inverter, sạc xe điện và lưới điện"
          fill
          priority
          sizes="(min-width: 1024px) 760px, 100vw"
          className="object-contain object-bottom drop-shadow-[0_34px_90px_rgba(0,0,0,0.55)]"
        />
        <EnergyNetwork mode={mode} />
        <AssetHotspot active={activeNode === 'solar'} label="Tấm pin" x={170} y={155} width={640} height={250} onClick={() => onSelect('solar')} />
        <AssetHotspot active={activeNode === 'battery'} label="Pin lưu trữ" x={650} y={540} width={170} height={300} onClick={() => onSelect('battery')} />
        <AssetHotspot active={activeNode === 'inverter'} label="Inverter" x={835} y={635} width={130} height={210} onClick={() => onSelect('inverter')} />
        <AssetHotspot active={activeNode === 'charger'} label="Sạc xe điện" x={1030} y={585} width={145} height={280} onClick={() => onSelect('charger')} />
        <AssetHotspot active={activeNode === 'grid'} label="Lưới điện" x={1290} y={145} width={250} height={560} onClick={() => onSelect('grid')} />
      </div>

    </div>
  )
}

function AssetHotspot({
  active,
  height,
  label,
  onClick,
  width,
  x,
  y,
}: {
  active: boolean
  height: number
  label: string
  onClick: () => void
  width: number
  x: number
  y: number
}) {
  const handleClick = () => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      return
    }

    onClick()
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      className="group absolute z-40 rounded-2xl outline-none"
      style={{
        left: `${(x / 1660) * 100}%`,
        top: `${(y / 947) * 100}%`,
        width: `${(width / 1660) * 100}%`,
        height: `${(height / 947) * 100}%`,
      }}
    >
      <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-300/25 bg-black/55 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur transition-opacity group-focus-visible:opacity-100 md:group-hover:opacity-100 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}>
        {label}
      </span>
    </button>
  )
}

function EnergyNetwork({ mode }: { mode: Mode }) {
  const flows = ENERGY_FLOWS[mode]

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      viewBox="0 0 1660 947"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <filter id="glowStrong">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="13" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="solarLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="greenLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#9aff6a" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="cyanLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>

      {mode !== 'night' ? (
        <image
          href="/hero/sun-3d.png"
          x="304"
          y="-12"
          width="176"
          height="176"
          preserveAspectRatio="xMidYMid meet"
          filter="url(#sunGlow)"
        />
      ) : null}

      {flows.map((flow) => (
        <Flow key={`${mode}-${flow.d}`} d={flow.d} gradient={flow.gradient} delay={flow.delay} />
      ))}
    </svg>
  )
}

type FlowGradient = 'solarLine' | 'greenLine' | 'cyanLine'

function Flow({
  delay,
  d,
  gradient,
}: {
  delay?: string
  d: string
  gradient: FlowGradient
}) {
  return (
    <>
      <path d={d} fill="none" stroke="rgba(255,255,255,0.10)" strokeLinecap="round" strokeWidth="9" />
      <path
        d={d}
        fill="none"
        stroke={`url(#${gradient})`}
        strokeDasharray="16 14"
        strokeLinecap="round"
        strokeWidth="4"
        className="energy-flow-path"
        filter="url(#glowStrong)"
        style={{ animationDelay: delay }}
      />
    </>
  )
}
