import { db } from '@/lib/db'
import { pricingPackages } from '@/lib/db/schema'
import { getSolarAssumptions } from '@/lib/quote/settings'
import { eq, asc } from 'drizzle-orm'
import PricingManager from './PricingManager'

async function getByPage(page: string) {
  return db.select().from(pricingPackages).where(eq(pricingPackages.page, page)).orderBy(asc(pricingPackages.sortOrder))
}

export default async function AdminPricingPage() {
  const [assumptions, giaDinh, doanhNghiep, hybrid, vatTu] = await Promise.all([
    getSolarAssumptions(),
    getByPage('gia-dinh'),
    getByPage('doanh-nghiep'),
    getByPage('hybrid'),
    getByPage('vat-tu'),
  ])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý giá cả</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cập nhật giá ước lượng và bảng giá marketing — thay đổi có hiệu lực ngay lập tức.
        </p>
      </div>
      <PricingManager
        assumptions={assumptions}
        giaDinh={giaDinh}
        doanhNghiep={doanhNghiep}
        hybrid={hybrid}
        vatTu={vatTu}
      />
    </div>
  )
}
