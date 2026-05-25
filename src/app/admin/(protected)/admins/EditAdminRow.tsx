'use client'

import { useActionState, useState } from 'react'
import { updateAdminUser, type AdminFormState } from '@/app/actions/admin-users'
import { Save, Loader2, AlertCircle, CheckCircle, Pencil, X } from 'lucide-react'

const INITIAL: AdminFormState = {}

type Props = {
  admin: { id: number; email: string; isSuper: boolean }
  canEditEmail: boolean
  canEditPassword: boolean
}

export default function EditAdminRow({ admin, canEditEmail, canEditPassword }: Props) {
  const action = updateAdminUser.bind(null, admin.id)
  const [state, formAction, pending] = useActionState(action, INITIAL)
  const [open, setOpen] = useState(false)

  if (!canEditEmail && !canEditPassword) return null

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-1.5 text-gray-400 hover:text-green-700 transition-colors"
        title="Sửa"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    )
  }

  return (
    <div className="absolute right-0 top-full z-20 mt-1 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Sửa #{admin.id}</h4>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <form action={formAction} className="space-y-3">
        {canEditEmail ? (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={admin.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            Email cố định: <span className="font-medium text-gray-700">{admin.email}</span>
          </div>
        )}
        {canEditPassword && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Mật khẩu mới (để trống nếu không đổi)</label>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Lưu
        </button>
        {state.error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            {state.success}
          </div>
        )}
      </form>
    </div>
  )
}
