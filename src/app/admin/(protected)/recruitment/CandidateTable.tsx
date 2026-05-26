'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updateRecruitmentApplicationStatus } from '@/app/actions/admin-crud'
import StatusUpdateForm from '../StatusUpdateForm'

interface Application {
  id: number
  position: string | null
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  status: string
  createdAt: Date | string
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Mới' },
  { value: 'reviewing', label: 'Đang xem' },
  { value: 'contacted', label: 'Đã liên hệ' },
  { value: 'rejected', label: 'Từ chối' },
]

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  reviewing: 'bg-yellow-100 text-yellow-700',
  contacted: 'bg-green-100 text-green-700',
  rejected: 'bg-gray-100 text-gray-500',
}

export default function CandidateTable({ initialApplications }: { initialApplications: Application[] }) {
  const router = useRouter()

  const refresh = useCallback(() => router.refresh(), [router])

  // Auto-refresh when tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [refresh])

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Ứng viên ({initialApplications.length})</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Vị trí', 'Ứng viên', 'SĐT', 'Email', 'Ghi chú', 'Trạng thái', 'Thời gian'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {initialApplications.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Chưa có ứng viên ứng tuyển</td></tr>
              ) : initialApplications.map((application) => (
                <tr key={application.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-400">#{application.id}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-medium text-gray-900">{application.position}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{application.name}</td>
                  <td className="px-4 py-3"><a href={`tel:${application.phone}`} className="text-green-600 hover:underline">{application.phone}</a></td>
                  <td className="px-4 py-3 text-gray-600">{application.email || '—'}</td>
                  <td className="max-w-[260px] px-4 py-3 text-gray-600">
                    <span className="line-clamp-2">{application.message || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusUpdateForm
                      action={async (formData) => {
                        await updateRecruitmentApplicationStatus(application.id, formData.get('status') as string)
                      }}
                      initialStatus={application.status || 'new'}
                      options={STATUS_OPTIONS}
                      statusColors={STATUS_COLORS}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(application.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}