'use server'

import { db } from '@/lib/db'
import { leads, quoteRequests, quoteResults } from '@/lib/db/schema'
import { calculateQuote, type QuoteInput } from '@/lib/quote/calculator'
import { revalidatePath } from 'next/cache'

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
  result?: ReturnType<typeof calculateQuote>
  error?: string
}

export async function submitQuote(
  _prevState: SubmitQuoteResult,
  formData: FormData
): Promise<SubmitQuoteResult> {
  try {
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
    if (!monthlyBillVnd || monthlyBillVnd < 50_000) {
      return { success: false, error: 'Hóa đơn điện không hợp lệ (tối thiểu 50.000đ).' }
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
    const result = calculateQuote(quoteInput)

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
    const [quoteReq] = await db
      .insert(quoteRequests)
      .values({
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

    return {
      success: true,
      quoteId: quoteRes.id,
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
  return calculateQuote(input)
}
