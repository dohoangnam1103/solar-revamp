import { sendMail } from './mailer'
import { getSiteConfig } from '@/lib/site-config'
import { formatVnd } from '@/lib/quote/calculator'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'SOLIQ ENERGY'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

function escapeHtml(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return ''
  return `<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;">${escapeHtml(label)}</td><td style="padding:6px 12px;color:#111827;font-size:14px;font-weight:500;">${escapeHtml(value)}</td></tr>`
}

function wrapEmail(title: string, intro: string, tableRows: string, ctaLabel?: string, ctaUrl?: string): string {
  const cta = ctaLabel && ctaUrl
    ? `<div style="text-align:center;margin-top:24px;"><a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background-color:#15803d;color:#ffffff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">${escapeHtml(ctaLabel)}</a></div>`
    : ''

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#15803d 0%,#16a34a 100%);padding:24px;color:#ffffff;">
          <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1.2px;opacity:0.85;">${escapeHtml(SITE_NAME)}</p>
          <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;">${escapeHtml(title)}</h1>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">${escapeHtml(intro)}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            ${tableRows}
          </table>
          ${cta}
          <p style="margin:24px 0 0;color:#9ca3af;font-size:12px;text-align:center;">Email tự động từ ${escapeHtml(SITE_NAME)}. Vui lòng không trả lời email này.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

async function getRecipients(): Promise<string[]> {
  try {
    const config = await getSiteConfig()
    return config.notificationEmails
  } catch {
    return []
  }
}

export type QuoteNotificationPayload = {
  name: string
  phone: string
  email?: string | null
  address?: string | null
  province?: string | null
  monthlyBillVnd: number
  customerType: string
  paymentMode: string
  batteryOption: boolean
  recommendedCapacityKwp: number
  estimatedInvestmentVnd: number
  paybackYears: number
  quoteToken?: string
}

export async function notifyNewQuote(payload: QuoteNotificationPayload) {
  const recipients = await getRecipients()
  if (!recipients.length) return

  const customerTypeLabel: Record<string, string> = {
    residential: 'Gia đình',
    business: 'Doanh nghiệp',
    factory: 'Nhà máy',
  }
  const paymentModeLabel: Record<string, string> = {
    cash: 'Trả thẳng',
    installment: 'Trả góp',
    lease: 'Thuê hệ thống',
  }

  const tableRows = [
    row('Họ tên', payload.name),
    row('Số điện thoại', payload.phone),
    row('Email', payload.email || undefined),
    row('Tỉnh/Thành', payload.province || undefined),
    row('Địa chỉ', payload.address || undefined),
    row('Hóa đơn điện/tháng', formatVnd(payload.monthlyBillVnd)),
    row('Loại khách hàng', customerTypeLabel[payload.customerType] || payload.customerType),
    row('Hình thức', paymentModeLabel[payload.paymentMode] || payload.paymentMode),
    row('Pin lưu trữ', payload.batteryOption ? 'Có' : 'Không'),
    row('Công suất đề xuất', `${payload.recommendedCapacityKwp} kWp`),
    row('Chi phí ước tính', formatVnd(payload.estimatedInvestmentVnd)),
    row('Hoàn vốn', `${payload.paybackYears} năm`),
  ].join('')

  const ctaUrl = SITE_URL ? `${SITE_URL}/admin/quotes` : undefined
  const html = wrapEmail(
    'Yêu cầu báo giá mới',
    `Có khách hàng vừa gửi yêu cầu báo giá điện mặt trời. Liên hệ trong vòng 5 phút để tăng tỷ lệ chốt.`,
    tableRows,
    ctaUrl ? 'Xem trong admin' : undefined,
    ctaUrl
  )

  await sendMail({
    to: recipients,
    subject: `[${SITE_NAME}] Báo giá mới: ${payload.name} - ${payload.phone}`,
    html,
  })
}

export type ContactNotificationPayload = {
  name: string
  phone: string
  email?: string | null
  message?: string | null
}

export async function notifyNewContact(payload: ContactNotificationPayload) {
  const recipients = await getRecipients()
  if (!recipients.length) return

  const tableRows = [
    row('Họ tên', payload.name),
    row('Số điện thoại', payload.phone),
    row('Email', payload.email || undefined),
    row('Nội dung', payload.message || undefined),
  ].join('')

  const ctaUrl = SITE_URL ? `${SITE_URL}/admin/leads` : undefined
  const html = wrapEmail(
    'Yêu cầu tư vấn mới',
    `Có khách hàng vừa liên hệ qua form tư vấn. Vui lòng phản hồi sớm.`,
    tableRows,
    ctaUrl ? 'Xem trong admin' : undefined,
    ctaUrl
  )

  await sendMail({
    to: recipients,
    subject: `[${SITE_NAME}] Tư vấn mới: ${payload.name} - ${payload.phone}`,
    html,
  })
}

export type RecruitmentNotificationPayload = {
  name: string
  phone: string
  email?: string | null
  position: string
  message?: string | null
}

export async function notifyNewRecruitmentApplication(payload: RecruitmentNotificationPayload) {
  const recipients = await getRecipients()
  if (!recipients.length) return

  const tableRows = [
    row('Vị trí ứng tuyển', payload.position),
    row('Họ tên', payload.name),
    row('Số điện thoại', payload.phone),
    row('Email', payload.email || undefined),
    row('Ghi chú', payload.message || undefined),
  ].join('')

  const ctaUrl = SITE_URL ? `${SITE_URL}/admin/recruitment` : undefined
  const html = wrapEmail(
    'Đơn ứng tuyển mới',
    `Có ứng viên vừa nộp đơn cho vị trí "${payload.position}".`,
    tableRows,
    ctaUrl ? 'Xem trong admin' : undefined,
    ctaUrl
  )

  await sendMail({
    to: recipients,
    subject: `[${SITE_NAME}] Ứng tuyển mới: ${payload.name} - ${payload.position}`,
    html,
  })
}
