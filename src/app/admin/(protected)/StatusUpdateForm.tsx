'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save } from 'lucide-react'

interface StatusOption {
  value: string
  label: string
}

interface StatusUpdateFormProps {
  action: (formData: FormData) => void | Promise<void>
  initialStatus: string
  options: StatusOption[]
  statusColors: Record<string, string>
}

export default function StatusUpdateForm({
  action,
  initialStatus,
  options,
  statusColors,
}: StatusUpdateFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  // useState only seeds from initialStatus on first mount. We never re-sync
  // from the prop because doing so can clobber the user's just-saved value
  // when the parent server component re-renders before/after revalidation.
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const [savedStatus, setSavedStatus] = useState(initialStatus)
  const isDirty = selectedStatus !== savedStatus
  const isActive = isDirty && !pending

  // We deliberately avoid `<form action={asyncFn}>` because React 19
  // auto-resets the form after the action resolves, which can race with
  // our controlled <select> state and visually flip it back to the first
  // option. A plain onSubmit + useTransition gives us full control.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isActive) return

    const fd = new FormData()
    fd.set('status', selectedStatus)
    const newStatus = selectedStatus

    startTransition(async () => {
      try {
        await action(fd)
        setSavedStatus(newStatus)
        // Refresh sibling rows / counters with the latest DB values.
        router.refresh()
      } catch (err) {
        console.error('Failed to update status', err)
      }
    })
  }

  return (
    <form className="flex items-center gap-2" onSubmit={handleSubmit}>
      <select
        name="status"
        value={selectedStatus}
        onChange={(event) => setSelectedStatus(event.target.value)}
        className={`cursor-pointer rounded-lg border px-2 py-1 text-xs font-medium ${statusColors[selectedStatus] || statusColors.new}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        title="Lưu trạng thái"
        aria-label="Lưu trạng thái"
        disabled={!isActive}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
          pending
            ? 'border-yellow-200 bg-yellow-50 text-yellow-600 animate-pulse'
            : isActive
              ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100 hover:text-green-800'
              : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
        }`}
      >
        <Save className="h-5 w-5" />
      </button>
    </form>
  )
}
