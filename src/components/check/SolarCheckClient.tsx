'use client'

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CompassCard } from './CompassCard'
import { PermissionGate } from './PermissionGate'
import { ScoreCard } from './ScoreCard'
import { SensorReadout } from './SensorReadout'
import { useDeviceOrientation, useGeolocation } from '@/lib/check/sensors'
import {
  annualEnergy,
  headingToAlpha,
  instantPower,
  normalToOrientation,
  panelNormal,
  screenNormalFromOrientation,
  sunVector,
} from '@/lib/check/solar'
import type { GeoPoint, PanelOrientation } from '@/lib/check/types'

export function SolarCheckClient() {
  const geo = useGeolocation()
  const ori = useDeviceOrientation()

  /* ---------------------- Resolved geo & orientation ---------------------- */
  const resolvedGeo: GeoPoint | null = useMemo(() => {
    if (geo.lat != null && geo.lon != null) {
      return { lat: geo.lat, lon: geo.lon }
    }
    return null
  }, [geo.lat, geo.lon])

  const liveOrientation: PanelOrientation = useMemo(() => {
    if (
      ori.beta != null &&
      ori.gamma != null &&
      (ori.headingDeg != null || ori.alpha != null)
    ) {
      // Làm tròn 1° để hạn chế re-render do noise/precision của sensor (~50Hz)
      const heading =
        ori.headingDeg != null ? Math.round(ori.headingDeg) : null
      const alpha =
        heading != null ? headingToAlpha(heading) : Math.round(ori.alpha ?? 0)
      const beta = Math.round(ori.beta)
      const gamma = Math.round(ori.gamma)
      const n = screenNormalFromOrientation(alpha, beta, gamma)
      const o = normalToOrientation(n)
      return {
        azimuthDeg: Math.round(o.azimuthDeg),
        tiltDeg: Math.round(o.tiltDeg),
      }
    }
    return { azimuthDeg: 0, tiltDeg: 0 }
  }, [ori.alpha, ori.beta, ori.gamma, ori.headingDeg])

  /* -------------- Throttled orientation cho phần tích phân năm ------------- */
  // Cảm biến iOS bắn ~50Hz → mỗi event tạo object mới → debounce sẽ không bao
  // giờ fire vì timer bị reset liên tục. Dùng throttle: update đều 200ms / lần.
  const liveRef = useRef(liveOrientation)
  useEffect(() => {
    liveRef.current = liveOrientation
  }, [liveOrientation])

  const [stableOri, setStableOri] = useState<PanelOrientation>(liveOrientation)
  useEffect(() => {
    const id = setInterval(() => setStableOri(liveRef.current), 200)
    return () => clearInterval(id)
  }, [])

  /* ---------------------------- Tính năng lượng ---------------------------- */
  // useDeferredValue: nếu UI đang busy (sensor event mới), React sẽ render với
  // giá trị cũ trước rồi mới chạy compute với giá trị mới ở priority thấp.
  const deferredOri = useDeferredValue(stableOri)

  const annual = useMemo(() => {
    if (!resolvedGeo) return null
    return annualEnergy(resolvedGeo, deferredOri)
  }, [resolvedGeo, deferredOri])

  // "Best" tham chiếu: panel hướng Nam (Bắc bán cầu) / Bắc (Nam bán cầu),
  // tilt = |lat| (xấp xỉ tốt cho cả năm). Mỗi cập nhật geo mới tính lại.
  const bestAnnual = useMemo(() => {
    if (!resolvedGeo) return null
    const az = resolvedGeo.lat >= 0 ? 180 : 0
    const tilt = Math.min(60, Math.max(0, Math.abs(resolvedGeo.lat)))
    return annualEnergy(resolvedGeo, { azimuthDeg: az, tiltDeg: tilt })
  }, [resolvedGeo])

  /* ---------------------- Công suất tức thời (real-time) ------------------- */
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const instantW = useMemo(() => {
    if (!resolvedGeo) return 0
    const n = panelNormal(liveOrientation)
    const sun = sunVector(new Date(nowMs), resolvedGeo)
    return instantPower(n, sun)
  }, [nowMs, resolvedGeo, liveOrientation])

  /* ----------------------------- Quyền cảm biến --------------------------- */
  const triggeredRef = useRef(false)

  const requestAll = async () => {
    triggeredRef.current = true
    try {
      if (!geo.watching) {
        geo.start()
      }
      // Gọi requestPermission TRỰC TIẾP trong handler để giữ user-activation
      await ori.requestPermission()
    } catch (err) {
      console.error('Sensor permission request failed', err)
    }
  }
  // Geo trên desktop / Android không cần user-gesture, có thể start luôn.
  // triggeredRef đảm bảo không gọi lại sau khi user đã trigger qua nút.
  useEffect(() => {
    if (!triggeredRef.current && geo.supported && !geo.watching) {
      geo.start()
    }
  }, [geo.supported, geo.watching, geo.start])

  const geoReady = geo.lat != null
  const oriReady =
    ori.beta != null &&
    ori.gamma != null &&
    (ori.headingDeg != null || ori.alpha != null)

  const computing = annual == null && resolvedGeo != null

  const scorePct =
    annual != null && bestAnnual
      ? Math.round((annual / bestAnnual) * 100)
      : null

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-10 pt-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          ☀️ Solar Panel Placement
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Đặt mặt sau điện thoại theo hướng &amp; góc bạn dự định lắp tấm pin.
          Số điểm sẽ thay đổi theo thời gian thực.
        </p>
      </header>

      <CompassCard
        headingDeg={ori.headingDeg}
        supported={ori.supported}
        absolute={ori.absolute}
        scorePct={scorePct}
        computing={computing}
      />

      <PermissionGate
        geoSupported={geo.supported}
        geoError={geo.error}
        geoReady={geoReady}
        oriSupported={ori.supported}
        oriError={ori.error}
        oriReady={oriReady}
        onRequest={requestAll}
      />

      {geoReady && oriReady && (
        <>
          <ScoreCard
            instantWPerM2={instantW}
            annualKWhPerM2={annual}
            bestAnnualKWhPerM2={bestAnnual}
            orientation={liveOrientation}
            computing={computing}
          />

          <SensorReadout
            geo={resolvedGeo}
            geoAccuracyM={geo.accuracyM}
            orientation={liveOrientation}
            absolute={ori.absolute}
          />
        </>
      )}

      <footer className="mt-2 text-center text-xs text-slate-400">
        Mô hình clear-sky đơn giản (Kasten-Young + Bird). Không tính bóng che,
        mây, ô nhiễm. Số liệu mang tính tương đối để so sánh các vị trí.
      </footer>
    </div>
  )
}
