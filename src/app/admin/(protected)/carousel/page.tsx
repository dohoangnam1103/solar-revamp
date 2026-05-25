import { createCarouselImage, getCarouselImages } from '@/app/actions/admin-crud'
import { ImagePlus } from 'lucide-react'
import CarouselImageList from './CarouselImageList'

export default async function AdminCarouselPage() {
  const images = await getCarouselImages()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Carousel công trình ({images.length})</h1>
        <p className="mt-1 text-sm text-gray-500">Upload ảnh lên VPS và quản lý carousel trang chủ.</p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ImagePlus className="h-4 w-4 text-green-700" />
          <h2 className="text-sm font-semibold text-gray-700">Thêm ảnh carousel</h2>
        </div>
        <form action={createCarouselImage} className="flex flex-wrap items-end gap-3">
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

      <CarouselImageList images={images} />
    </div>
  )
}
