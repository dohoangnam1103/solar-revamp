import { unstable_cache } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { DEFAULT_ASSUMPTIONS, parseFormattedNumber, type QuoteAssumptions } from '@/lib/quote/calculator'

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

export function normalizeSolarAssumptions(value: unknown): QuoteAssumptions {
  const source = asRecord(value)
  const production = asRecord(source.annualProductionPerKwp)
  const prices = asRecord(source.systemPricePerKwp)
  const installmentOptions = Array.isArray(source.installmentOptions)
    ? source.installmentOptions
    : DEFAULT_ASSUMPTIONS.installmentOptions

  return {
    evnPricePerKwh: positiveNumberValue(source.evnPricePerKwh, DEFAULT_ASSUMPTIONS.evnPricePerKwh),
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

export function buildSolarAssumptionsFromForm(formData: FormData): QuoteAssumptions {
  const termMonths = [12, 24, 36, 60]

  return normalizeSolarAssumptions({
    evnPricePerKwh: formData.get('evnPricePerKwh'),
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
