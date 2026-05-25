'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCarouselImage, reorderCarouselImages } from '@/app/actions/admin-crud'
import { GripVertical, Trash2 } from 'lucide-react'

type CarouselImage = {
  id: number
  alt: string
  sortOrder: number
  url: string
  originalName: string | null
  mimeType: string
  sizeBytes: number
  storagePath: string
}

type Props = {
  images: CarouselImage[]
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}

function moveItem(items: CarouselImage[], fromId: number, toId: number) {
  const fromIndex = items.findIndex((item) => item.id === fromId)
  const toIndex = items.findIndex((item) => item.id === toId)
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return items

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export default function CarouselImageList({ images }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(images)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setItems(images)
  }, [images])

  const orderedIds = useMemo(() => items.map((item) => item.id), [items])

  const persistOrder = (nextItems: CarouselImage[]) => {
    startTransition(async () => {
      await reorderCarouselImages(nextItems.map((item) => item.id))
      router.refresh()
    })
  }

  const handleDrop = (targetId: number) => {
    if (!draggedId) return

    const nextItems = moveItem(items, draggedId, targetId)
    setItems(nextItems)
    setDraggedId(null)
    setDropTargetId(null)

    if (nextItems.map((item) => item.id).join(',') !== orderedIds.join(',')) {
      persistOrder(nextItems)
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-8 text-center text-sm text-gray-400">
        Chưa có ảnh carousel upload
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-200">
        {items.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={(event) => {
              setDraggedId(image.id)
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', String(image.id))
            }}
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              setDropTargetId(image.id)
            }}
            onDragLeave={() => setDropTargetId((current) => (current === image.id ? null : current))}
            onDrop={(event) => {
              event.preventDefault()
              handleDrop(image.id)
            }}
            onDragEnd={() => {
              setDraggedId(null)
              setDropTargetId(null)
            }}
            className={`grid gap-4 p-4 transition-colors lg:grid-cols-[7rem_9rem_minmax(180px,1fr)_auto] lg:items-center ${
              dropTargetId === image.id ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
            } ${draggedId === image.id ? 'opacity-55' : ''}`}
          >
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="cursor-grab rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 active:cursor-grabbing"
                title="Kéo để đổi thứ tự"
                aria-label="Kéo để đổi thứ tự"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-sm font-semibold text-gray-400">#{index + 1}</span>
            </div>

            <img src={image.url} alt="" className="h-20 w-32 rounded-lg bg-gray-100 object-cover" />

            <div className="text-xs text-gray-500">
              <div className="truncate" title={image.originalName || image.storagePath}>{image.originalName || image.storagePath}</div>
              <div>{image.mimeType} · {formatFileSize(image.sizeBytes)}</div>
              <a href={image.url} target="_blank" className="text-green-700 hover:text-green-600">Mở ảnh</a>
            </div>

            <div className="flex items-center justify-end gap-2">
              <form action={deleteCarouselImage.bind(null, image.id)}>
                <button type="submit" className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Xoá ảnh">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {isPending && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
          Đang lưu thứ tự...
        </div>
      )}
    </div>
  )
}
