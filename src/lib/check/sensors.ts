'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

const subscribeNoop = () => () => {}
const getServerUnsupported = () => false
const getGeoSupported = () =>
  typeof navigator !== 'undefined' && 'geolocation' in navigator
const getOrientationSupported = () =>
  typeof window !== 'undefined' && 'DeviceOrientationEvent' in window

/* -------------------------------------------------------------------------- */
/*                                Geolocation                                  */
/* -------------------------------------------------------------------------- */

export type GeoState = {
  lat: number | null
  lon: number | null
  accuracyM: number | null
  supported: boolean
  error: string | null
  watching: boolean
}

export function useGeolocation() {
  const supported = useSyncExternalStore(
    subscribeNoop,
    getGeoSupported,
    getServerUnsupported,
  )
  const [state, setState] = useState<GeoState>({
    lat: null,
    lon: null,
    accuracyM: null,
    supported: false,
    error: null,
    watching: false,
  })
  const watchId = useRef<number | null>(null)

  const start = useCallback(() => {
    if (typeof navigator === 'undefined') return
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'Trình duyệt không hỗ trợ geolocation' }))
      return
    }
    if (watchId.current !== null) return
    setState((s) => ({ ...s, watching: true, error: null }))
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState((s) => ({
          ...s,
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracyM: pos.coords.accuracy,
          error: null,
        }))
      },
      (err) => {
        setState((s) => ({ ...s, error: err.message, watching: false }))
        watchId.current = null
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 30_000 },
    )
  }, [])

  const stop = useCallback(() => {
    if (typeof navigator !== 'undefined' && watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
      setState((s) => ({ ...s, watching: false }))
    }
  }, [])

  useEffect(() => () => stop(), [stop])

  return { ...state, supported, start, stop }
}

/* -------------------------------------------------------------------------- */
/*                            Device Orientation                               */
/* -------------------------------------------------------------------------- */

export type OrientationState = {
  /** alpha (0..360) — quay quanh trục Z (vuông góc mặt đất) */
  alpha: number | null
  /** beta (-180..180) — nghiêng trước/sau */
  beta: number | null
  /** gamma (-90..90) — nghiêng trái/phải */
  gamma: number | null
  /** Compass heading (0..360, 0=Bắc) — tin cậy hơn alpha trên iOS */
  headingDeg: number | null
  /** Reading có tham chiếu Bắc thật (absolute) không */
  absolute: boolean
  supported: boolean
  permissionState: 'unknown' | 'granted' | 'denied' | 'prompt'
  error: string | null
  /** ms timestamp của event cuối — null nếu chưa nhận event nào */
  lastEventAt: number | null
}

type IOSOrientationCtor = {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

type IOSDeviceOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number
  webkitCompassAccuracy?: number
}

export function useDeviceOrientation() {
  const supported = useSyncExternalStore(
    subscribeNoop,
    getOrientationSupported,
    getServerUnsupported,
  )
  const [state, setState] = useState<OrientationState>({
    alpha: null,
    beta: null,
    gamma: null,
    headingDeg: null,
    absolute: false,
    supported: false,
    permissionState: 'unknown',
    error: null,
    lastEventAt: null,
  })
  const listening = useRef(false)

  const handle = useCallback((ev: DeviceOrientationEvent) => {
    const e = ev as IOSDeviceOrientationEvent
    const alpha = e.alpha
    const beta = e.beta
    const gamma = e.gamma

    let headingDeg: number | null = null
    let isAbsolute = e.absolute === true
    if (typeof e.webkitCompassHeading === 'number') {
      headingDeg = e.webkitCompassHeading // iOS: đã là compass thật
      isAbsolute = true
    } else if (
      alpha != null &&
      (e.absolute || ev.type === 'deviceorientationabsolute')
    ) {
      headingDeg = (((360 - alpha) % 360) + 360) % 360
    }

    setState((s) => ({
      ...s,
      alpha,
      beta,
      gamma,
      // Giữ heading cũ nếu event hiện tại không cung cấp — tránh nhảy null/value
      // khi cả 'deviceorientation' và 'deviceorientationabsolute' bắn xen kẽ
      // trên Android (event thường không có heading, event absolute thì có).
      headingDeg: headingDeg ?? s.headingDeg,
      // Latch: đã thấy absolute=true thì giữ true (tránh flicker warning)
      absolute: s.absolute || isAbsolute,
      lastEventAt: Date.now(),
    }))
  }, [])

  const attach = useCallback(() => {
    if (typeof window === 'undefined') return
    if (listening.current) return
    listening.current = true
    // deviceorientationabsolute (Chrome/Android) cho hướng tuyệt đối
    window.addEventListener(
      'deviceorientationabsolute',
      handle as EventListener,
    )
    window.addEventListener('deviceorientation', handle)
  }, [handle])

  const detach = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!listening.current) return
    listening.current = false
    window.removeEventListener(
      'deviceorientationabsolute',
      handle as EventListener,
    )
    window.removeEventListener('deviceorientation', handle)
  }, [handle])

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return
    const ctor = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & IOSOrientationCtor)
      | undefined

    // iOS 13+: cần xin quyền tường minh (phải gọi từ user-gesture)
    if (ctor && typeof ctor.requestPermission === 'function') {
      try {
        const result = await ctor.requestPermission()
        setState((s) => ({ ...s, permissionState: result }))
        if (result === 'granted') attach()
        else
          setState((s) => ({
            ...s,
            error: 'Người dùng từ chối quyền cảm biến',
          }))
      } catch (err) {
        setState((s) => ({
          ...s,
          permissionState: 'denied',
          error: err instanceof Error ? err.message : String(err),
        }))
      }
      return
    }

    // Trình duyệt khác: gắn ngay
    setState((s) => ({ ...s, permissionState: 'granted' }))
    attach()
  }, [attach])

  useEffect(() => () => detach(), [detach])

  return { ...state, supported, requestPermission, attach, detach }
}
