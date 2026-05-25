'use client'

import { useMemo, useState } from 'react'
import { slugifyVietnamese } from '@/lib/slug'

type Props = {
  defaultTitle?: string
  fallbackSlug: string
  titleLabel?: string
}

export default function SlugTitleFields({
  defaultTitle = '',
  fallbackSlug,
  titleLabel = 'Tiêu đề',
}: Props) {
  const [title, setTitle] = useState(defaultTitle)
  const previewSlug = useMemo(
    () => slugifyVietnamese(title, fallbackSlug),
    [fallbackSlug, title]
  )

  return (
    <div>
      <label className="mb-1 block text-xs text-gray-500">{titleLabel}</label>
      <input
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
      />
      <div className="mt-2">
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
