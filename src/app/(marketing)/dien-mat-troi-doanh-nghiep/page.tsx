import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata, serviceSchema } from '@/lib/seo/metadata'
import { Building2, CheckCircle, ArrowRight, TrendingUp, Shield, Zap, Phone } from 'lucide-react'

export const metadata: Metadata = buildPageMetadata({
  title: 'Điện Mặt Trời Doanh Nghiệp - Tối Ưu Chi Phí Vận Hành',
  description: 'Lắp điện mặt trời cho doanh nghiệp, nhà xưởng, văn phòng. Hệ thống 15-100kWp, giảm 40-70% chi phí điện, ROI cao, bảo hành dài hạn.',
  alternates: { canonical: '/dien-mat-troi-doanh-nghiep' },
})

const PACKAGES = [
  { cap: '15 kWp', panels: '26 tấm', inv: '15kW', price: '106.500.000', fit: 'Văn phòng nhỏ, shop' },
  { cap: '18 kWp', panels: '30 tấm', inv: '18kW', price: '119.000.000', fit: 'Văn phòng vừa' },
  { cap: '20 kWp', panels: '34 tấm', inv: '20kW', price: '130.800.000', fit: 'Nhà xưởng nhỏ' },
  { cap: '25 kWp', panels: '38 tấm', inv: '20kW', price: '143.000.000', fit: 'Nhà xưởng vừa' },
  { cap: '10 kWp 3P', panels: '18 tấm', inv: '10kW 3P', price: '132.000.000', fit: 'Hybrid 3 pha' },
  { cap: '15 kWp 3P', panels: '28 tấm', inv: '15kW 3P', price: '156.000.000', fit: 'Hybrid 3 pha' },
  { cap: '20 kWp 3P', panels: '36 tấm', inv: '20kW 3P', price: '197.000.000', fit: 'Hybrid 3 pha lớn' },
]

export default function DoanhNghiepPage() {
  const jsonLd = serviceSchema('Điện mặt trời doanh nghiệp', 'Lắp đặt hệ thống điện mặt trời cho doanh nghiệp, nhà xưởng tại SOLIQ ENERGY', '/dien-mat-troi-doanh-nghiep')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm text-cyan-300 font-medium mb-6 border border-white/20">
              <Building2 className="w-4 h-4" />Điện mặt trời doanh nghiệp
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Điện mặt trời doanh nghiệp —{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-yellow-300">tối ưu chi phí vận hành</span>
            </h1>
            <p className="text-green-100 text-lg leading-relaxed mb-8">Hệ thống 15-100kWp cho văn phòng, nhà xưởng, kho bãi. Giảm 40-70% chi phí điện, hoàn vốn 4-6 năm, ROI 15-20%/năm.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/bao-gia-dien-mat-troi" className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
                Nhận báo giá miễn phí <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="tel:0902211893" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 transition-colors">
                <Phone className="w-4 h-4" />Gọi tư vấn
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Lợi ích cho doanh nghiệp</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, title: 'Giảm 40-70% chi phí điện', desc: 'Tiết kiệm hàng trăm triệu đồng mỗi năm, cải thiện biên lợi nhuận đáng kể.' },
              { icon: Shield, title: 'Hoàn vốn 4-6 năm', desc: 'ROI 15-20%/năm, vượt trội so với nhiều kênh đầu tư truyền thống.' },
              { icon: Zap, title: 'Chủ động nguồn điện', desc: 'Giảm phụ thuộc lưới điện, ổn định sản xuất, tránh rủi ro tăng giá điện.' },
              { icon: CheckCircle, title: 'Hình ảnh xanh', desc: 'Đáp ứng tiêu chí ESG, tăng uy tín với đối tác và khách hàng quốc tế.' },
            ].map((item) => (
              <div key={item.title} className="glass rounded-2xl p-6 border border-white/50">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Gói lắp đặt doanh nghiệp</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-700 text-white">
                  <th className="px-4 py-3 text-left rounded-tl-xl">Công suất</th>
                  <th className="px-4 py-3 text-left">Số tấm pin</th>
                  <th className="px-4 py-3 text-left">Biến tần</th>
                  <th className="px-4 py-3 text-left">Phù hợp</th>
                  <th className="px-4 py-3 text-right rounded-tr-xl">Giá tham khảo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PACKAGES.map((row, i) => (
                  <tr key={row.cap} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-bold text-blue-700">{row.cap}</td>
                    <td className="px-4 py-3 text-gray-600">{row.panels}</td>
                    <td className="px-4 py-3 text-gray-600">{row.inv}</td>
                    <td className="px-4 py-3 text-gray-500">{row.fit}</td>
                    <td className="px-4 py-3 text-right font-semibold">{row.price}đ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-900 mt-3 text-center">* Giá chưa VAT. Liên hệ để nhận báo giá chính xác sau khảo sát.</p>
          <div className="mt-8 text-center">
            <Link href="/bao-gia-dien-mat-troi" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-colors">
              Tính báo giá cho doanh nghiệp <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
