'use client'

import { useActionState } from 'react'
import { submitContact, type ContactState } from '@/app/actions/contact'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const INITIAL: ContactState = {}

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, INITIAL)

  if (state.success) {
    return (
      <div className="glass rounded-2xl p-8 border border-white/50 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Gửi thành công!</h3>
        <p className="text-gray-500">Chuyên viên sẽ liên hệ với bạn trong vòng 5 phút.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="glass rounded-2xl p-6 border border-white/50 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Gửi yêu cầu tư vấn</h2>
      <div>
        <label htmlFor="c-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Họ và tên <span className="text-red-500">*</span>
        </label>
        <input id="c-name" name="name" type="text" required placeholder="Nguyễn Văn A"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="c-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
          Số điện thoại <span className="text-red-500">*</span>
        </label>
        <input id="c-phone" name="phone" type="tel" required placeholder="0912 345 678"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="c-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input id="c-email" name="email" type="email" placeholder="email@example.com"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="c-message" className="block text-sm font-medium text-gray-700 mb-1.5">Nội dung</label>
        <textarea id="c-message" name="message" rows={4} placeholder="Mô tả nhu cầu của bạn..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none" />
      </div>
      {state.error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />{state.error}
        </div>
      )}
      <button type="submit" disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-3 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
        {pending ? <><Loader2 className="w-4 h-4 animate-spin" />Đang gửi...</> : 'Gửi yêu cầu tư vấn'}
      </button>
    </form>
  )
}
