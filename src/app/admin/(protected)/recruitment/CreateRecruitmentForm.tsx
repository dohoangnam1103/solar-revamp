'use client'

import { useState } from 'react'
import { createRecruitmentPost } from '@/app/actions/admin-crud'
import { Plus, X } from 'lucide-react'
import RecruitmentTitleFields from './RecruitmentFields'

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6" onClick={(event) => event.stopPropagation()}>
          {children}
        </div>
      </div>
    </>
  )
}

export default function CreateRecruitmentForm() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
      >
        <Plus className="h-4 w-4" />Thêm tin tuyển dụng
      </button>

      {open && (
        <ModalOverlay onClose={() => setOpen(false)}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Thêm tin tuyển dụng</h2>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="h-5 w-5" /></button>
          </div>
          <form action={createRecruitmentPost} className="space-y-3">
            <RecruitmentTitleFields />
            <div><label className="mb-1 block text-xs text-gray-500">Mô tả ngắn</label><textarea name="description" rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs text-gray-500">Phòng ban</label><input name="department" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
              <div><label className="mb-1 block text-xs text-gray-500">Địa điểm</label><input name="location" defaultValue="Hà Nội" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-gray-500">Hình thức</label>
                <select name="employmentType" defaultValue="full-time" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div><label className="mb-1 block text-xs text-gray-500">Lương</label><input name="salaryRange" placeholder="Thỏa thuận" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
              <div><label className="mb-1 block text-xs text-gray-500">Hạn ứng tuyển</label><input name="deadline" type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
            </div>
            <div><label className="mb-1 block text-xs text-gray-500">Nội dung</label><textarea name="content" rows={8} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
            <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" name="published" className="accent-green-600" /> Đã xuất bản</label>
            <button type="submit" className="w-full rounded-lg bg-green-700 py-2.5 font-semibold text-white transition-colors hover:bg-green-600">Tạo tin</button>
          </form>
        </ModalOverlay>
      )}
    </>
  )
}
