'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, Plus, X } from 'lucide-react'
import { createArticle, type ArticleFormState } from '@/app/actions/admin-crud'
import SlugTitleFields from '../SlugTitleFields'
import RichTextEditor from '../RichTextEditor'

const INITIAL_STATE: ArticleFormState = {}

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
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createArticle, INITIAL_STATE)

  useEffect(() => {
    if (!state.success) return
    formRef.current?.reset()
    setOpen(false)
    router.refresh()
  }, [router, state.success])

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
          <form ref={formRef} action={formAction} encType="multipart/form-data" className="space-y-3">
            <SlugTitleFields fallbackSlug="bai-viet" />
            <div><label className="block text-xs text-gray-500 mb-1">Mô tả</label><textarea name="description" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nội dung</label>
              <RichTextEditor name="content" minHeightClassName="min-h-36" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs text-gray-500 mb-1">Danh mục</label><input name="category" defaultValue="tin-tuc" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ảnh bìa upload</label>
                <input
                  name="coverImageUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" name="published" className="accent-green-600" /> Đã xuất bản</label>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Tạo bài viết
            </button>
          </form>
          {state.error && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {state.error}
            </div>
          )}
        </ModalOverlay>
      )}
    </>
  )
}
