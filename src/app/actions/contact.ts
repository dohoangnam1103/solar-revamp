'use server'

import { db } from '@/lib/db'
import { leads, recruitmentApplications } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { notifyNewContact, notifyNewRecruitmentApplication } from '@/lib/email/notifications'

export interface ContactState {
  success?: boolean
  error?: string
}

export async function submitContact(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  if (!(await checkRateLimit('contact-form', 6, 60 * 60 * 1000))) {
    return { error: 'Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau.' }
  }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = (formData.get('email') as string) || undefined
  const message = (formData.get('message') as string) || undefined

  if (!name?.trim() || !phone?.trim()) {
    return { error: 'Vui lòng nhập họ tên và số điện thoại.' }
  }
  if (name.length > 120 || phone.length > 40 || (email && email.length > 180) || (message && message.length > 2000)) {
    return { error: 'Thông tin gửi lên quá dài. Vui lòng kiểm tra lại.' }
  }

  try {
    await db.insert(leads).values({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      note: message?.trim(),
      source: 'contact_form',
      status: 'new',
    })
    revalidatePath('/admin/leads')

    // Await the notification so the SMTP send completes before the server
    // action returns. In standalone runtime, fire-and-forget promises can be
    // cut off when the request context ends, silently dropping the email.
    try {
      await notifyNewContact({
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim(),
        message: message?.trim(),
      })
    } catch (err) {
      console.error('[notifyNewContact] failed:', err)
    }

    return { success: true }
  } catch {
    return { error: 'Có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.' }
  }
}

export async function submitRecruitmentApplication(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  if (!(await checkRateLimit('recruitment-form', 6, 60 * 60 * 1000))) {
    return { error: 'Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau.' }
  }

  const position = formData.get('position') as string
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = (formData.get('email') as string) || undefined
  const message = (formData.get('message') as string) || undefined

  if (!name?.trim() || !phone?.trim()) {
    return { error: 'Vui lòng nhập họ tên và số điện thoại.' }
  }

  if (
    name.length > 120 ||
    phone.length > 40 ||
    position.length > 180 ||
    (email && email.length > 180) ||
    (message && message.length > 2000)
  ) {
    return { error: 'Thông tin gửi lên quá dài. Vui lòng kiểm tra lại.' }
  }

  try {
    await db.insert(recruitmentApplications).values({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      position: position.trim() || 'Tin tuyển dụng',
      message: message?.trim(),
      status: 'new',
    })
    revalidatePath('/admin/recruitment')

    try {
      await notifyNewRecruitmentApplication({
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim(),
        position: position.trim() || 'Tin tuyển dụng',
        message: message?.trim(),
      })
    } catch (err) {
      console.error('[notifyNewRecruitmentApplication] failed:', err)
    }

    return { success: true }
  } catch {
    return { error: 'Có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.' }
  }
}
