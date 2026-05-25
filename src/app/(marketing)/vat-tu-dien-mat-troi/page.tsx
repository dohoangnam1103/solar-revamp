import type { Metadata } from 'next'
import { buildPageMetadata, serviceSchema } from '@/lib/seo/metadata'
import { Sun, Zap, Battery, Phone, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getPricingPackages } from '@/lib/db/pricing'

export const metadata: Metadata = buildPageMetadata({
  title: 'Vật Tư Điện Mặt Trời - Tấm Pin, Biến Tần, Pin Lưu Trữ',
  description: 'Cung cấp vật tư điện mặt trời chính hãng: tấm pin monocrystalline, biến tần on-grid/hybrid, pin lưu trữ LiFePO4. Giá sỉ cho đại lý và nhà thầu.',
  alternates: { canonical: '/vat-tu-dien-mat-troi' },
})

const CATEGORY_META: Record<string, { label: string; icon: typeof Sun; color: string; bg: string }> = {
  'tam-pin':     { label: 'Tấm pin mặt trời',   icon: Sun,     color: 'text-orange-600', bg: 'bg-orange-50' },
  'bien-tan':    { label: 'Biến tần (Inverter)', icon: Zap,     color: 'text-green-600',  bg: 'bg-green-50' },
  'pin-luu-tru': { label: 'Pin lưu trữ',         icon: Battery, color: 'text-cyan-600',   bg: 'bg-cyan-50' },
}

export default async function VatTuPage() {
  const allItems = await getPricingPackages('vat-tu')

  const grouped = (['tam-pin', 'bien-tan', 'pin-luu-tru'] as const).map((catId) => ({
    catId,
    meta: CATEGORY_META[catId],
    items: allItems.filter((item) => item.category === catId),
  })).filter((g) => g.items.length > 0)
  const jsonLd = serviceSchema('Vật tư điện mặt trời', 'Cung cấp tấm pin, biến tần, pin lưu trữ điện mặt trời chính hãng', '/vat-tu-dien-mat-troi')
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
              Vật tư điện mặt trời{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-yellow-300">chính hãng</span>
            </h1>
            <p className="text-green-100 text-lg leading-relaxed mb-8">Tấm pin monocrystalline, biến tần on-grid/hybrid, pin lưu trữ LiFePO4. Nguồn hàng chính hãng, giá sỉ cho đại lý và nhà thầu.</p>
            <a href="tel:0902211893" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
              <Phone className="w-4 h-4" />Hỏi giá sỉ ngay
            </a>
          </div>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {grouped.map((g) => (
            <div key={g.catId}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 ${g.meta.bg} rounded-xl flex items-center justify-center`}>
                  <g.meta.icon className={`w-5 h-5 ${g.meta.color}`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{g.meta.label}</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {g.items.map((item) => (
                  <div key={item.id} className="glass rounded-2xl p-5 border border-white/50">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${g.meta.bg} ${g.meta.color} mb-3 inline-block`}>{item.note}</span>
                    <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.spec}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cần báo giá vật tư?</h2>
          <p className="text-gray-500 mb-8">Liên hệ để nhận bảng giá sỉ và tư vấn lựa chọn thiết bị phù hợp</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:0902211893" className="flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors">
              <Phone className="w-4 h-4" />090.22.11.893
            </a>
            <Link href="/lien-he" className="flex items-center gap-2 px-6 py-3 border border-green-700 text-green-700 hover:bg-green-50 font-semibold rounded-xl transition-colors">
              Gửi yêu cầu báo giá <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
