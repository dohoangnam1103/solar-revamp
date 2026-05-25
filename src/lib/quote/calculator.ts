/**
 * SOLIQ ENERGY - Solar Quote Calculator
 * Tất cả kết quả mang tính ước tính. Cần khảo sát thực tế để có báo giá chính xác.
 */

export type CustomerType = 'residential' | 'business' | 'factory'
export type PaymentMode = 'cash' | 'installment' | 'lease'

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

  // Sản lượng điện trung bình theo vùng (kWh/kWp/năm)
  annualProductionPerKwp: {
    north: 1100,   // Hà Nội, miền Bắc
    central: 1350, // Đà Nẵng, miền Trung
    south: 1450,   // TP.HCM, miền Nam
    default: 1300,
  },

  // Giá hệ thống (VNĐ/kWp) - từ bảng giá thực tế SOLIQ
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

  // 2. Điện tiêu thụ ban ngày (phần có thể tự dùng từ solar)
  const daytimeAnnualKwh = annualKwh * daytimeUsageRate

  // 3. Sản lượng điện theo vùng
  const productionPerKwp = getProductionPerKwp(province, assumptions)

  // 4. Công suất đề xuất (kWp)
  // Thiết kế để đáp ứng ~90% nhu cầu ban ngày
  const rawCapacity = (daytimeAnnualKwh * 0.9) / productionPerKwp
  // Làm tròn lên gói gần nhất (0.5 kWp)
  const recommendedCapacityKwp = Math.ceil(rawCapacity * 2) / 2

  // 5. Sản lượng thực tế hàng năm
  const annualProductionKwh = recommendedCapacityKwp * productionPerKwp

  // 6. Điện tự dùng (không vượt quá nhu cầu ban ngày)
  const selfConsumedKwh = Math.min(annualProductionKwh, daytimeAnnualKwh)

  // 7. Chi phí đầu tư
  const pricePerKwp = batteryOption
    ? assumptions.systemPricePerKwp.hybrid
    : assumptions.systemPricePerKwp.gridTied

  const estimatedInvestmentVnd = Math.round(recommendedCapacityKwp * pricePerKwp)
  const estimatedInvestmentAfterVatVnd = Math.round(
    estimatedInvestmentVnd * (1 + assumptions.vatRate)
  )

  // 8. Tiết kiệm hàng năm
  const annualSavingsVnd = Math.round(
    selfConsumedKwh * assumptions.evnPricePerKwh
  )

  // 9. Thời gian hoàn vốn (năm)
  // Tính đơn giản: đầu tư / tiết kiệm năm đầu
  const paybackYears = parseFloat(
    (estimatedInvestmentAfterVatVnd / annualSavingsVnd).toFixed(1)
  )

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
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ`
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(0)} triệu`
  }
  return amount.toLocaleString('vi-VN') + ' đ'
}

export function formatKwh(kwh: number): string {
  return `${kwh.toLocaleString('vi-VN')} kWh`
}
