'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
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

function SaveStatusButton({ isDirty }: { isDirty: boolean }) {
  const { pending } = useFormStatus()
  const isActive = isDirty && !pending

  return (
    <button
      type="submit"
      title="Lưu trạng thái"
      aria-label="Lưu trạng thái"
      disabled={!isActive}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
        isActive
          ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100 hover:text-green-800'
          : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300'
      }`}
    >
      <Save className="h-5 w-5" />
    </button>
  )
}

export default function StatusUpdateForm({
  action,
  initialStatus,
  options,
  statusColors,
}: StatusUpdateFormProps) {
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const isDirty = selectedStatus !== initialStatus

  return (
    <form className="flex items-center gap-2" action={action}>
      <select
        name="status"
        value={selectedStatus}
        onChange={(event) => setSelectedStatus(event.target.value)}
        className={`cursor-pointer rounded-lg border px-2 py-1 text-xs font-medium ${statusColors[selectedStatus] || statusColors.new}`}
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <SaveStatusButton isDirty={isDirty} />
    </form>
  )
}
