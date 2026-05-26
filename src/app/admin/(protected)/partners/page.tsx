import { getPartners } from '@/app/actions/admin-crud'
import { requireSuperAdminPage } from '@/lib/auth/admin-route'
import CreatePartnerForm from './CreatePartnerForm'
import PartnerList from './PartnerList'

export default async function AdminPartnersPage() {
  await requireSuperAdminPage()
  const allPartners = await getPartners()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đối tác ({allPartners.length})</h1>
      </div>

      <CreatePartnerForm />

      <PartnerList partners={allPartners} />
    </div>
  )
}
