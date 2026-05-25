'use client'

import { useActionState } from 'react'
import { createAdminUser, type AdminFormState } from '@/app/actions/admin-users'
import { Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

const INITIAL: AdminFormState = {}

export default function CreateAdminForm() {
  const [state, formAction, pending] = useActionState(createAdminUser, INITIAL)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Thêm admin</h3>
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="off"
            placeholder="admin@example.com"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mật khẩu (≥ 6 ký tự)</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-56"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Thêm
        </button>
      </form>
      {state.error && (
        <div className="mt-3 flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mt-3 flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {state.success}
        </div>
      )}
    </div>
  )
}
