'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Loader2, Plus } from 'lucide-react'
import { createPartner, type PartnerFormState } from '@/app/actions/admin-crud'

const INITIAL_STATE: PartnerFormState = {}

export default function CreatePartnerForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(createPartner, INITIAL_STATE)

  useEffect(() => {
    if (!state.success) return
    formRef.current?.reset()
    router.refresh()
  }, [router, state.success])

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Plus className="h-4 w-4 text-green-700" />
        <h3 className="text-sm font-semibold text-gray-700">Thêm đối tác</h3>
      </div>

      <form ref={formRef} action={formAction} encType="multipart/form-data" className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Tên</label>
          <input name="name" required className="h-9 w-40 rounded-lg border border-gray-300 px-3 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Logo</label>
          <input
            name="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="h-9 w-48 rounded-lg border border-gray-300 px-3 text-sm file:mr-3 file:h-full file:rounded-md file:border-0 file:bg-green-50 file:px-3 file:text-sm file:font-semibold file:text-green-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Loại</label>
          <select name="type" className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm">
            <option value="supplier">Nhà cung cấp</option>
            <option value="installer">Đối tác thi công</option>
            <option value="financial">Tài chính</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Website</label>
          <input name="url" className="h-9 w-40 rounded-lg border border-gray-300 px-3 text-sm" />
        </div>
        <label className="flex h-9 items-center gap-1.5 text-xs text-gray-600">
          <input type="checkbox" name="active" defaultChecked className="accent-green-600" /> Active
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Thêm
        </button>
      </form>

      {state.error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2 text-xs text-green-700">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          {state.success}
        </div>
      )}
    </div>
  )
}
