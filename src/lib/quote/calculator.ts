/**
 * SOLIQ ENERGY - Solar Quote Calculator
 * Tất cả kết quả mang tính ước tính. Cần khảo sát thực tế để có báo giá chính xác.
 */

export type CustomerType = 'residential' | 'business' | 'factory'
export type PaymentMode = 'cash' | 'installment' | 'lease'

export interface PricingTier {
  /** VNĐ. Bill ≥ billMin */
  billMin: number
  /** VNĐ. null = không giới hạn trên. Bill < billMax */
  billMax: number | null
  /** Nhãn hiển thị, ví dụ "1 - 2 triệu" */
  label: string
  capacityKwp: number
  gridTiedPriceVnd: number
  hybridPriceVnd: number
}

export interface QuoteInput {
  monthlyBillVnd: number       // Hóa đơn điện trung bình/tháng (VNĐ)
  daytimeUsageRate: number     // Tỷ lệ dùng điện ban ngày (0.0 - 1.0)
  customerType: CustomerType
  paymentMode: PaymentMode
  batteryOption: boolean
  province?: string
  roofAreaSqm?: number
}

export interface InstallmentPlan {
  termMonths: number
  monthlyPaymentVnd: number
  totalPaymentVnd: number
  interestRate: number
}

export interface QuoteOutput {
  recommendedCapacityKwp: number
  estimatedInvestmentVnd: number
  estimatedInvestmentAfterVatVnd: number
  annualProductionKwh: number
  selfConsumedKwh: number
  annualSavingsVnd: number
  paybackYears: number
  irrPercent: number
  installmentPlans: InstallmentPlan[]
  disclaimer: string
}

// ─── Default assumptions (có thể override từ DB settings) ───────────────────

export const DEFAULT_ASSUMPTIONS = {
  // Giá điện EVN bình quân (VNĐ/kWh) - bậc thang trung bình
  evnPricePerKwh: 2800,

  // Bảng giá theo hoá đơn điện hàng tháng — admin có thể chỉnh trực tiếp
  // Hệ thống sẽ chọn tier phù hợp với bill của khách
  pricingTiers: [
    { billMin: 0, billMax: 1_000_000, label: 'Dưới 1 triệu', capacityKwp: 3, gridTiedPriceVnd: 28_500_000, hybridPriceVnd: 35_000_000 },
    { billMin: 1_000_000, billMax: 2_000_000, label: '1 - 2 triệu', capacityKwp: 5, gridTiedPriceVnd: 47_300_000, hybridPriceVnd: 51_000_000 },
    { billMin: 2_000_000, billMax: 3_000_000, label: '2 - 3 triệu', capacityKwp: 8, gridTiedPriceVnd: 56_000_000, hybridPriceVnd: 85_000_000 },
    { billMin: 3_000_000, billMax: 5_000_000, label: '3 - 5 triệu', capacityKwp: 10, gridTiedPriceVnd: 78_000_000, hybridPriceVnd: 132_000_000 },
    { billMin: 5_000_000, billMax: 10_000_000, label: '5 - 10 triệu', capacityKwp: 15, gridTiedPriceVnd: 106_500_000, hybridPriceVnd: 156_000_000 },
    { billMin: 10_000_000, billMax: null, label: 'Trên 10 triệu', capacityKwp: 20, gridTiedPriceVnd: 130_800_000, hybridPriceVnd: 197_000_000 },
  ] as PricingTier[],

  // Sản lượng điện trung bình theo vùng (kWh/kWp/năm)
  annualProductionPerKwp: {
    north: 1100,   // Hà Nội, miền Bắc
    central: 1350, // Đà Nẵng, miền Trung
    south: 1450,   // TP.HCM, miền Nam
    default: 1300,
  },

  // Giá hệ thống fallback (VNĐ/kWp) - dùng khi bill nằm ngoài tất cả tiers
  systemPricePerKwp: {
    gridTied: 8_000_000,   // Hòa lưới: ~7-9.4tr/kWp, avg 8tr
    hybrid: 9_800_000,     // Hybrid: ~9.5-10.2tr/kWp, avg 9.8tr
  },

  // VAT
  vatRate: 0.08,

  // Suy giảm hiệu suất hàng năm
  annualDegradation: 0.005, // 0.5%/năm

  // Tăng giá điện hàng năm
  annualElectricityPriceIncrease: 0.05, // 5%/năm

  // Chi phí vận hành & bảo trì
  annualOmRate: 0.01, // 1% tổng đầu tư/năm

  // Trả góp
  installmentSetupFee: 0.02, // 2% phí dịch vụ
  installmentOptions: [
    { termMonths: 12, interestRate: 0.08 },
    { termMonths: 24, interestRate: 0.09 },
    { termMonths: 36, interestRate: 0.10 },
    { termMonths: 60, interestRate: 0.115 },
  ],
}

export type QuoteAssumptions = typeof DEFAULT_ASSUMPTIONS

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatNumberWithDots(value: number): string {
  return Math.round(value).toLocaleString('vi-VN')
}

export function parseFormattedNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  if (typeof value !== 'string') return fallback

  const trimmed = value.trim()
  if (!trimmed) return fallback
  const normalized = /^-?\d{1,3}(?:\.\d{3})+$/.test(trimmed)
    ? trimmed.replace(/\./g, '')
    : trimmed.replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : fallback
}

function moneyUnitMultiplier(unit: string): number {
  const normalized = unit.toLowerCase()
  return normalized === 'tỷ' || normalized === 'ty' ? 1_000_000_000 : 1_000_000
}

export function formatVietnameseCurrencyText(text: string): string {
  return text
    .replace(
      /\b(\d+(?:[,.]\d+)?)\s*-\s*(\d+(?:[,.]\d+)?)\s*(tỷ|ty|triệu|tr)(?:\s*đồng)?\b/gi,
      (_match, start: string, end: string, unit: string) => {
        const multiplier = moneyUnitMultiplier(unit)
        return `${formatVnd(parseFormattedNumber(start) * multiplier)} - ${formatVnd(parseFormattedNumber(end) * multiplier)}`
      }
    )
    .replace(
      /\b(\d+(?:[,.]\d+)?)\s*(tỷ|ty|triệu|tr)(?:\s*đồng)?\b/gi,
      (_match, value: string, unit: string) => formatVnd(parseFormattedNumber(value) * moneyUnitMultiplier(unit))
    )
    .replace(/\b(\d+(?:[,.]\d+)?)\s*k\b(?!\s*(?:w|wp|wh)\b)/gi, (_match, value: string) =>
      formatVnd(parseFormattedNumber(value) * 1_000)
    )
    .replace(/\b(\d{1,3}(?:\.\d{3})+|\d+)\s*đ(?=\s|[.,;:!?)]|$)/gi, (_match, value: string) =>
      formatVnd(parseFormattedNumber(value))
    )
}

export function formatSalaryRange(value: string | null | undefined, fallback = 'Thỏa thuận'): string {
  const text = value?.trim()
  if (!text) return fallback

  const numericRangeMatch = text.match(/^(\d[\d.]*)\s*-\s*(\d[\d.]*)\s*(?:đ)?$/i)
  if (numericRangeMatch) {
    return `${formatVnd(parseFormattedNumber(numericRangeMatch[1]))} - ${formatVnd(parseFormattedNumber(numericRangeMatch[2]))}`
  }

  if (/^\d[\d.]*\s*(?:đ)?$/i.test(text)) {
    return formatVnd(parseFormattedNumber(text.replace(/\s*đ$/i, '')))
  }

  return formatVietnameseCurrencyText(text)
}

function estimateMonthlyKwh(monthlyBillVnd: number, assumptions: QuoteAssumptions): number {
  // Ước tính kWh từ hóa đơn dựa trên giá bậc thang EVN
  // Đơn giản hóa: dùng giá bình quân
  return monthlyBillVnd / assumptions.evnPricePerKwh
}

function getProductionPerKwp(province: string | undefined, assumptions: QuoteAssumptions): number {
  if (!province) return assumptions.annualProductionPerKwp.default
  const p = province.toLowerCase()
  if (p.includes('hà nội') || p.includes('hải phòng') || p.includes('bắc')) {
    return assumptions.annualProductionPerKwp.north
  }
  if (p.includes('đà nẵng') || p.includes('huế') || p.includes('trung')) {
    return assumptions.annualProductionPerKwp.central
  }
  if (p.includes('hồ chí minh') || p.includes('cần thơ') || p.includes('nam')) {
    return assumptions.annualProductionPerKwp.south
  }
  return assumptions.annualProductionPerKwp.default
}

function calculateIRR(cashFlows: number[]): number {
  // Newton-Raphson IRR approximation
  let rate = 0.1
  for (let i = 0; i < 100; i++) {
    let npv = 0
    let dnpv = 0
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t)
      dnpv -= t * cashFlows[t] / Math.pow(1 + rate, t + 1)
    }
    const newRate = rate - npv / dnpv
    if (Math.abs(newRate - rate) < 0.0001) return newRate
    rate = newRate
  }
  return rate
}

function findPricingTier(monthlyBillVnd: number, tiers: PricingTier[]): PricingTier | null {
  const sorted = [...tiers].sort((a, b) => a.billMin - b.billMin)
  for (const tier of sorted) {
    const min = tier.billMin
    const max = tier.billMax === null || !Number.isFinite(tier.billMax) ? Infinity : tier.billMax
    if (monthlyBillVnd >= min && monthlyBillVnd < max) return tier
  }
  // Fallback: return the highest tier if bill exceeds all upper bounds
  return sorted[sorted.length - 1] ?? null
}

// ─── Main calculator ─────────────────────────────────────────────────────────

export function calculateQuote(
  input: QuoteInput,
  assumptions: QuoteAssumptions = DEFAULT_ASSUMPTIONS
): QuoteOutput {
  const {
    monthlyBillVnd,
    daytimeUsageRate,
    customerType: _customerType,
    paymentMode: _paymentMode,
    batteryOption,
    province,
  } = input

  // 1. Ước tính tiêu thụ điện
  const monthlyKwh = estimateMonthlyKwh(monthlyBillVnd, assumptions)
  const annualKwh = monthlyKwh * 12

  // 2. Sản lượng điện theo vùng
  const productionPerKwp = getProductionPerKwp(province, assumptions)

  // 3. Công suất & chi phí — ưu tiên tra theo bảng giá tier
  const tier = findPricingTier(monthlyBillVnd, assumptions.pricingTiers || [])

  let recommendedCapacityKwp: number
  let estimatedInvestmentVnd: number
  let estimatedInvestmentAfterVatVnd: number

  if (tier) {
    // Lấy thẳng từ bảng giá tier — giá tier coi là giá cuối (đã bao gồm VAT)
    recommendedCapacityKwp = tier.capacityKwp
    estimatedInvestmentAfterVatVnd = batteryOption ? tier.hybridPriceVnd : tier.gridTiedPriceVnd
    estimatedInvestmentVnd = Math.round(estimatedInvestmentAfterVatVnd / (1 + assumptions.vatRate))
  } else {
    // Fallback: tính theo formula nếu không có tier nào khớp
    const rawCapacity = (annualKwh * 0.9) / productionPerKwp
    recommendedCapacityKwp = Math.ceil(rawCapacity * 2) / 2
    const pricePerKwp = batteryOption
      ? assumptions.systemPricePerKwp.hybrid
      : assumptions.systemPricePerKwp.gridTied
    estimatedInvestmentVnd = Math.round(recommendedCapacityKwp * pricePerKwp)
    estimatedInvestmentAfterVatVnd = Math.round(estimatedInvestmentVnd * (1 + assumptions.vatRate))
  }

  // 4. Sản lượng thực tế hàng năm (dựa vào công suất đã chọn)
  const annualProductionKwh = recommendedCapacityKwp * productionPerKwp

  // 5. Điện tiêu thụ ban ngày — phần có thể tự dùng từ solar
  const daytimeAnnualKwh = annualKwh * daytimeUsageRate

  // 6. Điện tự dùng (không vượt quá nhu cầu ban ngày)
  // Đây là phần thực sự được tiết kiệm. Tăng tỷ lệ ngày → tiết kiệm tăng,
  // không ảnh hưởng tới công suất hệ thống.
  const selfConsumedKwh = Math.min(annualProductionKwh, daytimeAnnualKwh)

  // 7. Tiết kiệm hàng năm = công suất × 4h nắng × 2500đ/kWh × 30 ngày × 12 tháng
  const annualSavingsVnd = Math.round(
    recommendedCapacityKwp * 4 * 2500 * 30 * 12
  )

  // 8. Thời gian hoàn vốn (năm)
  const paybackYears = daytimeUsageRate > 0.5 ? 3.5 : 4.5

  // 10. IRR (25 năm vòng đời)
  const cashFlows: number[] = [-estimatedInvestmentAfterVatVnd]
  let currentSavings = annualSavingsVnd
  let currentProduction = annualProductionKwh
  const annualOm = estimatedInvestmentAfterVatVnd * assumptions.annualOmRate

  for (let year = 1; year <= 25; year++) {
    currentProduction *= (1 - assumptions.annualDegradation)
    const selfConsumed = Math.min(currentProduction, daytimeAnnualKwh)
    currentSavings = selfConsumed * assumptions.evnPricePerKwh *
      Math.pow(1 + assumptions.annualElectricityPriceIncrease, year - 1)
    cashFlows.push(Math.round(currentSavings - annualOm))
  }

  const irrDecimal = calculateIRR(cashFlows)
  const irrPercent = parseFloat((irrDecimal * 100).toFixed(1))

  // 11. Kế hoạch trả góp
  const installmentPlans: InstallmentPlan[] = assumptions.installmentOptions.map(
    ({ termMonths, interestRate }) => {
      const principal = estimatedInvestmentAfterVatVnd
      const setupFee = principal * assumptions.installmentSetupFee
      const totalWithFee = principal + setupFee
      const monthlyRate = interestRate / 12
      const monthlyPayment = Math.round(
        (totalWithFee * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
        (Math.pow(1 + monthlyRate, termMonths) - 1)
      )
      return {
        termMonths,
        monthlyPaymentVnd: monthlyPayment,
        totalPaymentVnd: monthlyPayment * termMonths,
        interestRate,
      }
    }
  )

  return {
    recommendedCapacityKwp,
    estimatedInvestmentVnd,
    estimatedInvestmentAfterVatVnd,
    annualProductionKwh: Math.round(annualProductionKwh),
    selfConsumedKwh: Math.round(selfConsumedKwh),
    annualSavingsVnd,
    paybackYears,
    irrPercent,
    installmentPlans,
    disclaimer:
      'Kết quả trên chỉ mang tính ước tính dựa trên thông tin bạn cung cấp. ' +
      'Công suất và chi phí thực tế có thể thay đổi sau khi khảo sát thực địa, ' +
      'đánh giá kết cấu mái và thiết kế kỹ thuật chi tiết.',
  }
}

// ─── Format helpers ───────────────────────────────────────────────────────────

export function formatVnd(amount: number): string {
  return `${formatNumberWithDots(amount)}\u00A0đ`
}

export function formatKwh(kwh: number): string {
  return `${formatNumberWithDots(kwh)} kWh`
}
