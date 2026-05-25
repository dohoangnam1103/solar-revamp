import { deleteRecruitmentPost, getRecruitmentApplications, getRecruitmentPosts, updateRecruitmentApplicationStatus } from '@/app/actions/admin-crud'
import { Pencil, Trash2 } from 'lucide-react'
import CreateRecruitmentForm from './CreateRecruitmentForm'
import StatusUpdateForm from '../StatusUpdateForm'

function formatDate(value: Date | string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('vi-VN')
}

export default async function AdminRecruitmentPage() {
  const [posts, applications] = await Promise.all([
    getRecruitmentPosts(),
    getRecruitmentApplications(),
  ])

  const STATUS_OPTIONS = [
    { value: 'new', label: 'Mới' },
    { value: 'reviewing', label: 'Đang xem' },
    { value: 'contacted', label: 'Đã liên hệ' },
    { value: 'rejected', label: 'Từ chối' },
  ]

  const STATUS_COLORS: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    reviewing: 'bg-yellow-100 text-yellow-700',
    contacted: 'bg-green-100 text-green-700',
    rejected: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tuyển dụng ({posts.length})</h1>
        <CreateRecruitmentForm />
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Logo', 'Tiêu đề', 'Phòng ban', 'Địa điểm', 'Hạn', 'Xuất bản', ''].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {posts.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Chưa có tin tuyển dụng</td></tr>
              ) : posts.map((post) => (
                <tr key={post.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-400">#{post.id}</td>
                  <td className="px-4 py-3">
                    {post.logo ? <img src={post.logo} alt="" className="h-9 w-9 rounded-lg bg-gray-100 object-contain p-1" /> : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="max-w-[260px] truncate px-4 py-3 font-medium text-gray-900">{post.title}</td>
                  <td className="px-4 py-3 text-gray-600">{post.department || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{post.location || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDate(post.deadline)}</td>
                  <td className="px-4 py-3">{post.published ? <span className="text-xs font-medium text-green-600">✅</span> : <span className="text-xs text-gray-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/recruitment/${post.id}`} className="p-1.5 text-gray-400 transition-colors hover:text-gray-900"><Pencil className="h-3.5 w-3.5" /></a>
                      <form action={deleteRecruitmentPost.bind(null, post.id)}>
                        <button type="submit" className="p-1.5 text-gray-400 transition-colors hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Ứng viên ({applications.length})</h2>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Vị trí', 'Ứng viên', 'SĐT', 'Email', 'Ghi chú', 'Trạng thái', 'Thời gian'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Chưa có ứng viên ứng tuyển</td></tr>
              ) : applications.map((application) => (
                <tr key={application.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-gray-400">#{application.id}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-medium text-gray-900">{application.position}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{application.name}</td>
                  <td className="px-4 py-3"><a href={`tel:${application.phone}`} className="text-green-600 hover:underline">{application.phone}</a></td>
                  <td className="px-4 py-3 text-gray-600">{application.email || '—'}</td>
                  <td className="max-w-[260px] px-4 py-3 text-gray-600">
                    <span className="line-clamp-2">{application.message || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusUpdateForm
                      action={async (formData) => {
                        'use server'
                        await updateRecruitmentApplicationStatus(application.id, formData.get('status') as string)
                      }}
                      initialStatus={application.status || 'new'}
                      options={STATUS_OPTIONS}
                      statusColors={STATUS_COLORS}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(application.createdAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
