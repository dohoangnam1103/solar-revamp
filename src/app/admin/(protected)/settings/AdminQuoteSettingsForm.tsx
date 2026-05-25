'use client'

import { useMemo, useState } from 'react'
import { updateSolarAssumptions } from '@/app/actions/admin-crud'
import {
  calculateQuote,
  formatVnd,
  type CustomerType,
  type PaymentMode,
  type QuoteAssumptions,
} from '@/lib/quote/calculator'
import { Battery, Banknote, Building2, CreditCard, Factory, Home, Zap } from 'lucide-react'

type AssumptionFormState = {
  evnPricePerKwh: number
  gridTiedPricePerKwp: number
  hybridPricePerKwp: number
  vatPercent: number
  annualElectricityPriceIncreasePercent: number
  annualDegradationPercent: number
  annualOmPercent: number
  productionNorth: number
  productionCentral: number
  productionSouth: number
  productionDefault: number
  installmentSetupFeePercent: number
  installmentInterest12: number
  installmentInterest24: number
  installmentInterest36: number
  installmentInterest60: number
}

const BILL_OPTIONS = [
  { label: 'Dưới 500k', value: 400_000 },
  { label: '500k - 1 triệu', value: 750_000 },
  { label: '1 - 2 triệu', value: 1_500_000 },
  { label: '2 - 3 triệu', value: 2_500_000 },
  { label: '3 - 5 triệu', value: 4_000_000 },
  { label: '5 - 10 triệu', value: 7_500_000 },
  { label: 'Trên 10 triệu', value: 12_000_000 },
]

function percent(value: number) {
  return Number((value * 100).toFixed(3))
}

function initialState(assumptions: QuoteAssumptions): AssumptionFormState {
  const interestByTerm = new Map(
    assumptions.installmentOptions.map((option) => [option.termMonths, percent(option.interestRate)])
  )

  return {
    evnPricePerKwh: Math.round(assumptions.evnPricePerKwh),
    gridTiedPricePerKwp: Math.round(assumptions.systemPricePerKwp.gridTied),
    hybridPricePerKwp: Math.round(assumptions.systemPricePerKwp.hybrid),
    vatPercent: percent(assumptions.vatRate),
    annualElectricityPriceIncreasePercent: percent(assumptions.annualElectricityPriceIncrease),
    annualDegradationPercent: percent(assumptions.annualDegradation),
    annualOmPercent: percent(assumptions.annualOmRate),
    productionNorth: assumptions.annualProductionPerKwp.north,
    productionCentral: assumptions.annualProductionPerKwp.central,
    productionSouth: assumptions.annualProductionPerKwp.south,
    productionDefault: assumptions.annualProductionPerKwp.default,
    installmentSetupFeePercent: percent(assumptions.installmentSetupFee),
    installmentInterest12: interestByTerm.get(12) || 8,
    installmentInterest24: interestByTerm.get(24) || 9,
    installmentInterest36: interestByTerm.get(36) || 10,
    installmentInterest60: interestByTerm.get(60) || 11.5,
  }
}

function toAssumptions(values: AssumptionFormState): QuoteAssumptions {
  return {
    evnPricePerKwh: values.evnPricePerKwh,
    annualProductionPerKwp: {
      north: values.productionNorth,
      central: values.productionCentral,
      south: values.productionSouth,
      default: values.productionDefault,
    },
    systemPricePerKwp: {
      gridTied: values.gridTiedPricePerKwp,
      hybrid: values.hybridPricePerKwp,
    },
    vatRate: values.vatPercent / 100,
    annualDegradation: values.annualDegradationPercent / 100,
    annualElectricityPriceIncrease: values.annualElectricityPriceIncreasePercent / 100,
    annualOmRate: values.annualOmPercent / 100,
    installmentSetupFee: values.installmentSetupFeePercent / 100,
    installmentOptions: [
      { termMonths: 12, interestRate: values.installmentInterest12 / 100 },
      { termMonths: 24, interestRate: values.installmentInterest24 / 100 },
      { termMonths: 36, interestRate: values.installmentInterest36 / 100 },
      { termMonths: 60, interestRate: values.installmentInterest60 / 100 },
    ],
  }
}

function NumberField({
  label,
  name,
  onChange,
  step,
  suffix,
  value,
}: {
  label: string
  name: keyof AssumptionFormState
  onChange: (name: keyof AssumptionFormState, value: number) => void
  step?: string
  suffix?: string
  value: number
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white focus-within:ring-2 focus-within:ring-green-600">
        <input
          name={name === 'gridTiedPricePerKwp' ? 'gridTiedPricePerKwp' : name === 'hybridPricePerKwp' ? 'hybridPricePerKwp' : name}
          type="number"
          step={step}
          value={value}
          onChange={(event) => onChange(name, Number(event.target.value))}
          className="min-w-0 flex-1 px-3 py-2 text-sm text-gray-900 outline-none"
        />
        {suffix && (
          <span className="flex items-center whitespace-nowrap border-l border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </label>
  )
}

function AdminQuotePreview({ assumptions }: { assumptions: QuoteAssumptions }) {
  const [monthlyBillVnd, setMonthlyBillVnd] = useState(2_500_000)
  const [daytimeUsageRate, setDaytimeUsageRate] = useState(0.6)
  const [customerType, setCustomerType] = useState<CustomerType>('residential')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [batteryOption, setBatteryOption] = useState(false)

  const preview = useMemo(
    () =>
      calculateQuote(
        {
          monthlyBillVnd,
          daytimeUsageRate,
          customerType,
          paymentMode,
          batteryOption,
          province: 'Hà Nội',
        },
        assumptions
      ),
    [assumptions, batteryOption, customerType, daytimeUsageRate, monthlyBillVnd, paymentMode]
  )

  return (
    <aside className="sticky top-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-5">
          <p className="text-lg font-bold text-white">Tính báo giá điện mặt trời</p>
          <p className="mt-1 text-sm text-green-100">Preview trước khi lưu</p>
        </div>

        <div className="space-y-5 bg-[linear-gradient(rgba(37,93,43,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(37,93,43,0.035)_1px,transparent_1px)] bg-[size:36px_36px] p-5">
          <div>
            <p className="mb-1.5 text-sm font-medium text-gray-700">Tỉnh / Thành phố</p>
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900">
              Hà Nội
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Hóa đơn điện trung bình/tháng</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              {BILL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMonthlyBillVnd(option.value)}
                  className={`rounded-lg border px-3 py-2 text-center ${
                    monthlyBillVnd === option.value
                      ? 'border-green-700 bg-green-700 text-white'
                      : 'border-gray-200 bg-white text-gray-700 transition-colors hover:border-green-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">
              Tỷ lệ dùng điện ban ngày:{' '}
              <span className="font-bold text-green-700">{Math.round(daytimeUsageRate * 100)}%</span>
            </p>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.1"
              value={daytimeUsageRate}
              onChange={(event) => setDaytimeUsageRate(Number(event.target.value))}
              className="mt-2 w-full cursor-pointer accent-green-700"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-700">
              <span>Chủ yếu tối</span>
              <span>Cả ngày</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Loại khách hàng</p>
            <div className="grid grid-cols-3 gap-2 text-xs font-medium">
              {[
                { value: 'residential', label: 'Gia đình', icon: Home },
                { value: 'business', label: 'Doanh nghiệp', icon: Building2 },
                { value: 'factory', label: 'Nhà máy', icon: Factory },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setCustomerType(item.value as CustomerType)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 ${
                    customerType === item.value
                      ? 'border-green-700 bg-green-700 text-white'
                      : 'border-gray-200 bg-white text-gray-700 transition-colors hover:border-green-500'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBatteryOption((current) => !current)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                batteryOption ? 'bg-green-600' : 'bg-gray-300'
              }`}
              aria-label="Bật tắt pin lưu trữ trong preview"
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  batteryOption ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Battery className="h-4 w-4 text-cyan-500" />
                Thêm pin lưu trữ (Hybrid)
              </p>
              <p className="text-xs text-gray-900">
                {batteryOption ? 'Đang dùng giá Hybrid từ form bên trái' : 'Đang dùng giá hòa lưới từ form bên trái'}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Hình thức thanh toán</p>
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <button
                type="button"
                onClick={() => setPaymentMode('cash')}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 ${
                  paymentMode === 'cash'
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-gray-200 bg-white text-gray-700 transition-colors hover:border-green-500'
                }`}
              >
                <Banknote className="h-4 w-4" />
                Trả thẳng
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('installment')}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 ${
                  paymentMode === 'installment'
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-gray-200 bg-white text-gray-700 transition-colors hover:border-green-500'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                Trả góp
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-cyan-50 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-green-700">
              <Zap className="h-3.5 w-3.5" />
              Ước tính sơ bộ
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Công suất</p>
                <p className="text-lg font-bold text-green-700">{preview.recommendedCapacityKwp} kWp</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Chi phí</p>
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
          {paymentMode === 'installment' && preview.installmentPlans.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-white/80 p-4">
              <p className="mb-2 text-xs font-semibold text-gray-700">Gói trả góp tham khảo</p>
              <div className="space-y-2">
                {preview.installmentPlans.slice(0, 2).map((plan) => (
                  <div key={plan.termMonths} className="flex justify-between text-xs text-gray-700">
                    <span>{plan.termMonths} tháng</span>
                    <span className="font-semibold text-green-700">{formatVnd(plan.monthlyPaymentVnd)}/tháng</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </aside>
  )
}

export default function AdminQuoteSettingsForm({ assumptions }: { assumptions: QuoteAssumptions }) {
  const [values, setValues] = useState(() => initialState(assumptions))
  const previewAssumptions = useMemo(() => toAssumptions(values), [values])

  const updateValue = (name: keyof AssumptionFormState, value: number) => {
    setValues((current) => ({ ...current, [name]: Number.isFinite(value) ? value : 0 }))
  }

  return (
    <div className="grid w-full min-w-[1180px] max-w-none grid-cols-[minmax(0,1fr)_390px] gap-6 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <form action={updateSolarAssumptions} className="space-y-6">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">Giá hệ thống</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="Hòa lưới" name="gridTiedPricePerKwp" suffix="VNĐ/kWp" value={values.gridTiedPricePerKwp} onChange={updateValue} />
              <NumberField label="Hybrid / có lưu trữ" name="hybridPricePerKwp" suffix="VNĐ/kWp" value={values.hybridPricePerKwp} onChange={updateValue} />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">Giá điện và hiệu suất</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField label="Giá điện bình quân" name="evnPricePerKwh" suffix="VNĐ/kWh" value={values.evnPricePerKwh} onChange={updateValue} />
              <NumberField label="VAT" name="vatPercent" step="0.1" suffix="%" value={values.vatPercent} onChange={updateValue} />
              <NumberField label="Tăng giá điện mỗi năm" name="annualElectricityPriceIncreasePercent" step="0.1" suffix="%" value={values.annualElectricityPriceIncreasePercent} onChange={updateValue} />
              <NumberField label="Suy giảm hiệu suất mỗi năm" name="annualDegradationPercent" step="0.1" suffix="%" value={values.annualDegradationPercent} onChange={updateValue} />
              <NumberField label="O&M mỗi năm" name="annualOmPercent" step="0.1" suffix="% đầu tư" value={values.annualOmPercent} onChange={updateValue} />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">Sản lượng theo vùng</h2>
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              <NumberField label="Miền Bắc" name="productionNorth" suffix="kWh/kWp/năm" value={values.productionNorth} onChange={updateValue} />
              <NumberField label="Miền Trung" name="productionCentral" suffix="kWh/kWp/năm" value={values.productionCentral} onChange={updateValue} />
              <NumberField label="Miền Nam" name="productionSouth" suffix="kWh/kWp/năm" value={values.productionSouth} onChange={updateValue} />
              <NumberField label="Mặc định" name="productionDefault" suffix="kWh/kWp/năm" value={values.productionDefault} onChange={updateValue} />
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">Trả góp</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <NumberField label="Phí dịch vụ" name="installmentSetupFeePercent" step="0.1" suffix="%" value={values.installmentSetupFeePercent} onChange={updateValue} />
              <NumberField label="12 tháng" name="installmentInterest12" step="0.1" suffix="%/năm" value={values.installmentInterest12} onChange={updateValue} />
              <NumberField label="24 tháng" name="installmentInterest24" step="0.1" suffix="%/năm" value={values.installmentInterest24} onChange={updateValue} />
              <NumberField label="36 tháng" name="installmentInterest36" step="0.1" suffix="%/năm" value={values.installmentInterest36} onChange={updateValue} />
              <NumberField label="60 tháng" name="installmentInterest60" step="0.1" suffix="%/năm" value={values.installmentInterest60} onChange={updateValue} />
            </div>
          </section>

          <div className="flex items-center gap-3">
            <button type="submit" className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600">
              Lưu cấu hình báo giá
            </button>
            <p className="text-xs text-gray-500">Preview bên phải cập nhật ngay, website đổi sau khi lưu.</p>
          </div>
        </form>

        <AdminQuotePreview assumptions={previewAssumptions} />
      </div>
    </div>
  )
}
