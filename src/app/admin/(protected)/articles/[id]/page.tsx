import { getArticle, updateArticle } from '@/app/actions/admin-crud'
import { notFound, redirect } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const article = await getArticle(parseInt(id))
  if (!article) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sửa bài viết</h1>
      <form action={updateArticle.bind(null, article.id)} className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Slug</label>
          <input name="slug" defaultValue={article.slug} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tiêu đề</label>
          <input name="title" defaultValue={article.title} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
          <textarea name="description" defaultValue={article.description || ''} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nội dung</label>
          <textarea name="content" defaultValue={article.content || ''} rows={12} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
            <input name="category" defaultValue={article.category || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Ảnh bìa URL</label>
            <input name="coverImage" defaultValue={article.coverImage || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="published" defaultChecked={article.published || false} className="accent-green-600" /> Đã xuất bản
        </label>
        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">Lưu</button>
          <a href="/admin/articles" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">Hủy</a>
        </div>
      </form>
    </div>
  )
}
