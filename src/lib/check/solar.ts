import SunCalc from 'suncalc'
import type {
  GeoPoint,
  MonthlyEnergy,
  PanelOrientation,
  Vec3,
} from './types'

/* -------------------------------------------------------------------------- */
/*                              Helpers cơ bản                                 */
/* -------------------------------------------------------------------------- */

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

export const toRad = (deg: number) => deg * DEG
export const toDeg = (rad: number) => rad * RAD

const dot = (a: Vec3, b: Vec3) => a.e * b.e + a.n * b.n + a.u * b.u

/* -------------------------------------------------------------------------- */
/*                       Vector pháp tuyến của panel                           */
/* -------------------------------------------------------------------------- */

/**
 * Vector pháp tuyến (unit) của bề mặt panel trong hệ ENU.
 * @param azimuthDeg compass azimuth (0=Bắc, 90=Đông, 180=Nam, 270=Tây)
 * @param tiltDeg góc nghiêng so với mặt phẳng ngang (0=ngang, 90=đứng)
 */
export function panelNormal({ azimuthDeg, tiltDeg }: PanelOrientation): Vec3 {
  const az = toRad(azimuthDeg)
  const tilt = toRad(tiltDeg)
  const horiz = Math.sin(tilt)
  return {
    e: horiz * Math.sin(az),
    n: horiz * Math.cos(az),
    u: Math.cos(tilt),
  }
}

/* -------------------------------------------------------------------------- */
/*                         Pháp tuyến từ Device Orientation                    */
/* -------------------------------------------------------------------------- */

/**
 * Tính vector pháp tuyến của *mặt màn hình* trong hệ ENU dựa trên 3 góc của
 * DeviceOrientationEvent (đơn vị độ).
 *
 *   Earth frame: x=East, y=North, z=Up.
 *   Rotation order theo spec W3C: R = Rz(α) · Rx(β) · Ry(γ)
 *   Áp R lên screen-out của device (0,0,1).
 */
export function screenNormalFromOrientation(
  alphaDeg: number,
  betaDeg: number,
  gammaDeg: number,
): Vec3 {
  const a = toRad(alphaDeg)
  const b = toRad(betaDeg)
  const g = toRad(gammaDeg)

  const sa = Math.sin(a),
    ca = Math.cos(a)
  const sb = Math.sin(b),
    cb = Math.cos(b)
  const sg = Math.sin(g),
    cg = Math.cos(g)

  return {
    e: ca * sg + sa * sb * cg,
    n: sa * sg - ca * sb * cg,
    u: cb * cg,
  }
}

/**
 * Quy đổi compass heading (độ, 0=Bắc, clockwise) → alpha của
 * DeviceOrientationEvent (counterclockwise nhìn từ trên xuống).
 */
export const headingToAlpha = (headingDeg: number) =>
  (((360 - headingDeg) % 360) + 360) % 360

/**
 * Suy luận PanelOrientation (azimuth + tilt) từ vector pháp tuyến.
 * Quy ước: panel "nhìn về" hướng có thành phần ngang dương.
 */
export function normalToOrientation(n: Vec3): PanelOrientation {
  const u = Math.max(-1, Math.min(1, n.u))
  const tilt = Math.acos(Math.abs(u)) // 0..π/2
  // Nếu phẳng hoàn toàn (u≈±1), azimuth không xác định → 0
  const horiz = Math.hypot(n.e, n.n)
  let azRad = 0
  if (horiz > 1e-6) {
    azRad = Math.atan2(n.e, n.n) // -π..π, 0=Bắc, π/2=Đông
  }
  let azDeg = toDeg(azRad)
  if (azDeg < 0) azDeg += 360
  return { azimuthDeg: azDeg, tiltDeg: toDeg(tilt) }
}

/* -------------------------------------------------------------------------- */
/*                            Vector mặt trời                                  */
/* -------------------------------------------------------------------------- */

/**
 * Vector đơn vị từ vị trí quan sát đến mặt trời, trong hệ ENU.
 * Trả về kèm elevation (radian) để dùng cho air-mass.
 */
export function sunVector(
  date: Date,
  geo: GeoPoint,
): { v: Vec3; elevationRad: number } {
  const pos = SunCalc.getPosition(date, geo.lat, geo.lon)
  // SunCalc: azimuth tính từ Nam, dương về Tây.
  // Compass azimuth (từ Bắc, clockwise) = π + sunCalc.azimuth
  const compassAz = pos.azimuth + Math.PI
  const cosAlt = Math.cos(pos.altitude)
  return {
    v: {
      e: cosAlt * Math.sin(compassAz),
      n: cosAlt * Math.cos(compassAz),
      u: Math.sin(pos.altitude),
    },
    elevationRad: pos.altitude,
  }
}

/* -------------------------------------------------------------------------- */
/*                       Mô hình bức xạ clear-sky đơn giản                     */
/* -------------------------------------------------------------------------- */

const SOLAR_CONSTANT = 1361 // W/m²

/** Air mass theo công thức Kasten-Young 1989 */
function airMass(elevationRad: number): number {
  const elevDeg = toDeg(elevationRad)
  if (elevDeg <= 0) return Infinity
  return (
    1 /
    (Math.sin(elevationRad) +
      0.50572 * Math.pow(elevDeg + 6.07995, -1.6364))
  )
}

/** Direct Normal Irradiance (W/m²) trên mặt phẳng vuông góc với tia nắng */
export function directNormalIrradiance(elevationRad: number): number {
  if (elevationRad <= 0) return 0
  const am = airMass(elevationRad)
  return SOLAR_CONSTANT * Math.pow(0.7, Math.pow(am, 0.678))
}

/**
 * Tính công suất tức thời thu được trên 1 m² panel (W/m²).
 *
 * direct  = DNI × max(0, cos(angle of incidence))
 * diffuse = 0.1 × DNI × (1 + n.up) / 2   (giả định bầu trời isotropic, panel
 *           càng hướng lên trời càng thấy nhiều bầu trời tán xạ)
 */
export function instantPower(
  panelN: Vec3,
  sun: { v: Vec3; elevationRad: number },
): number {
  if (sun.elevationRad <= 0) return 0
  const dni = directNormalIrradiance(sun.elevationRad)
  const cosAoi = Math.max(0, dot(panelN, sun.v))
  const direct = dni * cosAoi
  const diffuse = (0.1 * dni * (1 + panelN.u)) / 2
  return direct + diffuse
}

/* -------------------------------------------------------------------------- */
/*                       Tích phân năng lượng theo ngày/tháng                  */
/* -------------------------------------------------------------------------- */

/**
 * Năng lượng/m² trong một ngày (kWh/m²/day).
 * Lấy mẫu mỗi `stepMin` phút.
 */
export function dailyEnergy(
  date: Date,
  geo: GeoPoint,
  orientation: PanelOrientation,
  stepMin = 30,
): number {
  const n = panelNormal(orientation)
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const stepMs = stepMin * 60 * 1000
  const samples = Math.floor((24 * 60) / stepMin)
  let totalWh = 0
  for (let i = 0; i < samples; i++) {
    const t = new Date(start.getTime() + i * stepMs)
    const sun = sunVector(t, geo)
    totalWh += instantPower(n, sun) * (stepMin / 60) // W/m² × giờ = Wh/m²
  }
  return totalWh / 1000 // kWh/m²
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const MONTH_LABELS = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
  'T8',
  'T9',
  'T10',
  'T11',
  'T12',
]

/**
 * Năng lượng/m² theo từng tháng (kWh/m²/tháng) cho một năm cho trước.
 * Lấy ngày 15 làm ngày đại diện × số ngày trong tháng.
 */
export function monthlyEnergy(
  geo: GeoPoint,
  orientation: PanelOrientation,
  year = new Date().getFullYear(),
): MonthlyEnergy[] {
  const out: MonthlyEnergy[] = []
  for (let m = 0; m < 12; m++) {
    const repDay = new Date(year, m, 15, 12, 0, 0, 0)
    const perDay = dailyEnergy(repDay, geo, orientation, 30)
    out.push({
      month: m + 1,
      label: MONTH_LABELS[m],
      kWhPerM2: perDay * DAYS_IN_MONTH[m],
    })
  }
  return out
}

/** Tổng năng lượng/m²/năm (kWh/m²/năm) */
export function annualEnergy(
  geo: GeoPoint,
  orientation: PanelOrientation,
  year = new Date().getFullYear(),
): number {
  return monthlyEnergy(geo, orientation, year).reduce(
    (s, m) => s + m.kWhPerM2,
    0,
  )
}

/* -------------------------------------------------------------------------- */
/*                              Tiện ích hiển thị                              */
/* -------------------------------------------------------------------------- */

/** Đổi compass azimuth (0..360) thành tên hướng tiếng Việt */
export function compassLabel(azDeg: number): string {
  const dirs = [
    'Bắc',
    'Đông Bắc',
    'Đông',
    'Đông Nam',
    'Nam',
    'Tây Nam',
    'Tây',
    'Tây Bắc',
  ]
  const idx = Math.round((((azDeg % 360) + 360) % 360) / 45) % 8
  return dirs[idx]
}
