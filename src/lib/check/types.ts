/**
 * Vector trong hệ toạ độ ENU (East-North-Up) tại bề mặt Trái Đất.
 * Mọi vector đơn vị (unit) trừ khi ghi chú khác.
 */
export type Vec3 = { e: number; n: number; u: number }

/** Toạ độ địa lý */
export type GeoPoint = { lat: number; lon: number }

/** Hướng + độ nghiêng của bề mặt panel */
export type PanelOrientation = {
  /** Compass azimuth (0=Bắc, 90=Đông, 180=Nam, 270=Tây). Hướng panel đang nhìn. */
  azimuthDeg: number
  /** Góc nghiêng so với mặt phẳng ngang (0=panel nằm ngang, 90=dựng đứng). */
  tiltDeg: number
}

/** Kết quả tính năng lượng tháng (dùng nội bộ trong solar.ts) */
export type MonthlyEnergy = {
  month: number // 1..12
  label: string // "T1", "T2"...
  kWhPerM2: number
}
