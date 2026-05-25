'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deletePartner, reorderPartners } from '@/app/actions/admin-crud'
import { GripVertical, Trash2 } from 'lucide-react'

type Partner = {
  id: number
  name: string
  logo: string | null
  type: string | null
  url: string | null
  sortOrder: number
  active: boolean
}

type Props = {
  partners: Partner[]
}

const TYPE_LABELS: Record<string, string> = {
  supplier: 'Nhà cung cấp',
  installer: 'Đối tác thi công',
  financial: 'Tài chính',
}

function moveItem(items: Partner[], fromId: number, toId: number) {
  const fromIndex = items.findIndex((item) => item.id === fromId)
  const toIndex = items.findIndex((item) => item.id === toId)
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return items

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export default function PartnerList({ partners }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(partners)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [dropTargetId, setDropTargetId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setItems(partners)
  }, [partners])

  const orderedIds = useMemo(() => items.map((item) => item.id), [items])

  const persistOrder = (nextItems: Partner[]) => {
    startTransition(async () => {
      await reorderPartners(nextItems.map((item) => item.id))
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
        Chưa có đối tác
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-200">
        {items.map((p, index) => (
          <div
            key={p.id}
            draggable
            onDragStart={(event) => {
              setDraggedId(p.id)
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', String(p.id))
            }}
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'move'
              setDropTargetId(p.id)
            }}
            onDragLeave={() => setDropTargetId((current) => (current === p.id ? null : current))}
            onDrop={(event) => {
              event.preventDefault()
              handleDrop(p.id)
            }}
            onDragEnd={() => {
              setDraggedId(null)
              setDropTargetId(null)
            }}
            className={`grid gap-4 p-4 transition-colors lg:grid-cols-[7rem_3rem_1fr_9rem_11rem_5rem_auto] lg:items-center ${
              dropTargetId === p.id ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
            } ${draggedId === p.id ? 'opacity-55' : ''}`}
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

            <div className="flex items-center gap-2">
              {p.logo ? (
                <img src={p.logo} alt="" className="h-8 w-8 rounded-lg bg-gray-100 object-contain p-0.5" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gray-100" />
              )}
            </div>

            <div className="text-sm font-medium text-gray-900">{p.name}</div>

            <div className="text-xs text-gray-500">{TYPE_LABELS[p.type || ''] || p.type || '—'}</div>

            <div className="truncate text-xs text-gray-400" title={p.url || ''}>{p.url || '—'}</div>

            <div className="flex items-center gap-2">
              {p.active ? (
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Inactive</span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <form action={deletePartner.bind(null, p.id)}>
                <button type="submit" className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Xoá đối tác">
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
