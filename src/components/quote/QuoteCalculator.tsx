'use client'

import { useActionState, useState } from 'react'
import { submitQuote, type SubmitQuoteResult } from '@/app/actions/quote'
import Link from 'next/link'
import { calculateQuote, type QuoteAssumptions } from '@/lib/quote/calculator'
import { formatVnd } from '@/lib/quote/calculator'
import {
  Zap, Home, Building2, Factory, Battery, CreditCard, Banknote,
  ChevronRight, ChevronLeft, Loader2, CheckCircle2, AlertCircle,
  Sun, TrendingUp, Clock, BarChart3
} from 'lucide-react'

const INITIAL_STATE: SubmitQuoteResult = { success: false }

const PROVINCES = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
]

const BILL_OPTIONS = [
  { label: 'Dưới 500k', value: 400_000 },
  { label: '500k - 1 triệu', value: 750_000 },
  { label: '1 - 2 triệu', value: 1_500_000 },
  { label: '2 - 3 triệu', value: 2_500_000 },
  { label: '3 - 5 triệu', value: 4_000_000 },
  { label: '5 - 10 triệu', value: 7_500_000 },
  { label: 'Trên 10 triệu', value: 12_000_000 },
]

export default function QuoteCalculator({ assumptions }: { assumptions: QuoteAssumptions }) {
  const [step, setStep] = useState(1) // 1: inputs, 2: lead capture, 3: result
  const [state, formAction, pending] = useActionState(submitQuote, INITIAL_STATE)

  // Form state
  const [province, setProvince] = useState('Hà Nội')
  const [monthlyBill, setMonthlyBill] = useState(2_500_000)
  const [daytimeRate, setDaytimeRate] = useState(0.6)
  const [customerType, setCustomerType] = useState<'residential' | 'business' | 'factory'>('residential')
  const [paymentMode, setPaymentMode] = useState<'cash' | 'installment' | 'lease'>('cash')
  const [batteryOption, setBatteryOption] = useState(false)

  // Live preview
  const preview = calculateQuote(
    {
      monthlyBillVnd: monthlyBill,
      daytimeUsageRate: daytimeRate,
      customerType,
      paymentMode,
      batteryOption,
      province,
    },
    assumptions
  )

  if (state.success && state.result) {
    return <QuoteResult quoteToken={state.quoteToken} result={state.result} />
  }

  return (
    <div className="glass rounded-2xl overflow-hidden shadow-xl border border-white/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4">
        <h2 className="text-white font-bold text-lg">Tính báo giá điện mặt trời</h2>
        <p className="text-green-100 text-sm mt-0.5">Nhận kết quả ước tính ngay lập tức</p>
      </div>

      {step === 1 && (
        <div className="p-6 space-y-5">
          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tỉnh / Thành phố
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full cursor-pointer px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Monthly bill */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hóa đơn điện trung bình/tháng
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BILL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMonthlyBill(opt.value)}
                  className={`cursor-pointer whitespace-nowrap px-2 py-2 text-xs font-medium rounded-lg border transition-all sm:px-3 ${
                    monthlyBill === opt.value
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daytime usage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tỷ lệ dùng điện ban ngày:{' '}
              <span className="text-green-700 font-semibold">{Math.round(daytimeRate * 100)}%</span>
            </label>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.1"
              value={daytimeRate}
              onChange={(e) => setDaytimeRate(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-green-700"
            />
            <div className="flex justify-between text-xs text-gray-900 mt-1">
              <span>Chủ yếu tối</span>
              <span>Cả ngày</span>
            </div>
          </div>

          {/* Customer type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Loại khách hàng
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'residential', label: 'Gia đình', icon: Home },
                { value: 'business', label: 'Doanh nghiệp', icon: Building2 },
                { value: 'factory', label: 'Nhà máy', icon: Factory },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCustomerType(value as typeof customerType)}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-[11px] font-medium whitespace-nowrap transition-all sm:text-xs ${
                    customerType === value
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Battery option */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setBatteryOption(!batteryOption)}
                className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors ${
                  batteryOption ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    batteryOption ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-cyan-500" />
                  Thêm pin lưu trữ (Hybrid)
                </span>
                <span className="text-xs text-gray-900">Dùng điện cả khi mất điện lưới</span>
              </div>
            </label>
          </div>

          {/* Payment mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Hình thức thanh toán
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'cash', label: 'Trả thẳng', icon: Banknote },
                { value: 'installment', label: 'Trả góp', icon: CreditCard },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMode(value as typeof paymentMode)}
                  className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-sm font-medium transition-all whitespace-nowrap sm:gap-2 sm:px-3 ${
                    paymentMode === value
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-green-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-xl p-4 border border-green-100">
            <p className="text-xs font-semibold text-green-700 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Ước tính sơ bộ
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-gray-500">Công suất đề xuất</p>
                <p className="text-lg font-bold text-green-700">{preview.recommendedCapacityKwp} kWp</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Chi phí ước tính</p>
                <p className="text-lg font-bold text-orange-600">{formatVnd(preview.estimatedInvestmentAfterVatVnd)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tiết kiệm/năm</p>
                <p className="text-base font-semibold text-gray-800">{formatVnd(preview.annualSavingsVnd)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Hoàn vốn</p>
                <p className="text-base font-semibold text-gray-800">{preview.paybackYears} năm</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="cta-shine w-full flex items-center justify-center gap-2 py-3 px-6 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            Xem báo giá chi tiết
            <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-center text-xs text-gray-900">Miễn phí, không ràng buộc</p>
        </div>
      )}

      {step === 2 && (
        <form action={formAction} className="p-6 space-y-4">
          {/* Hidden inputs */}
          <input type="hidden" name="province" value={province} />
          <input type="hidden" name="monthlyBillVnd" value={monthlyBill} />
          <input type="hidden" name="daytimeUsageRate" value={daytimeRate} />
          <input type="hidden" name="customerType" value={customerType} />
          <input type="hidden" name="paymentMode" value={paymentMode} />
          <input type="hidden" name="batteryOption" value={String(batteryOption)} />

          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Nhận báo giá chi tiết</h3>
            <p className="text-sm text-gray-500">Chuyên viên sẽ liên hệ trong vòng 5 phút</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Số điện thoại / Zalo <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="0912 345 678"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email (không bắt buộc)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
              Địa chỉ lắp đặt
            </label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Số nhà, đường, phường/xã..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {state.error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="cta-shine w-full flex items-center justify-center gap-2 py-3 px-6 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-md"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                Nhận báo giá ngay
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-900">
            Thông tin của bạn được bảo mật tuyệt đối
          </p>
        </form>
      )}
    </div>
  )
}

function QuoteResult({
  quoteToken,
  result,
}: {
  quoteToken?: string
  result: NonNullable<SubmitQuoteResult['result']>
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden shadow-xl border border-white/50">
      <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <CheckCircle2 className="w-5 h-5" />
          <h2 className="font-bold text-lg">Báo giá ước tính của bạn</h2>
        </div>
        <p className="text-green-100 text-sm mt-0.5">Chuyên viên sẽ liên hệ xác nhận sớm nhất</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Main metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-1.5 text-green-700 mb-1">
              <Sun className="w-4 h-4" />
              <span className="text-xs font-medium">Công suất đề xuất</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{result.recommendedCapacityKwp} kWp</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-1.5 text-orange-600 mb-1">
              <Banknote className="w-4 h-4" />
              <span className="text-xs font-medium">Chi phí đầu tư</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {formatVnd(result.estimatedInvestmentAfterVatVnd)}
            </p>
            <p className="text-xs text-gray-900 mt-0.5">Đã bao gồm VAT 8%</p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
            <div className="flex items-center gap-1.5 text-cyan-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Tiết kiệm/năm</span>
            </div>
            <p className="text-2xl font-bold text-cyan-600">{formatVnd(result.annualSavingsVnd)}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-1.5 text-purple-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Hoàn vốn</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{result.paybackYears} năm</p>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sản lượng điện/năm</span>
            <span className="font-semibold">{result.annualProductionKwh.toLocaleString('vi-VN')} kWh</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tỷ suất hoàn vốn (IRR)</span>
            <span className="font-semibold text-green-700">{result.irrPercent}%/năm</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Điện tự dùng/năm</span>
            <span className="font-semibold">{result.selfConsumedKwh.toLocaleString('vi-VN')} kWh</span>
          </div>
        </div>

        {/* Installment plans */}
        {result.installmentPlans.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-green-600" />
              Kế hoạch trả góp
            </p>
            <div className="space-y-2">
              {result.installmentPlans.slice(0, 3).map((plan) => (
                <div
                  key={plan.termMonths}
                  className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg text-sm"
                >
                  <span className="text-gray-600">{plan.termMonths} tháng ({plan.interestRate * 100}%/năm)</span>
                  <span className="font-semibold text-green-700">
                    {formatVnd(plan.monthlyPaymentVnd)}/tháng
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-900 leading-relaxed border-t border-gray-100 pt-3">
          {result.disclaimer}
        </p>

        {/* CTA */}
        {quoteToken && (
          <Link
            href={`/quote/${quoteToken}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-green-200 hover:bg-green-50 text-green-700 font-semibold rounded-xl transition-colors"
          >
            Xem trang báo giá riêng
          </Link>
        )}
        <a
          href="tel:0902211893"
          className="flex items-center justify-center gap-2 w-full py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors"
        >
          Gọi ngay để tư vấn chi tiết
        </a>
      </div>
    </div>
  )
}
