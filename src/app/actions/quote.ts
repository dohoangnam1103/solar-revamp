'use server'

import { db } from '@/lib/db'
import { leads, quoteRequests, quoteResults } from '@/lib/db/schema'
import { calculateQuote, formatVnd, type QuoteInput } from '@/lib/quote/calculator'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { getSolarAssumptions } from '@/lib/quote/settings'
import { notifyNewQuote } from '@/lib/email/notifications'

export interface SubmitQuoteInput extends QuoteInput {
  // Lead info
  name: string
  phone: string
  email?: string
  address?: string
  district?: string
  ward?: string
}

export interface SubmitQuoteResult {
  success: boolean
  quoteId?: number
  quoteToken?: string
  result?: ReturnType<typeof calculateQuote>
  error?: string
}

export async function submitQuote(
  _prevState: SubmitQuoteResult,
  formData: FormData
): Promise<SubmitQuoteResult> {
  try {
    if (!(await checkRateLimit('quote-form', 8, 60 * 60 * 1000))) {
      return { success: false, error: 'Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau.' }
    }

    // Parse form data
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = (formData.get('email') as string) || undefined
    const address = (formData.get('address') as string) || undefined
    const province = (formData.get('province') as string) || undefined
    const district = (formData.get('district') as string) || undefined
    const ward = (formData.get('ward') as string) || undefined
    const monthlyBillVnd = parseInt(formData.get('monthlyBillVnd') as string, 10)
    const daytimeUsageRate = parseFloat(formData.get('daytimeUsageRate') as string)
    const customerType = (formData.get('customerType') as string) || 'residential'
    const paymentMode = (formData.get('paymentMode') as string) || 'cash'
    const batteryOption = formData.get('batteryOption') === 'true'
    const roofAreaSqm = formData.get('roofAreaSqm')
      ? parseFloat(formData.get('roofAreaSqm') as string)
      : undefined

    // Validate required fields
    if (!name || !phone) {
      return { success: false, error: 'Vui lòng nhập họ tên và số điện thoại.' }
    }
    if (name.length > 120 || phone.length > 40 || (email && email.length > 180) || (address && address.length > 500)) {
      return { success: false, error: 'Thông tin gửi lên quá dài. Vui lòng kiểm tra lại.' }
    }
    if (!monthlyBillVnd || monthlyBillVnd < 50_000) {
      return { success: false, error: `Hóa đơn điện không hợp lệ (tối thiểu ${formatVnd(50_000)}).` }
    }
    if (daytimeUsageRate < 0 || daytimeUsageRate > 1) {
      return { success: false, error: 'Tỷ lệ dùng điện ban ngày không hợp lệ.' }
    }

    const quoteInput: QuoteInput = {
      monthlyBillVnd,
      daytimeUsageRate,
      customerType: customerType as QuoteInput['customerType'],
      paymentMode: paymentMode as QuoteInput['paymentMode'],
      batteryOption,
      province,
      roofAreaSqm,
    }

    // Calculate quote
    const assumptions = await getSolarAssumptions()
    const result = calculateQuote(quoteInput, assumptions)

    // Save lead
    const [lead] = await db
      .insert(leads)
      .values({
        name,
        phone,
        email,
        address,
        province,
        district,
        ward,
        source: 'website_quote',
        status: 'new',
      })
      .returning({ id: leads.id })

    // Save quote request
    const publicToken = randomBytes(18).toString('base64url')
    const [quoteReq] = await db
      .insert(quoteRequests)
      .values({
        publicToken,
        leadId: lead.id,
        paymentMode: quoteInput.paymentMode,
        customerType: quoteInput.customerType,
        monthlyBillVnd: quoteInput.monthlyBillVnd,
        daytimeUsageRate: quoteInput.daytimeUsageRate,
        roofAreaSqm: quoteInput.roofAreaSqm,
        batteryOption: quoteInput.batteryOption,
        locationJson: { province, district, ward },
        inputJson: quoteInput,
      })
      .returning({ id: quoteRequests.id })

    // Save quote result
    const [quoteRes] = await db
      .insert(quoteResults)
      .values({
        quoteRequestId: quoteReq.id,
        recommendedCapacityKwp: result.recommendedCapacityKwp,
        estimatedInvestmentVnd: result.estimatedInvestmentAfterVatVnd,
        annualProductionKwh: result.annualProductionKwh,
        annualSavingsVnd: result.annualSavingsVnd,
        paybackYears: result.paybackYears,
        irrPercent: result.irrPercent,
        installmentPlansJson: result.installmentPlans,
        resultJson: result,
      })
      .returning({ id: quoteResults.id })

    revalidatePath('/admin/leads')
    revalidatePath('/admin/quotes')

    // Await the notification so the SMTP send completes before the server
    // action returns (fire-and-forget gets cut off in standalone runtime).
    try {
      await notifyNewQuote({
        name,
        phone,
        email,
        address,
        province,
        monthlyBillVnd: quoteInput.monthlyBillVnd,
        customerType: quoteInput.customerType,
        paymentMode: quoteInput.paymentMode,
        batteryOption: Boolean(quoteInput.batteryOption),
        recommendedCapacityKwp: result.recommendedCapacityKwp,
        estimatedInvestmentVnd: result.estimatedInvestmentAfterVatVnd,
        paybackYears: result.paybackYears,
        quoteToken: publicToken,
      })
    } catch (err) {
      console.error('[notifyNewQuote] failed:', err)
    }

    return {
      success: true,
      quoteId: quoteRes.id,
      quoteToken: publicToken,
      result,
    }
  } catch (err) {
    console.error('submitQuote error:', err)
    return {
      success: false,
      error: 'Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hotline.',
    }
  }
}

// Quick calculate without saving (for live preview)
export async function previewQuote(input: QuoteInput) {
  'use server'
  const assumptions = await getSolarAssumptions()
  return calculateQuote(input, assumptions)
}
