import { getProject, updateProject } from '@/app/actions/admin-crud'
import { notFound } from 'next/navigation'
import SlugTitleFields from '../../SlugTitleFields'

type Props = { params: Promise<{ id: string }> }

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const project = await getProject(parseInt(id))
  if (!project) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sửa dự án</h1>
      <form action={updateProject.bind(null, project.id)} className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <SlugTitleFields defaultTitle={project.title} fallbackSlug="du-an" />
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
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ảnh bìa upload</label>
          <input
            name="coverImageUpload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700"
          />
        </div>
        {project.coverImage && (
          <div>
            <p className="mb-2 text-xs text-gray-500">Ảnh bìa hiện tại</p>
            <img src={project.coverImage} alt="" className="h-32 w-56 rounded-lg border border-gray-200 object-cover" />
          </div>
        )}
        <div><label className="block text-xs text-gray-500 mb-1">Nội dung</label>
          <textarea name="content" defaultValue={project.content || ''} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
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
