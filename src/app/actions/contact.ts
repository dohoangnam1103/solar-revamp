'use server'

import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

export interface ContactState {
  success?: boolean
  error?: string
}

export async function submitContact(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = formData.get('name') as string
  const phone = formData.get('phone') as string
  const email = (formData.get('email') as string) || undefined
  const message = (formData.get('message') as string) || undefined

  if (!name?.trim() || !phone?.trim()) {
    return { error: 'Vui lòng nhập họ tên và số điện thoại.' }
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
    return { success: true }
  } catch {
    return { error: 'Có lỗi xảy ra. Vui lòng thử lại hoặc gọi hotline.' }
  }
}
