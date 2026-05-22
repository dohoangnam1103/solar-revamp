import { getPartners, createPartner, updatePartner, deletePartner } from '@/app/actions/admin-crud'
import { Plus, Trash2 } from 'lucide-react'

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
          <div><label className="block text-xs text-gray-500 mb-1">Tên</label><input name="name" required className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Logo URL</label><input name="logo" className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Loại</label>
            <select name="type" className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="supplier">Nhà cung cấp</option>
              <option value="installer">Đối tác thi công</option>
              <option value="financial">Tài chính</option>
            </select>
          </div>
          <div><label className="block text-xs text-gray-500 mb-1">Website</label><input name="url" className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-40" /></div>
          <div><label className="block text-xs text-gray-500 mb-1">Thứ tự</label><input name="sortOrder" type="number" defaultValue="0" className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-16" /></div>
          <label className="flex items-center gap-1.5 text-xs text-gray-600"><input type="checkbox" name="active" defaultChecked className="accent-green-600" /> Active</label>
          <button type="submit" className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">Thêm</button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Tên', 'Loại', 'URL', 'Thứ tự', 'Active', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allPartners.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">#{p.id}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    <div className="flex items-center gap-2">
                      {p.logo && <img src={p.logo} alt="" className="w-6 h-6 rounded object-contain bg-gray-100" />}
                      {p.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.type}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.url || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{p.sortOrder}</td>
                  <td className="px-4 py-3">{p.active ? <span className="text-green-600 text-xs">✅</span> : <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <form action={async () => { 'use server'; await deletePartner(p.id) }}>
                      <button type="submit" className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
