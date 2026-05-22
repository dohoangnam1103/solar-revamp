'use client'

import { useActionState } from 'react'
import { adminLogin, type AdminLoginState } from '@/app/actions/admin'
import { Lock, Loader2, AlertCircle } from 'lucide-react'

const INITIAL: AdminLoginState = {}

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, INITIAL)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SOLIQ Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Đăng nhập để quản lý</p>
        </div>
        <form action={formAction} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
            <input id="password" name="password" type="password" required autoFocus
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
              placeholder="Nhập mật khẩu admin" />
          </div>
          {state.error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />{state.error}
            </div>
          )}
          <button type="submit" disabled={pending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
            {pending ? <><Loader2 className="w-4 h-4 animate-spin" />Đang đăng nhập...</> : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}
