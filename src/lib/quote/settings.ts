import { unstable_cache } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { DEFAULT_ASSUMPTIONS, parseFormattedNumber, type PricingTier, type QuoteAssumptions } from '@/lib/quote/calculator'

const SETTINGS_KEY = 'solar_assumptions'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function numberValue(value: unknown, fallback: number) {
  return parseFormattedNumber(value, fallback)
}

function positiveNumberValue(value: unknown, fallback: number) {
  const parsed = numberValue(value, fallback)
  return parsed > 0 ? parsed : fallback
}

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = parseFormattedNumber(value, NaN)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function normalizePricingTiers(value: unknown): PricingTier[] {
  if (!Array.isArray(value)) return DEFAULT_ASSUMPTIONS.pricingTiers
  const tiers = value
    .map((item) => asRecord(item))
    .map((item, index) => {
      const fallback = DEFAULT_ASSUMPTIONS.pricingTiers[index] ?? DEFAULT_ASSUMPTIONS.pricingTiers[0]
      const billMin = positiveNumberValue(item.billMin, fallback.billMin)
      const billMax = nullableNumber(item.billMax)
      const label = typeof item.label === 'string' && item.label.trim() ? item.label.trim() : fallback.label
      const capacityKwp = positiveNumberValue(item.capacityKwp, fallback.capacityKwp)
      const gridTiedPriceVnd = positiveNumberValue(item.gridTiedPriceVnd, fallback.gridTiedPriceVnd)
      const hybridPriceVnd = positiveNumberValue(item.hybridPriceVnd, fallback.hybridPriceVnd)
      return { billMin, billMax, label, capacityKwp, gridTiedPriceVnd, hybridPriceVnd }
    })
    .filter((tier) => tier.capacityKwp > 0 && tier.gridTiedPriceVnd > 0 && tier.hybridPriceVnd > 0)
    .sort((a, b) => a.billMin - b.billMin)

  return tiers.length > 0 ? tiers : DEFAULT_ASSUMPTIONS.pricingTiers
}

export function normalizeSolarAssumptions(value: unknown): QuoteAssumptions {
  const source = asRecord(value)
  const production = asRecord(source.annualProductionPerKwp)
  const prices = asRecord(source.systemPricePerKwp)
  const installmentOptions = Array.isArray(source.installmentOptions)
    ? source.installmentOptions
    : DEFAULT_ASSUMPTIONS.installmentOptions

  return {
    evnPricePerKwh: positiveNumberValue(source.evnPricePerKwh, DEFAULT_ASSUMPTIONS.evnPricePerKwh),
    pricingTiers: normalizePricingTiers(source.pricingTiers),
    annualProductionPerKwp: {
      north: positiveNumberValue(production.north, DEFAULT_ASSUMPTIONS.annualProductionPerKwp.north),
      central: positiveNumberValue(production.central, DEFAULT_ASSUMPTIONS.annualProductionPerKwp.central),
      south: positiveNumberValue(production.south, DEFAULT_ASSUMPTIONS.annualProductionPerKwp.south),
      default: positiveNumberValue(production.default, DEFAULT_ASSUMPTIONS.annualProductionPerKwp.default),
    },
    systemPricePerKwp: {
      gridTied: positiveNumberValue(prices.gridTied, DEFAULT_ASSUMPTIONS.systemPricePerKwp.gridTied),
      hybrid: positiveNumberValue(prices.hybrid, DEFAULT_ASSUMPTIONS.systemPricePerKwp.hybrid),
    },
    vatRate: numberValue(source.vatRate, DEFAULT_ASSUMPTIONS.vatRate),
    annualDegradation: numberValue(source.annualDegradation, DEFAULT_ASSUMPTIONS.annualDegradation),
    annualElectricityPriceIncrease: numberValue(
      source.annualElectricityPriceIncrease,
      DEFAULT_ASSUMPTIONS.annualElectricityPriceIncrease
    ),
    annualOmRate: numberValue(source.annualOmRate, DEFAULT_ASSUMPTIONS.annualOmRate),
    installmentSetupFee: numberValue(source.installmentSetupFee, DEFAULT_ASSUMPTIONS.installmentSetupFee),
    installmentOptions: installmentOptions.map((option, index) => {
      const fallback = DEFAULT_ASSUMPTIONS.installmentOptions[index] || DEFAULT_ASSUMPTIONS.installmentOptions[0]
      const item = asRecord(option)
      return {
        termMonths: numberValue(item.termMonths, fallback.termMonths),
        interestRate: numberValue(item.interestRate, fallback.interestRate),
      }
    }),
  }
}

export const getSolarAssumptions = unstable_cache(
  async () => {
    try {
      const rows = await db.select().from(settings).where(eq(settings.key, SETTINGS_KEY)).limit(1)
      return normalizeSolarAssumptions(rows[0]?.valueJson)
    } catch {
      return DEFAULT_ASSUMPTIONS
    }
  },
  [SETTINGS_KEY],
  { tags: ['quote-assumptions'], revalidate: 300 }
)

function buildPricingTiersFromForm(formData: FormData): PricingTier[] {
  const tiers: PricingTier[] = []
  for (let i = 0; i < 16; i++) {
    const label = formData.get(`tier_${i}_label`)
    const billMin = formData.get(`tier_${i}_billMin`)
    const billMax = formData.get(`tier_${i}_billMax`)
    const capacity = formData.get(`tier_${i}_capacity`)
    const gridPrice = formData.get(`tier_${i}_gridPrice`)
    const hybridPrice = formData.get(`tier_${i}_hybridPrice`)

    if (!label && !capacity && !gridPrice && !hybridPrice) continue

    const labelStr = typeof label === 'string' ? label.trim() : ''
    const capacityNum = parseFormattedNumber(capacity, 0)
    const gridNum = parseFormattedNumber(gridPrice, 0)
    const hybridNum = parseFormattedNumber(hybridPrice, 0)

    if (!labelStr || capacityNum <= 0 || gridNum <= 0 || hybridNum <= 0) continue

    tiers.push({
      label: labelStr,
      billMin: parseFormattedNumber(billMin, 0),
      billMax: nullableNumber(billMax),
      capacityKwp: capacityNum,
      gridTiedPriceVnd: gridNum,
      hybridPriceVnd: hybridNum,
    })
  }
  return tiers.length > 0 ? tiers : DEFAULT_ASSUMPTIONS.pricingTiers
}

export function buildSolarAssumptionsFromForm(formData: FormData): QuoteAssumptions {
  const termMonths = [12, 24, 36, 60]

  return normalizeSolarAssumptions({
    evnPricePerKwh: formData.get('evnPricePerKwh'),
    pricingTiers: buildPricingTiersFromForm(formData),
    annualProductionPerKwp: {
      north: formData.get('productionNorth'),
      central: formData.get('productionCentral'),
      south: formData.get('productionSouth'),
      default: formData.get('productionDefault'),
    },
    systemPricePerKwp: {
      gridTied: formData.get('gridTiedPricePerKwp'),
      hybrid: formData.get('hybridPricePerKwp'),
    },
    vatRate: numberValue(formData.get('vatPercent'), DEFAULT_ASSUMPTIONS.vatRate * 100) / 100,
    annualDegradation: numberValue(
      formData.get('annualDegradationPercent'),
      DEFAULT_ASSUMPTIONS.annualDegradation * 100
    ) / 100,
    annualElectricityPriceIncrease:
      numberValue(
        formData.get('annualElectricityPriceIncreasePercent'),
        DEFAULT_ASSUMPTIONS.annualElectricityPriceIncrease * 100
      ) / 100,
    annualOmRate: numberValue(formData.get('annualOmPercent'), DEFAULT_ASSUMPTIONS.annualOmRate * 100) / 100,
    installmentSetupFee:
      numberValue(formData.get('installmentSetupFeePercent'), DEFAULT_ASSUMPTIONS.installmentSetupFee * 100) / 100,
    installmentOptions: termMonths.map((termMonths) => ({
      termMonths,
      interestRate:
        numberValue(
          formData.get(`installmentInterest_${termMonths}`) || formData.get(`installmentInterest${termMonths}`),
          (DEFAULT_ASSUMPTIONS.installmentOptions.find((option) => option.termMonths === termMonths)?.interestRate || 0) * 100
        ) / 100,
    })),
  })
}
