'use client'

import { useState } from 'react'
import { createArticle } from '@/app/actions/admin-crud'
import { Plus, X } from 'lucide-react'

function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </>
  )
}

export default function CreateArticleForm() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors">
        <Plus className="w-4 h-4" />Thêm bài viết
      </button>

      {open && (
        <ModalOverlay onClose={() => setOpen(false)}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Thêm bài viết</h2>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-900"><X className="w-5 h-5" /></button>
          </div>
          <form action={createArticle} className="space-y-3">
            <div><label className="block text-xs text-gray-500 mb-1">Slug</label><input name="slug" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Tiêu đề</label><input name="title" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Mô tả</label><textarea name="description" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Nội dung</label><textarea name="content" rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-500 mb-1">Danh mục</label><input name="category" defaultValue="tin-tuc" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Ảnh bìa URL</label><input name="coverImage" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" name="published" className="accent-green-600" /> Đã xuất bản</label>
            <button type="submit" className="w-full py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">Tạo bài viết</button>
          </form>
        </ModalOverlay>
      )}
    </>
  )
}
