import { getArticle, updateArticle } from '@/app/actions/admin-crud'
import { notFound } from 'next/navigation'
import SlugTitleFields from '../../SlugTitleFields'

type Props = { params: Promise<{ id: string }> }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const article = await getArticle(parseInt(id))
  if (!article) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sửa bài viết</h1>
      <form action={updateArticle.bind(null, article.id)} className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <SlugTitleFields defaultTitle={article.title} fallbackSlug="bai-viet" />
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
          <button type="submit" className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">Lưu</button>
          <a href="/admin/articles" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">Hủy</a>
        </div>
      </form>
    </div>
  )
}
