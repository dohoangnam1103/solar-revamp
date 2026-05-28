'use client'

import { useActionState } from 'react'
import { updateSiteConfig } from '@/app/actions/admin-crud'
import type { SiteConfig } from '@/lib/site-config'

type FormState = { error?: string; success?: string }

function action(_prev: FormState, formData: FormData): Promise<FormState> {
  return updateSiteConfig(formData)
    .then(() => ({ success: 'Đã cập nhật cấu hình.' }))
    .catch((err) => ({ error: err instanceof Error ? err.message : 'Lỗi không xác định.' }))
}

export default function SiteConfigForm({ config }: { config: SiteConfig }) {
  const [state, formAction, pending] = useActionState(action, {})

  return (
    <form action={formAction} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {state.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state.success && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{state.success}</div>
      )}

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold text-gray-900">Số điện thoại</legend>
        <p className="text-sm text-gray-500">
          Số điện thoại này sẽ hiển thị ở Header, Footer, Hero và dữ liệu SEO.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Số điện thoại (không dấu chấm)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={config.phone}
              placeholder="0902211893"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Dùng cho href tel: link</p>
          </div>

          <div>
            <label htmlFor="phoneFormatted" className="block text-sm font-medium text-gray-700">
              Số điện thoại (hiển thị)
            </label>
            <input
              id="phoneFormatted"
              name="phoneFormatted"
              type="text"
              defaultValue={config.phoneFormatted}
              placeholder="090.22.11.893"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
            <p className="mt-1 text-xs text-gray-400">Dùng để hiển thị trên giao diện</p>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-gray-100 pt-6">
        <legend className="text-base font-semibold text-gray-900">Email nhận thông báo</legend>
        <p className="text-sm text-gray-500">
          Khi có khách gửi báo giá, tư vấn hoặc ứng tuyển, hệ thống sẽ gửi email thông báo đến các địa chỉ này.
          Có thể nhập nhiều email, mỗi email một dòng hoặc cách nhau bằng dấu phẩy.
        </p>

        <div>
          <label htmlFor="notificationEmails" className="block text-sm font-medium text-gray-700">
            Danh sách email
          </label>
          <textarea
            id="notificationEmails"
            name="notificationEmails"
            rows={4}
            defaultValue={config.notificationEmails.join('\n')}
            placeholder="admin@soliq.com.vn&#10;sales@soliq.com.vn"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Tối đa 20 email. Yêu cầu cấu hình SMTP trong biến môi trường (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM).
          </p>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-gray-100 pt-6">
        <legend className="text-base font-semibold text-gray-900">Logo Header & Footer</legend>
        <p className="text-sm text-gray-500">
          Tải lên logo riêng cho Header (trên cùng website) và Footer (cuối website).
          Nếu không tải lên, hệ thống sẽ dùng logo mặc định.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700">Logo Header</span>
            {config.headerLogo ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.headerLogo} alt="Header logo" className="h-12 w-auto object-contain" />
                <label className="mt-2 inline-flex items-center gap-2 text-xs text-red-600">
                  <input type="checkbox" name="removeHeaderLogo" />
                  Xoá logo này (dùng lại logo mặc định)
                </label>
              </div>
            ) : null}
            <input
              name="headerLogoUpload"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100"
            />
            <p className="text-xs text-gray-400">PNG/JPG/WebP/SVG. Khuyến nghị nền trong suốt, cao 64px.</p>
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-gray-700">Logo Footer</span>
            {config.footerLogo ? (
              <div className="rounded-lg border border-gray-200 bg-gray-900 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.footerLogo} alt="Footer logo" className="h-20 w-auto object-contain" />
                <label className="mt-2 inline-flex items-center gap-2 text-xs text-red-300">
                  <input type="checkbox" name="removeFooterLogo" />
                  Xoá logo này (dùng lại logo mặc định)
                </label>
              </div>
            ) : null}
            <input
              name="footerLogoUpload"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-green-700 hover:file:bg-green-100"
            />
            <p className="text-xs text-gray-400">PNG/JPG/WebP/SVG. Footer nền tối, dùng logo trắng/sáng.</p>
          </div>
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
