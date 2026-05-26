'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { updateArticle, type ArticleFormState } from '@/app/actions/admin-crud'
import SlugTitleFields from '../../SlugTitleFields'
import RichTextEditor from '../../RichTextEditor'

const INITIAL_STATE: ArticleFormState = {}

export default function EditArticleForm({ article }: { article: any }) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(
    updateArticle.bind(null, article.id),
    INITIAL_STATE,
  )

  useEffect(() => {
    if (!state.success) return
    router.push('/admin/articles')
  }, [router, state.success])

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sửa bài viết</h1>
      <form action={formAction} encType="multipart/form-data" className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <SlugTitleFields defaultTitle={article.title} fallbackSlug="bai-viet" />
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
          <textarea name="description" defaultValue={article.description || ''} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nội dung</label>
          <RichTextEditor name="content" defaultValue={article.content || ''} minHeightClassName="min-h-72" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
            <input name="category" defaultValue={article.category || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
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
        {article.coverImage && (
          <div>
            <p className="mb-2 text-xs text-gray-500">Ảnh bìa hiện tại</p>
            <img src={article.coverImage} alt="" className="h-32 w-56 rounded-lg border border-gray-200 object-cover" />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="published" defaultChecked={article.published || false} className="accent-green-600" /> Đã xuất bản
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Lưu
          </button>
          <a href="/admin/articles" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">Hủy</a>
        </div>
      </form>
      {state.error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}
    </div>
  )
}
