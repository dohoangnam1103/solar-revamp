'use client'

import { useMemo, useState } from 'react'

type Props = {
  defaultTitle?: string
}

function slugifyVietnamese(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function RecruitmentTitleFields({ defaultTitle = '' }: Props) {
  const [title, setTitle] = useState(defaultTitle)
  const previewSlug = useMemo(() => slugifyVietnamese(title) || 'tin-tuyen-dung', [title])

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1 block text-xs text-gray-500">Tiêu đề</label>
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Đường dẫn tự tạo</label>
        <input
          value={previewSlug}
          disabled
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
        />
      </div>
    </div>
  )
}
