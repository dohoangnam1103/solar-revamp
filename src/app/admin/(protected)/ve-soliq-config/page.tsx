import { getVeSoliqConfig } from '@/lib/ve-soliq-config'
import VeSoliqConfigForm from './VeSoliqConfigForm'

export default async function VeSoliqConfigPage() {
  const config = await getVeSoliqConfig()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cấu hình trang &ldquo;Về SOLIQ&rdquo;</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý nội dung hiển thị trên trang <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">/ve-soliq</code>.
        </p>
      </div>
      <VeSoliqConfigForm config={config} />
    </div>
  )
}
