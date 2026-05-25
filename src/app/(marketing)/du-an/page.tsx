import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { MapPin, Zap, ArrowRight, Sun } from 'lucide-react'
import Link from 'next/link'
import { getCachedPublishedProjects } from '@/lib/db/public-queries'

export const revalidate = 300

export const metadata: Metadata = buildPageMetadata({
  title: 'Dự Án Điện Mặt Trời Tiêu Biểu - SOLIQ ENERGY',
  description: 'Các dự án điện mặt trời tiêu biểu của SOLIQ ENERGY: gia đình, doanh nghiệp, nhà xưởng trên toàn quốc.',
  alternates: { canonical: '/du-an' },
})

const FALLBACK_PROJECTS = [
  { title: 'Hệ thống 10kWp - Biệt thự Hà Đông', location: 'Hà Đông, Hà Nội', capacityKwp: 10, customerType: 'residential', slug: 'biet-thu-ha-dong' },
  { title: 'Hệ thống 25kWp - Nhà xưởng Bắc Ninh', location: 'Từ Sơn, Bắc Ninh', capacityKwp: 25, customerType: 'business', slug: 'nha-xuong-bac-ninh' },
  { title: 'Hybrid 8kWp - Nhà phố Cầu Giấy', location: 'Cầu Giấy, Hà Nội', capacityKwp: 8, customerType: 'residential', slug: 'nha-pho-cau-giay' },
  { title: 'Hệ thống 20kWp - Văn phòng Long Biên', location: 'Long Biên, Hà Nội', capacityKwp: 20, customerType: 'business', slug: 'van-phong-long-bien' },
  { title: 'Hệ thống 15kWp - Nhà máy Hưng Yên', location: 'Mỹ Hào, Hưng Yên', capacityKwp: 15, customerType: 'factory', slug: 'nha-may-hung-yen' },
  { title: 'Hybrid 5kWp - Nhà ở Đống Đa', location: 'Đống Đa, Hà Nội', capacityKwp: 5, customerType: 'residential', slug: 'nha-o-dong-da' },
]

const TYPE_LABELS: Record<string, string> = { residential: 'Gia đình', business: 'Doanh nghiệp', factory: 'Nhà máy' }
const TYPE_COLORS: Record<string, string> = {
  residential: 'bg-green-100 text-green-700',
  business: 'bg-blue-100 text-blue-700',
  factory: 'bg-orange-100 text-orange-700',
}

export default async function DuAnPage() {
  const projects = await getCachedPublishedProjects().catch(() => [])

  const displayProjects = projects.length > 0 ? projects : FALLBACK_PROJECTS

  return (
    <>
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Dự án tiêu biểu</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">Hơn 500 công trình điện mặt trời đã hoàn thành trên toàn quốc</p>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayProjects.map((project) => (
              <div key={project.slug || project.title} className="glass rounded-2xl overflow-hidden border border-white/50 hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center">
                  <Sun className="w-16 h-16 text-white/30" />
                </div>
                <div className="p-5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[project.customerType || 'residential']} mb-3 inline-block`}>
                    {TYPE_LABELS[project.customerType || 'residential'] || 'Gia đình'}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-2">{project.title}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                    <MapPin className="w-3.5 h-3.5" />{project.location || '—'}
                  </div>
                  {project.capacityKwp && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                      <Zap className="w-3.5 h-3.5" />{project.capacityKwp} kWp
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-solar-hero">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Dự án của bạn tiếp theo?</h2>
          <p className="text-green-100 mb-8">Liên hệ để được tư vấn và báo giá miễn phí</p>
          <Link href="/bao-gia-dien-mat-troi" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
            Tính báo giá ngay <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  )
}
