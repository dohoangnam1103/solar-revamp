import { redirect } from 'next/navigation'
import { Trash2, ShieldCheck } from 'lucide-react'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { listAdmins, deleteAdminUser } from '@/app/actions/admin-users'
import CreateAdminForm from './CreateAdminForm'
import EditAdminRow from './EditAdminRow'

export default async function AdminUsersPage() {
  const current = await getCurrentAdmin()
  if (!current || !current.isSuper) redirect('/admin')

  const rows = await listAdmins()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản trị viên ({rows.length})</h1>
        <span className="text-xs text-gray-500">
          Đăng nhập: <span className="font-medium text-gray-700">{current.email}</span>
        </span>
      </div>

      <CreateAdminForm />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['ID', 'Email', 'Vai trò', 'Tạo lúc', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((a) => {
                const isSelf = a.id === current.id
                const canEditEmail = !a.isSuper
                const canEditPassword = !a.isSuper || isSelf
                const canDelete = !a.isSuper && !isSelf

                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">#{a.id}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{a.email}</td>
                    <td className="px-4 py-3">
                      {a.isSuper ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold">
                          <ShieldCheck className="w-3 h-3" /> Superadmin
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Admin</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {a.createdAt.toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative flex items-center justify-end gap-1">
                        <EditAdminRow
                          admin={{ id: a.id, email: a.email, isSuper: a.isSuper }}
                          canEditEmail={canEditEmail}
                          canEditPassword={canEditPassword}
                        />
                        {canDelete ? (
                          <form
                            action={async () => {
                              'use server'
                              await deleteAdminUser(a.id)
                            }}
                          >
                            <button
                              type="submit"
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                              title="Xoá"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="p-1.5 text-gray-300 cursor-not-allowed"
                            title={a.isSuper ? 'Không thể xoá superadmin' : 'Không thể xoá tài khoản đang đăng nhập'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
