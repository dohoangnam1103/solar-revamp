import { deleteRecruitmentPost, getRecruitmentApplications, getRecruitmentPosts } from '@/app/actions/admin-crud'
import { requireSuperAdminPage } from '@/lib/auth/admin-route'
import { Pencil, Trash2 } from 'lucide-react'
import CreateRecruitmentForm from './CreateRecruitmentForm'
import CandidateTable from './CandidateTable'
import RefreshButton from '../RefreshButton'

function formatDate(value: Date | string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('vi-VN')
}

export default async function AdminRecruitmentPage() {
  await requireSuperAdminPage()
  const [posts, applications] = await Promise.all([
    getRecruitmentPosts(),
    getRecruitmentApplications(),
  ])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tuyển dụng ({posts.length})</h1>
        <div className="flex items-center gap-2">
          <RefreshButton />
          <CreateRecruitmentForm />
        </div>
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

      <CandidateTable initialApplications={applications} />
    </div>
  )
}
