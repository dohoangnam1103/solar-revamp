import { getSiteConfig } from '@/lib/site-config'
import SiteConfigForm from './SiteConfigForm'

export default async function SiteConfigPage() {
  const config = await getSiteConfig()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình chung</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý thông tin liên hệ hiển thị trên toàn bộ website.
        </p>
      </div>
      <SiteConfigForm config={config} />
    </div>
  )
}
