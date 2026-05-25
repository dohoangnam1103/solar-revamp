import { getPartners, createPartner } from '@/app/actions/admin-crud'
import { Plus } from 'lucide-react'
import PartnerList from './PartnerList'

export default async function AdminPartnersPage() {
  const allPartners = await getPartners()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đối tác ({allPartners.length})</h1>
      </div>

      {/* Add form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Thêm đối tác</h3>
        <form action={createPartner} className="flex flex-wrap items-end gap-3">
          <div><label className="block text-xs text-gray-500 mb-1">Tên</label><input name="name" required className="h-9 px-3 border border-gray-300 rounded-lg text-sm w-40" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Logo</label><input name="logo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="h-9 w-48 rounded-lg border border-gray-300 px-3 text-sm file:mr-3 file:h-full file:rounded-md file:border-0 file:bg-green-50 file:px-3 file:text-sm file:font-semibold file:text-green-700" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Loại</label>
            <select name="type" className="h-9 px-3 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="supplier">Nhà cung cấp</option>
              <option value="installer">Đối tác thi công</option>
              <option value="financial">Tài chính</option>
            </select>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">Website</label><input name="url" className="h-9 px-3 border border-gray-300 rounded-lg text-sm w-40" /></div>
          <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" name="active" defaultChecked className="accent-green-600" /> Active</label>
          <button type="submit" className="h-9 px-4 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">Thêm</button>
        </form>
      </div>

      <PartnerList partners={allPartners} />
    </div>
  )
}
