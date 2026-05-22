import { getArticles, deleteArticle } from '@/app/actions/admin-crud'
import { Pencil, Trash2, Plus } from 'lucide-react'
import CreateArticleForm from './CreateArticleForm'

export default async function AdminArticlesPage() {
  const allArticles = await getArticles()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bài viết ({allArticles.length})</h1>
        <CreateArticleForm />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Tiêu đề', 'Slug', 'Danh mục', 'Xuất bản', 'Thời gian', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allArticles.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Chưa có bài viết</td></tr>
              ) : allArticles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">#{a.id}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium max-w-[200px] truncate">{a.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.slug}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{a.category}</span></td>
                  <td className="px-4 py-3">{a.published ? <span className="text-xs text-green-600 font-medium">✅</span> : <span className="text-xs text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(a.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/articles/${a.id}`} className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><Pencil className="w-3.5 h-3.5" /></a>
                      <form action={async () => { 'use server'; await deleteArticle(a.id) }}>
                        <button type="submit" className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
