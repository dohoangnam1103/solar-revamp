'use client'

import { useMemo, useState } from 'react'
import { updateSolarAssumptions } from '@/app/actions/admin-crud'
import {
  calculateQuote,
  formatNumberWithDots,
  formatVnd,
  type CustomerType,
  type PaymentMode,
  type PricingTier,
  type QuoteAssumptions,
} from '@/lib/quote/calculator'
import { Battery, Banknote, Building2, ChevronDown, ChevronUp, CreditCard, Factory, Home, Plus, Trash2, Zap } from 'lucide-react'

type AssumptionFormState = {
  evnPricePerKwh: number
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

type TierRow = PricingTier & { _key: string }

function percent(value: number) {
  return Number((value * 100).toFixed(3))
}

function tierKey(prefix: string, index: number) {
  return `${prefix}-${index}`
}

function initialState(assumptions: QuoteAssumptions): AssumptionFormState {
  const interestByTerm = new Map(
    assumptions.installmentOptions.map((option) => [option.termMonths, percent(option.interestRate)])
  )

  return {
    evnPricePerKwh: Math.round(assumptions.evnPricePerKwh),
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

function buildAssumptions(values: AssumptionFormState, tiers: TierRow[]): QuoteAssumptions {
  return {
    evnPricePerKwh: values.evnPricePerKwh,
    pricingTiers: tiers.map(({ _key, ...tier }) => tier),
    annualProductionPerKwp: {
      north: values.productionNorth,
      central: values.productionCentral,
      south: values.productionSouth,
      default: values.productionDefault,
    },
    systemPricePerKwp: {
      gridTied: tiers[0]?.gridTiedPriceVnd && tiers[0]?.capacityKwp
        ? Math.round(tiers[0].gridTiedPriceVnd / tiers[0].capacityKwp)
        : 8_000_000,
      hybrid: tiers[0]?.hybridPriceVnd && tiers[0]?.capacityKwp
        ? Math.round(tiers[0].hybridPriceVnd / tiers[0].capacityKwp)
        : 9_800_000,
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

function CurrencyInput({
  name,
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  name: string
  value: number | null
  onChange: (value: number | null) => void
  placeholder?: string
  ariaLabel: string
}) {
  return (
    <input
      name={name}
      type="text"
      inputMode="numeric"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={value === null ? '' : formatNumberWithDots(value)}
      onChange={(event) => {
        const raw = event.target.value.replace(/\D/g, '')
        if (raw === '') {
          onChange(null)
        } else {
          const parsed = Number(raw)
          onChange(Number.isFinite(parsed) ? parsed : null)
        }
      }}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
    />
  )
}

function NumberInput({
  name,
  value,
  onChange,
  step,
  ariaLabel,
}: {
  name: string
  value: number
  onChange: (value: number) => void
  step?: string
  ariaLabel: string
}) {
  return (
    <input
      name={name}
      type="number"
      step={step}
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
    />
  )
}

function PricingTiersTable({
  tiers,
  setTiers,
}: {
  tiers: TierRow[]
  setTiers: (next: TierRow[]) => void
}) {
  const updateTier = (index: number, patch: Partial<TierRow>) => {
    const next = tiers.slice()
    next[index] = { ...next[index], ...patch }
    setTiers(next)
  }

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index))
  }

  const addTier = () => {
    const last = tiers[tiers.length - 1]
    const nextMin = last?.billMax ?? 0
    setTiers([
      ...tiers,
      {
        _key: tierKey('new', Date.now()),
        label: 'Mới',
        billMin: nextMin,
        billMax: null,
        capacityKwp: 5,
        gridTiedPriceVnd: 50_000_000,
        hybridPriceVnd: 70_000_000,
      },
    ])
  }

  return (
    <div className="space-y-3">
      <div className="hidden grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr_1fr_1fr_36px] gap-2 px-2 text-xs font-medium uppercase tracking-wide text-gray-500 lg:grid">
        <div>Nhãn hiển thị</div>
        <div>Hoá đơn từ (đ)</div>
        <div>Hoá đơn đến (đ)</div>
        <div>Công suất (kWp)</div>
        <div>Giá hoà lưới (đ)</div>
        <div>Giá Hybrid (đ)</div>
        <div></div>
      </div>

      {tiers.map((tier, index) => (
        <div
          key={tier._key}
          className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 lg:grid-cols-[1.4fr_0.9fr_0.9fr_0.7fr_1fr_1fr_36px] lg:bg-transparent lg:p-2"
        >
          <input type="hidden" name={`tier_${index}_label`} value={tier.label} />
          <input type="hidden" name={`tier_${index}_billMin`} value={String(tier.billMin)} />
          <input type="hidden" name={`tier_${index}_billMax`} value={tier.billMax === null ? '' : String(tier.billMax)} />
          <input type="hidden" name={`tier_${index}_capacity`} value={String(tier.capacityKwp)} />
          <input type="hidden" name={`tier_${index}_gridPrice`} value={String(tier.gridTiedPriceVnd)} />
          <input type="hidden" name={`tier_${index}_hybridPrice`} value={String(tier.hybridPriceVnd)} />

          <div className="col-span-2 lg:col-span-1">
            <span className="mb-1 block text-xs font-medium text-gray-600 lg:hidden">Nhãn</span>
            <input
              type="text"
              value={tier.label}
              onChange={(event) => updateTier(index, { label: event.target.value })}
              placeholder="2 - 3 triệu"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600 lg:hidden">Hoá đơn từ</span>
            <CurrencyInput
              name=""
              value={tier.billMin}
              onChange={(value) => updateTier(index, { billMin: value ?? 0 })}
              ariaLabel="Hoá đơn từ"
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600 lg:hidden">Hoá đơn đến</span>
            <CurrencyInput
              name=""
              value={tier.billMax}
              onChange={(value) => updateTier(index, { billMax: value })}
              placeholder="Không giới hạn"
              ariaLabel="Hoá đơn đến"
            />
          </div>

          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600 lg:hidden">Công suất (kWp)</span>
            <input
              type="number"
              step="0.5"
              min="0"
              value={tier.capacityKwp}
              onChange={(event) => updateTier(index, { capacityKwp: Number(event.target.value) })}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>

          <div className="col-span-2 lg:col-span-1">
            <span className="mb-1 block text-xs font-medium text-gray-600 lg:hidden">Giá hoà lưới</span>
            <CurrencyInput
              name=""
              value={tier.gridTiedPriceVnd}
              onChange={(value) => updateTier(index, { gridTiedPriceVnd: value ?? 0 })}
              ariaLabel="Giá hoà lưới"
            />
          </div>

          <div className="col-span-2 lg:col-span-1">
            <span className="mb-1 block text-xs font-medium text-gray-600 lg:hidden">Giá Hybrid (có pin)</span>
            <CurrencyInput
              name=""
              value={tier.hybridPriceVnd}
              onChange={(value) => updateTier(index, { hybridPriceVnd: value ?? 0 })}
              ariaLabel="Giá Hybrid"
            />
          </div>

          <button
            type="button"
            onClick={() => removeTier(index)}
            className="col-span-2 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-2 py-2 text-red-600 transition-colors hover:bg-red-50 lg:col-span-1"
            title="Xoá dòng"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addTier}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-green-400 bg-white px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50"
      >
        <Plus className="h-4 w-4" />
        Thêm mức giá
      </button>
    </div>
  )
}

function PreviewPanel({ assumptions }: { assumptions: QuoteAssumptions }) {
  const billOptions = useMemo(() => {
    const options = assumptions.pricingTiers
      .map((tier) => {
        const sample = tier.billMax === null
          ? Math.round(tier.billMin * 1.2)
          : Math.round((tier.billMin + tier.billMax) / 2)
        return { value: sample, label: tier.label }
      })
      .filter((item) => item.value > 0)

    if (options.length > 0) return options
    return [
      { value: 1_500_000, label: '1 - 2 triệu' },
      { value: 2_500_000, label: '2 - 3 triệu' },
      { value: 4_000_000, label: '3 - 5 triệu' },
      { value: 7_500_000, label: '5 - 10 triệu' },
    ]
  }, [assumptions.pricingTiers])

  const [monthlyBillVnd, setMonthlyBillVnd] = useState(billOptions[0]?.value ?? 2_500_000)
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
    <aside className="sticky top-6 space-y-4">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-5 py-4 text-white">
          <p className="text-sm font-medium opacity-90">Preview báo giá</p>
          <p className="text-base font-semibold">Cập nhật ngay khi bạn chỉnh form</p>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Hoá đơn điện/tháng</p>
            <div className="grid grid-cols-2 gap-2">
              {billOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMonthlyBillVnd(option.value)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium leading-snug ${
                    monthlyBillVnd === option.value
                      ? 'border-green-700 bg-green-700 text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-green-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tỷ lệ dùng ban ngày: <span className="text-green-700">{Math.round(daytimeUsageRate * 100)}%</span>
            </p>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.1"
              value={daytimeUsageRate}
              onChange={(event) => setDaytimeUsageRate(Number(event.target.value))}
              className="mt-2 w-full accent-green-700"
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { value: 'residential', label: 'Gia đình', icon: Home },
              { value: 'business', label: 'Doanh nghiệp', icon: Building2 },
              { value: 'factory', label: 'Nhà máy', icon: Factory },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCustomerType(item.value as CustomerType)}
                className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-xs ${
                  customerType === item.value
                    ? 'border-green-700 bg-green-700 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-400'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBatteryOption((current) => !current)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                batteryOption ? 'bg-green-600' : 'bg-gray-300'
              }`}
              aria-label="Toggle pin lưu trữ"
            >
              <span
                className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  batteryOption ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-gray-700">
              <Battery className="h-3.5 w-3.5 text-cyan-500" />
              Có pin lưu trữ (Hybrid)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setPaymentMode('cash')}
              className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs ${
                paymentMode === 'cash' ? 'border-green-700 bg-green-700 text-white' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <Banknote className="h-3.5 w-3.5" />
              Trả thẳng
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('installment')}
              className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs ${
                paymentMode === 'installment' ? 'border-green-700 bg-green-700 text-white' : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Trả góp
            </button>
          </div>

          <div className="rounded-xl border border-green-100 bg-gradient-to-br from-green-50 to-cyan-50 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-green-700">
              <Zap className="h-3.5 w-3.5" /> Ước tính
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Công suất</p>
                <p className="text-base font-bold text-green-700">{preview.recommendedCapacityKwp} kWp</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Chi phí</p>
                <p className="text-base font-bold text-orange-600">{formatVnd(preview.estimatedInvestmentAfterVatVnd)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Tiết kiệm/năm</p>
                <p className="text-sm font-semibold text-gray-800">{formatVnd(preview.annualSavingsVnd)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-500">Hoàn vốn</p>
                <p className="text-sm font-semibold text-gray-800">{preview.paybackYears} năm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default function AdminQuoteSettingsForm({ assumptions }: { assumptions: QuoteAssumptions }) {
  const [values, setValues] = useState(() => initialState(assumptions))
  const [tiers, setTiers] = useState<TierRow[]>(() =>
    assumptions.pricingTiers.map((tier, index) => ({ ...tier, _key: tierKey('init', index) }))
  )
  const [showAdvanced, setShowAdvanced] = useState(false)

  const previewAssumptions = useMemo(() => buildAssumptions(values, tiers), [values, tiers])

  const updateValue = (name: keyof AssumptionFormState, value: number) => {
    setValues((current) => ({ ...current, [name]: Number.isFinite(value) ? value : 0 }))
  }

  return (
    <div className="grid w-full max-w-none grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <form action={updateSolarAssumptions} className="space-y-6">
        {/* Bảng giá theo hoá đơn */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Bảng giá theo hoá đơn điện</h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            Thiết lập từng mức giá theo hoá đơn điện hàng tháng của khách. Hệ thống chọn dòng phù hợp khi khách nhập hoá đơn.
          </p>
          <PricingTiersTable tiers={tiers} setTiers={setTiers} />
        </section>

        {/* Cài đặt nâng cao */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setShowAdvanced((current) => !current)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Cài đặt nâng cao</h2>
              <p className="mt-1 text-xs text-gray-500">
                Tham số dùng để ước tính hoàn vốn, IRR, sản lượng theo vùng. Ít khi cần thay đổi.
              </p>
            </div>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          {showAdvanced && (
            <div className="space-y-6 border-t border-gray-100 px-5 py-5">
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Giá điện và hiệu suất</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Giá điện EVN bình quân (VNĐ/kWh)</span>
                    <CurrencyInput name="evnPricePerKwh" value={values.evnPricePerKwh} onChange={(value) => updateValue('evnPricePerKwh', value ?? 0)} ariaLabel="Giá điện EVN" />
                  </div>
                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">VAT (%)</span>
                    <NumberInput name="vatPercent" value={values.vatPercent} onChange={(value) => updateValue('vatPercent', value)} step="0.1" ariaLabel="VAT" />
                  </div>
                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Tăng giá điện mỗi năm (%)</span>
                    <NumberInput name="annualElectricityPriceIncreasePercent" value={values.annualElectricityPriceIncreasePercent} onChange={(value) => updateValue('annualElectricityPriceIncreasePercent', value)} step="0.1" ariaLabel="Tăng giá điện" />
                  </div>
                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Suy giảm hiệu suất/năm (%)</span>
                    <NumberInput name="annualDegradationPercent" value={values.annualDegradationPercent} onChange={(value) => updateValue('annualDegradationPercent', value)} step="0.1" ariaLabel="Suy giảm hiệu suất" />
                  </div>
                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Bảo trì O&M/năm (% đầu tư)</span>
                    <NumberInput name="annualOmPercent" value={values.annualOmPercent} onChange={(value) => updateValue('annualOmPercent', value)} step="0.1" ariaLabel="Chi phí bảo trì" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Sản lượng điện theo vùng (kWh/kWp/năm)</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Miền Bắc</span>
                    <NumberInput name="productionNorth" value={values.productionNorth} onChange={(value) => updateValue('productionNorth', value)} ariaLabel="Sản lượng miền Bắc" />
                  </div>
                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Miền Trung</span>
                    <NumberInput name="productionCentral" value={values.productionCentral} onChange={(value) => updateValue('productionCentral', value)} ariaLabel="Sản lượng miền Trung" />
                  </div>
                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Miền Nam</span>
                    <NumberInput name="productionSouth" value={values.productionSouth} onChange={(value) => updateValue('productionSouth', value)} ariaLabel="Sản lượng miền Nam" />
                  </div>
                  <div className="block">
                    <span className="mb-1 block text-xs font-medium text-gray-600">Mặc định</span>
                    <NumberInput name="productionDefault" value={values.productionDefault} onChange={(value) => updateValue('productionDefault', value)} ariaLabel="Sản lượng mặc định" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="flex items-center gap-3 sticky bottom-0 -mx-2 bg-gradient-to-t from-white via-white py-3 px-2">
          <button type="submit" className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-800">
            Lưu cấu hình báo giá
          </button>
          <p className="text-xs text-gray-500">Preview bên phải cập nhật ngay, website đổi sau khi lưu.</p>
        </div>
      </form>

      <PreviewPanel assumptions={previewAssumptions} />
    </div>
  )
}
