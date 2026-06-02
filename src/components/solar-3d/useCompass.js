import { useState, useEffect, useRef, useCallback } from 'react'
import { getScreenOrientationAngle, normalizeCompassHeading } from './compass.js'

// Hook xử lý cảm biến la bàn (DeviceOrientation).
//  - supported: thiết bị có vẻ hỗ trợ (mobile/tablet có cảm biến)
//  - active: đang nhận dữ liệu hướng
//  - heading: góc la bàn (độ, 0 = Bắc, tăng theo chiều kim đồng hồ)
//  - error: thông báo lỗi nếu có
//  - request(): xin quyền & bắt đầu lắng nghe (gọi trong sự kiện click)
function detectCompassSupport() {
  if (typeof window === 'undefined') return false
  const hasOrientation = 'DeviceOrientationEvent' in window
  // Chỉ coi là "có cảm biến" khi là thiết bị cảm ứng, để loại bớt desktop.
  const isTouch =
    'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0
  return hasOrientation && isTouch
}

export default function useCompass() {
  const [supported] = useState(detectCompassSupport)
  const [active, setActive] = useState(false)
  const [heading, setHeading] = useState(0)
  const [error, setError] = useState(null)
  const lastRef = useRef(0)
  const receivedRef = useRef(false)

  const onOrientation = useCallback((e) => {
    const h = normalizeCompassHeading(e, {
      screenAngle: getScreenOrientationAngle(window),
    })
    if (h == null) return
    // chỉ cập nhật khi đổi đáng kể để giảm re-render
    if (Math.abs(h - lastRef.current) < 1) return
    lastRef.current = h
    receivedRef.current = true
    setActive(true)
    setHeading(h)
  }, [])

  const start = useCallback(() => {
    const evtName =
      'ondeviceorientationabsolute' in window
        ? 'deviceorientationabsolute'
        : 'deviceorientation'
    window.addEventListener(evtName, onOrientation, true)
  }, [onOrientation])

  const request = useCallback(async () => {
    setError(null)
    try {
      const Ev = window.DeviceOrientationEvent
      if (Ev && typeof Ev.requestPermission === 'function') {
        // iOS 13+: phải gọi trong cử chỉ người dùng
        const res = await Ev.requestPermission()
        if (res !== 'granted') {
          setError('Bạn đã từ chối quyền truy cập cảm biến la bàn.')
          return
        }
      }
      start()
      // nếu sau 2s không có dữ liệu -> báo không khả dụng
      setTimeout(() => {
        if (!receivedRef.current) {
          setError('Không nhận được dữ liệu la bàn từ thiết bị.')
        }
      }, 2000)
    } catch (err) {
      setError('Thiết bị không hỗ trợ cảm biến la bàn.')
      console.warn('compass error', err)
    }
  }, [start])

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientationabsolute', onOrientation, true)
      window.removeEventListener('deviceorientation', onOrientation, true)
    }
  }, [onOrientation])

  return { supported, active, heading, error, request }
}
