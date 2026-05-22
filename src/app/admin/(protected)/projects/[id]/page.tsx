import { getProject, updateProject } from '@/app/actions/admin-crud'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const project = await getProject(parseInt(id))
  if (!project) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sửa dự án</h1>
      <form action={updateProject.bind(null, project.id)} className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tiêu đề</label>
          <input name="title" defaultValue={project.title} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Slug</label>
          <input name="slug" defaultValue={project.slug} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Địa điểm</label>
            <input name="location" defaultValue={project.location || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Công suất (kWp)</label>
            <input name="capacityKwp" type="number" step="0.1" defaultValue={project.capacityKwp ?? ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">Ảnh bìa URL</label>
          <input name="coverImage" defaultValue={project.coverImage || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">Nội dung</label>
          <textarea name="content" defaultValue={project.content || ''} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div><label className="block text-xs text-gray-500 mb-1">Metrics JSON</label>
          <textarea name="metrics" defaultValue={project.metricsJson ? JSON.stringify(project.metricsJson) : ''} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" name="published" defaultChecked={project.published || false} className="accent-green-600" /> Đã xuất bản
        </label>
        <div className="flex gap-3">
          <button type="submit" className="px-6 py-2.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">Lưu</button>
          <a href="/admin/projects" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors">Hủy</a>
        </div>
      </form>
    </div>
  )
}
