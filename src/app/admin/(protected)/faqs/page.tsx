import { getFaqs, deleteFaq } from '@/app/actions/admin-crud'
import { Pencil, Trash2, Star, CheckCircle, XCircle } from 'lucide-react'
import CreateFaqForm from './CreateFaqForm'

export default async function AdminFaqsPage() {
  const allFaqs = await getFaqs()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Câu hỏi thường gặp ({allFaqs.length})</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý FAQ hiển thị trên trang chủ và trang /cau-hoi-thuong-gap
          </p>
        </div>
        <CreateFaqForm />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['ID', 'Câu hỏi', 'Câu trả lời', 'Thứ tự', 'Nổi bật', 'Xuất bản', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allFaqs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    Chưa có câu hỏi nào. Bấm &quot;Thêm câu hỏi&quot; để tạo mới.
                  </td>
                </tr>
              ) : (
                allFaqs.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">#{f.id}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium max-w-[280px]">
                      <div className="line-clamp-2">{f.question}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[360px]">
                      <div className="line-clamp-2">{f.answer}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{f.sortOrder}</td>
                    <td className="px-4 py-3">
                      {f.featured ? (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <Star className="w-4 h-4 text-gray-200" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {f.published ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/admin/faqs/${f.id}`}
                          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                          title="Sửa"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </a>
                        <form
                          action={async () => {
                            'use server'
                            await deleteFaq(f.id)
                          }}
                        >
                          <button
                            type="submit"
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                            title="Xoá"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
