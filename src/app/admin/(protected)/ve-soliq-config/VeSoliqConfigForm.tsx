'use client'

import { useActionState } from 'react'
import { updateVeSoliqConfig } from '@/app/actions/admin-crud'
import type { VeSoliqConfig } from '@/lib/ve-soliq-config'

type FormState = { error?: string; success?: string }

function action(_prev: FormState, formData: FormData): Promise<FormState> {
  return updateVeSoliqConfig(formData)
    .then(() => ({ success: 'Đã cập nhật cấu hình.' }))
    .catch((err) => ({ error: err instanceof Error ? err.message : 'Lỗi không xác định.' }))
}

const FIELD_INPUT_CLASS =
  'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:ring-green-500'

export default function VeSoliqConfigForm({ config }: { config: VeSoliqConfig }) {
  const [state, formAction, pending] = useActionState(action, {})

  // Pad to 4 stats and 4 core values for editing slots, max 8
  const statsForEdit = [...config.stats, ...Array(Math.max(0, 4 - config.stats.length)).fill({ value: '', label: '' })]
    .slice(0, 8)
    .map((stat, index) => ({ ...stat, _slotId: `stat-slot-${index}` }))
  const coreValuesForEdit = [
    ...config.coreValues,
    ...Array(Math.max(0, 4 - config.coreValues.length)).fill({ title: '', desc: '' }),
  ]
    .slice(0, 8)
    .map((value, index) => ({ ...value, _slotId: `core-value-slot-${index}` }))

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{state.success}</div>
      )}

      {/* Hero */}
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-gray-900">Hero (banner đầu trang)</legend>
        <div>
          <label htmlFor="heroEyebrow" className="block text-sm font-medium text-gray-700">Tagline (chữ nhỏ trên cùng)</label>
          <input id="heroEyebrow" name="heroEyebrow" type="text" defaultValue={config.heroEyebrow} className={FIELD_INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700">Tiêu đề chính</label>
          <input id="heroTitle" name="heroTitle" type="text" defaultValue={config.heroTitle} className={FIELD_INPUT_CLASS} required />
        </div>
        <div>
          <label htmlFor="heroDescription" className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea id="heroDescription" name="heroDescription" rows={3} defaultValue={config.heroDescription} className={FIELD_INPUT_CLASS} />
        </div>
      </fieldset>

      {/* Stats */}
      <fieldset className="space-y-4 border-t border-gray-100 pt-6">
        <legend className="text-base font-semibold text-gray-900">Số liệu nổi bật</legend>
        <p className="text-sm text-gray-500">Để trống cả 2 ô để bỏ một số liệu. Tối đa 8 mục, hiển thị 4 mục/dòng trên màn hình lớn.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {statsForEdit.map((stat, index) => (
            <div key={stat._slotId} className="grid grid-cols-2 gap-2 rounded-lg border border-gray-100 p-3">
              <div>
                <label htmlFor={`stat_${index}_value`} className="block text-xs font-medium text-gray-600">Giá trị</label>
                <input id={`stat_${index}_value`} name={`stat_${index}_value`} type="text" defaultValue={stat.value} placeholder="500+" className={FIELD_INPUT_CLASS} />
              </div>
              <div>
                <label htmlFor={`stat_${index}_label`} className="block text-xs font-medium text-gray-600">Mô tả</label>
                <input id={`stat_${index}_label`} name={`stat_${index}_label`} type="text" defaultValue={stat.label} placeholder="Công trình" className={FIELD_INPUT_CLASS} />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Story */}
      <fieldset className="space-y-4 border-t border-gray-100 pt-6">
        <legend className="text-base font-semibold text-gray-900">Câu chuyện</legend>
        <div>
          <label htmlFor="storyTitle" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input id="storyTitle" name="storyTitle" type="text" defaultValue={config.storyTitle} className={FIELD_INPUT_CLASS} />
        </div>
        <div>
          <label htmlFor="storyParagraphs" className="block text-sm font-medium text-gray-700">Các đoạn nội dung</label>
          <textarea
            id="storyParagraphs"
            name="storyParagraphs"
            rows={8}
            defaultValue={config.storyParagraphs.join('\n\n')}
            placeholder="Mỗi đoạn cách nhau bằng 1 dòng trống."
            className={FIELD_INPUT_CLASS}
          />
          <p className="mt-1 text-xs text-gray-400">Phân tách các đoạn bằng 1 dòng trống.</p>
        </div>
      </fieldset>

      {/* Core values */}
      <fieldset className="space-y-4 border-t border-gray-100 pt-6">
        <legend className="text-base font-semibold text-gray-900">Giá trị cốt lõi</legend>
        <div>
          <label htmlFor="coreValuesTitle" className="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input id="coreValuesTitle" name="coreValuesTitle" type="text" defaultValue={config.coreValuesTitle} className={FIELD_INPUT_CLASS} />
        </div>
        <p className="text-sm text-gray-500">Để trống cả 2 ô để bỏ một mục. Tối đa 8 mục.</p>
        <div className="space-y-3">
          {coreValuesForEdit.map((value, index) => (
            <div key={value._slotId} className="grid gap-2 rounded-lg border border-gray-100 p-3 sm:grid-cols-[1fr_2fr]">
              <div>
                <label htmlFor={`coreValue_${index}_title`} className="block text-xs font-medium text-gray-600">Tên giá trị</label>
                <input id={`coreValue_${index}_title`} name={`coreValue_${index}_title`} type="text" defaultValue={value.title} placeholder="Minh bạch" className={FIELD_INPUT_CLASS} />
              </div>
              <div>
                <label htmlFor={`coreValue_${index}_desc`} className="block text-xs font-medium text-gray-600">Mô tả</label>
                <input id={`coreValue_${index}_desc`} name={`coreValue_${index}_desc`} type="text" defaultValue={value.desc} placeholder="Báo giá rõ ràng..." className={FIELD_INPUT_CLASS} />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50"
        >
          {pending ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>
    </form>
  )
}
