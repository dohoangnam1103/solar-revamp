'use client'

import type { PanelOrientation } from '@/lib/check/types'

type Props = {
  /** W/m² hiện tại */
  instantWPerM2: number
  /** kWh/m²/năm */
  annualKWhPerM2: number | null
  /** kWh/m²/năm tối đa lý thuyết tại lat/lon (panel xoay tốt nhất) — để so sánh */
  bestAnnualKWhPerM2: number | null
  orientation: PanelOrientation
  computing: boolean
}

export function ScoreCard({
  instantWPerM2,
  annualKWhPerM2,
  bestAnnualKWhPerM2,
  computing,
}: Props) {
  const ratio =
    annualKWhPerM2 != null && bestAnnualKWhPerM2
      ? annualKWhPerM2 / bestAnnualKWhPerM2
      : null

  const ratioPct = ratio != null ? Math.round(ratio * 100) : null

  const tone =
    ratioPct == null
      ? 'from-slate-500 to-slate-700'
      : ratioPct >= 95
        ? 'from-emerald-500 to-emerald-700'
        : ratioPct >= 80
          ? 'from-lime-500 to-emerald-600'
          : ratioPct >= 60
            ? 'from-amber-500 to-orange-600'
            : 'from-rose-500 to-rose-700'

  return (
    <section
      className={
        'rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg ' + tone
      }
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-90">
          Điểm hiện tại
        </h2>
        {computing && (
          <span className="text-[11px] uppercase opacity-80">đang tính…</span>
        )}
      </div>

      <div className="mt-2 flex items-end gap-2">
        <div className="check-tabular text-5xl font-bold leading-none">
          {ratioPct != null ? ratioPct : '—'}
        </div>
        <div className="pb-1 text-2xl font-semibold opacity-90">/ 100</div>
      </div>
      <p className="mt-1 text-sm opacity-90">
        So với hướng + góc nghiêng tốt nhất tại vị trí này
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Mini
          label="Công suất hiện tại"
          value={`${instantWPerM2.toFixed(0)} W/m²`}
        />
        <Mini
          label="Cả năm"
          value={
            annualKWhPerM2 != null
              ? `${annualKWhPerM2.toFixed(0)} kWh/m²`
              : '—'
          }
        />
      </div>

      {bestAnnualKWhPerM2 != null && annualKWhPerM2 != null && (
        <p className="mt-3 text-xs opacity-90">
          Tốt nhất khả thi tại đây: ~{bestAnnualKWhPerM2.toFixed(0)} kWh/m²/năm.
          Mất {(bestAnnualKWhPerM2 - annualKWhPerM2).toFixed(0)} kWh/m² so với
          tối ưu.
        </p>
      )}
    </section>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
      <div className="text-[11px] uppercase tracking-wide opacity-90">
        {label}
      </div>
      <div className="check-tabular mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}
