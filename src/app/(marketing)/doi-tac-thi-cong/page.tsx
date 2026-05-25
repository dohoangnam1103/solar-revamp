import type { Metadata } from 'next'
import Image from 'next/image'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { Shield, Award, Wrench, Handshake } from 'lucide-react'
import { getCachedPartners } from '@/lib/db/public-queries'

export const revalidate = 300

export const metadata: Metadata = buildPageMetadata({
  title: 'Đối Tác Thi Công & Nhà Cung Cấp - SOLIQ ENERGY',
  description: 'Đối tác thi công, nhà cung cấp thiết bị và đối tác tài chính của SOLIQ ENERGY. Hợp tác vì năng lượng sạch Việt Nam.',
  alternates: { canonical: '/doi-tac-thi-cong' },
})

export default async function DoiTacPage() {
  const partners = await getCachedPartners().catch(() => [])

  const suppliers = partners.filter(p => p.type === 'supplier' && p.active)
  const installers = partners.filter(p => p.type === 'installer' && p.active)
  const financials = partners.filter(p => p.type === 'financial' && p.active)

  return (
    <>
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Đối tác của chúng tôi</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">Hợp tác với các thương hiệu và đối tác uy tín trong ngành năng lượng mặt trời</p>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Suppliers */}
          {(suppliers.length > 0 || partners.length === 0) && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Nhà cung cấp thiết bị</h2>
                  <p className="text-sm text-gray-500">Đối tác cung cấp tấm pin, biến tần và phụ kiện</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(suppliers.length > 0 ? suppliers : [{ id: 1, name: 'Thương hiệu A', logo: null, url: null }, { id: 2, name: 'Thương hiệu B', logo: null, url: null }]).map((p) => (
                  <a key={p.id} href={p.url || '#'} target={p.url ? '_blank' : undefined} rel="noopener noreferrer"
                    className="glass rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all text-center group">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      {p.logo ? <Image src={p.logo} alt={p.name} width={56} height={56} unoptimized className="w-14 h-14 object-contain" /> : <Award className="w-8 h-8 text-green-400" />}
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">{p.name}</h3>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Installers */}
          {(installers.length > 0 || suppliers.length === 0) && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-cyan-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Đối tác thi công</h2>
                  <p className="text-sm text-gray-500">Đơn vị thi công uy tín trên toàn quốc</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(installers.length > 0 ? installers : [{ id: 1, name: 'Đối tác thi công 1', logo: null, url: null }]).map((p) => (
                  <a key={p.id} href={p.url || '#'} target={p.url ? '_blank' : undefined} rel="noopener noreferrer"
                    className="glass rounded-2xl p-5 border border-white/50 hover:shadow-lg transition-all flex items-center gap-4 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Wrench className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">{p.name}</h3>
                      <p className="text-sm text-gray-500">Đối tác thi công</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Financial partners */}
          {financials.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Đối tác tài chính</h2>
                  <p className="text-sm text-gray-500">Hỗ trợ vay vốn và trả góp</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {financials.map((p) => (
                  <a key={p.id} href={p.url || '#'} target="_blank" rel="noopener noreferrer"
                    className="glass rounded-2xl p-5 border border-white/50 hover:shadow-lg transition-all flex items-center gap-4 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-yellow-50 rounded-xl flex items-center justify-center shrink-0">
                      <Handshake className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">{p.name}</h3>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="glass rounded-2xl p-8 border border-white/50 text-center max-w-2xl mx-auto">
            <Shield className="w-12 h-12 text-green-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Trở thành đối tác của SOLIQ ENERGY</h2>
            <p className="text-sm text-gray-500 mb-6">Chúng tôi luôn chào đón các đối tác có năng lực và uy tín</p>
            <a href="/lien-he" className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors">
              Liên hệ hợp tác
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
