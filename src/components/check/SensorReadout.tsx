'use client'

import { compassLabel } from '@/lib/check/solar'
import type { PanelOrientation, GeoPoint } from '@/lib/check/types'

type Props = {
  geo: GeoPoint | null
  geoAccuracyM: number | null
  orientation: PanelOrientation
  absolute: boolean
}

export function SensorReadout({
  geo,
  geoAccuracyM,
  orientation,
  absolute,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Cảm biến
      </h2>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Stat
          label="Hướng panel"
          value={`${orientation.azimuthDeg.toFixed(0)}°`}
          sub={compassLabel(orientation.azimuthDeg)}
        />
        <Stat
          label="Nghiêng"
          value={`${orientation.tiltDeg.toFixed(0)}°`}
          sub={
            orientation.tiltDeg < 5
              ? 'gần như nằm ngang'
              : orientation.tiltDeg > 80
                ? 'gần như dựng đứng'
                : ''
          }
        />
        <Stat
          label="Vĩ độ"
          value={geo ? geo.lat.toFixed(5) : '—'}
          sub={geo ? 'lat' : ''}
        />
        <Stat
          label="Kinh độ"
          value={geo ? geo.lon.toFixed(5) : '—'}
          sub={geoAccuracyM != null ? `±${geoAccuracyM.toFixed(0)} m` : ''}
        />
      </div>

      {!absolute && (
        <p className="mt-3 rounded-lg bg-amber-100 px-3 py-2 text-xs text-amber-900">
          Cảm biến la bàn hiện không được coi là tuyệt đối. Hãy hiệu chuẩn bằng
          cách lắc điện thoại theo hình số 8 vài lần.
        </p>
      )}
    </section>
  )
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="check-tabular mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  )
}
