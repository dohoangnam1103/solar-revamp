import { getProjects, deleteProject } from '@/app/actions/admin-crud'
import { Pencil, Trash2 } from 'lucide-react'
import CreateProjectForm from './CreateProjectForm'

export default async function AdminProjectsPage() {
  const allProjects = await getProjects()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dự án ({allProjects.length})</h1>
        <CreateProjectForm />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Tiêu đề', 'Slug', 'Địa điểm', 'Công suất', 'Xuất bản', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allProjects.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Chưa có dự án</td></tr>
              ) : allProjects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">#{p.id}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{p.location || '—'}</td>
                  <td className="px-4 py-3 text-cyan-700">{p.capacityKwp ? `${p.capacityKwp} kWp` : '—'}</td>
                  <td className="px-4 py-3">{p.published ? <span className="text-green-600 text-xs">✅</span> : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/admin/projects/${p.id}`} className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"><Pencil className="w-3.5 h-3.5" /></a>
                      <form action={async () => { 'use server'; await deleteProject(p.id) }}>
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
