import { ImagePlus } from 'lucide-react'
import { createVeSoliqGalleryImage, getVeSoliqGalleryImages } from '@/app/actions/admin-crud'
import { getVeSoliqConfig } from '@/lib/ve-soliq-config'
import VeSoliqConfigForm from './VeSoliqConfigForm'
import VeSoliqGalleryList from './VeSoliqGalleryList'

export default async function VeSoliqConfigPage() {
  const [config, gallery] = await Promise.all([
    getVeSoliqConfig(),
    getVeSoliqGalleryImages(),
  ])

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình trang &ldquo;Về SOLIQ&rdquo;</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý nội dung hiển thị trên trang <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">/ve-soliq</code>.
        </p>
      </div>

      <VeSoliqConfigForm config={config} />

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Thư viện ảnh ({gallery.length})</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ảnh hiển thị ở khối &ldquo;Hình ảnh thực tế&rdquo;. Nếu chưa upload ảnh nào, trang sẽ dùng bộ ảnh mặc định có sẵn.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-green-700" />
            <h3 className="text-sm font-semibold text-gray-700">Thêm ảnh thư viện</h3>
          </div>
          <form action={createVeSoliqGalleryImage} className="flex flex-wrap items-end gap-3">
            <div className="w-full max-w-md">
              <label className="mb-1 block text-xs text-gray-500">Ảnh upload</label>
              <input
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700"
              />
            </div>
            <button type="submit" className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600">
              Upload
            </button>
          </form>
        </div>

        <VeSoliqGalleryList images={gallery} />
      </div>
    </div>
  )
}
