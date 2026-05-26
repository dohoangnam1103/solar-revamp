import { getFaq, updateFaq } from '@/app/actions/admin-crud'
import { requireSuperAdminPage } from '@/lib/auth/admin-route'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function EditFaqPage({ params }: Props) {
  await requireSuperAdminPage()
  const { id } = await params
  const faq = await getFaq(parseInt(id))
  if (!faq) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sửa câu hỏi #{faq.id}</h1>
      <form
        action={updateFaq.bind(null, faq.id)}
        className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6"
      >
        <div>
          <label className="block text-xs text-gray-500 mb-1">Câu hỏi</label>
          <input
            name="question"
            defaultValue={faq.question}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Câu trả lời</label>
          <textarea
            name="answer"
            defaultValue={faq.answer}
            rows={6}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Thứ tự (số nhỏ hiện trước)</label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={faq.sortOrder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-5 pt-1">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={faq.featured}
              className="accent-green-600"
            />
            Hiện trên trang chủ
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="published"
              defaultChecked={faq.published}
              className="accent-green-600"
            />
            Đã xuất bản
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            Lưu
          </button>
          <a
            href="/admin/faqs"
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Hủy
          </a>
        </div>
      </form>
    </div>
  )
}
