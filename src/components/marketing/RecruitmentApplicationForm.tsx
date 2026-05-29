'use client'

import { useActionState } from 'react'
import { submitRecruitmentApplication, type ContactState } from '@/app/actions/contact'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const INITIAL: ContactState = {}

type Props = {
  position: string
}

export default function RecruitmentApplicationForm({ position }: Props) {
  const [state, formAction, pending] = useActionState(submitRecruitmentApplication, INITIAL)

  if (state.success) {
    return (
      <div className="rounded-2xl border border-green-100 bg-green-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-green-600" />
        <h2 className="font-bold text-gray-900">Đã nhận thông tin ứng tuyển</h2>
        <p className="mt-2 text-sm text-gray-600">SOLIQ ENERGY sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="mt-8 rounded-2xl border border-white/70 bg-white/75 p-6">
      <input type="hidden" name="position" value={position} />
      <h2 className="mb-4 text-xl font-bold text-gray-900">Ứng tuyển vị trí này</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên</label>
          <input name="name" required className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input name="phone" type="tel" required className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500" />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
        <input name="email" type="email" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500" />
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Ghi chú</label>
        <textarea name="message" rows={4} className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-green-500" />
      </div>
      {state.error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />{state.error}
        </div>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" />Đang gửi...</> : 'Gửi thông tin ứng tuyển'}
      </button>
    </form>
  )
}
