import { getRecruitmentPost, updateRecruitmentPost } from '@/app/actions/admin-crud'
import { requireSuperAdminPage } from '@/lib/auth/admin-route'
import { notFound } from 'next/navigation'
import SlugTitleFields from '../../SlugTitleFields'
import RichTextEditor from '../../RichTextEditor'

type Props = { params: Promise<{ id: string }> }

function toDateInputValue(value: Date | string | null) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

export default async function EditRecruitmentPage({ params }: Props) {
  await requireSuperAdminPage()
  const { id } = await params
  const post = await getRecruitmentPost(parseInt(id, 10))
  if (!post) notFound()

  return (
    <div className="max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Sửa tin tuyển dụng</h1>
      <form action={updateRecruitmentPost.bind(null, post.id)} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <SlugTitleFields defaultTitle={post.title} fallbackSlug="tin-tuyen-dung" />
        <div><label className="mb-1 block text-xs text-gray-500">Mô tả ngắn</label><textarea name="description" defaultValue={post.description || ''} rows={2} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="mb-1 block text-xs text-gray-500">Phòng ban</label><input name="department" defaultValue={post.department || ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-xs text-gray-500">Địa điểm</label><input name="location" defaultValue={post.location || ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Hình thức</label>
            <select name="employmentType" defaultValue={post.employmentType || 'full-time'} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div><label className="mb-1 block text-xs text-gray-500">Lương</label><input name="salaryRange" defaultValue={post.salaryRange || ''} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
          <div><label className="mb-1 block text-xs text-gray-500">Hạn ứng tuyển</label><input name="deadline" type="date" defaultValue={toDateInputValue(post.deadline)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" /></div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Nội dung</label>
          <RichTextEditor name="content" defaultValue={post.content || ''} minHeightClassName="min-h-64" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="published" defaultChecked={post.published || false} className="accent-green-600" /> Đã xuất bản
        </label>
        <div className="flex gap-3">
          <button type="submit" className="rounded-lg bg-green-700 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-green-600">Lưu</button>
          <a href="/admin/recruitment" className="rounded-lg bg-gray-100 px-6 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-200">Hủy</a>
        </div>
      </form>
    </div>
  )
}
