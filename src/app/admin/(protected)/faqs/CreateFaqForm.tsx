'use client'

import { useState } from 'react'
import { createFaq } from '@/app/actions/admin-crud'
import { Plus, X } from 'lucide-react'

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </>
  )
}

export default function CreateFaqForm() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" />Thêm câu hỏi
      </button>

      {open && (
        <ModalOverlay onClose={() => setOpen(false)}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Thêm câu hỏi thường gặp</h2>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form action={createFaq} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Câu hỏi</label>
              <input
                name="question"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Câu trả lời</label>
              <textarea
                name="answer"
                rows={5}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Thứ tự (số nhỏ hiện trước)</label>
              <input
                name="sortOrder"
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-5 pt-1">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" name="featured" className="accent-green-600" />
                Hiện trên trang chủ
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" name="published" defaultChecked className="accent-green-600" />
                Đã xuất bản
              </label>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              Tạo câu hỏi
            </button>
          </form>
        </ModalOverlay>
      )}
    </>
  )
}
