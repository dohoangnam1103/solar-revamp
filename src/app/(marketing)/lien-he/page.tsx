import type { Metadata } from 'next'
import { buildPageMetadata, localBusinessSchema } from '@/lib/seo/metadata'
import { getSiteConfig } from '@/lib/site-config'
import { MapPin, Phone, Mail } from 'lucide-react'
import ContactForm from '@/components/marketing/ContactForm'
import { FacebookIcon, MessengerIcon, ZaloIcon } from '@/components/marketing/SocialIcons'

export const metadata: Metadata = buildPageMetadata({
  title: 'Liên Hệ SOLIQ ENERGY - Tư Vấn Lắp Điện Mặt Trời Miễn Phí',
  description: 'Liên hệ SOLIQ ENERGY để được tư vấn lắp điện mặt trời miễn phí. Hotline: 090.22.11.893. Địa chỉ: 125 Hoàng Ngân, Thanh Xuân, Hà Nội.',
  alternates: { canonical: '/lien-he' },
})

export default async function LienHePage() {
  const siteConfig = await getSiteConfig()
  const phoneIntl = `+84${siteConfig.phone.replace(/^0/, '')}`
  const jsonLd = localBusinessSchema(phoneIntl)
  return (
    <>
      {/* biome-ignore lint: JSON-LD structured data, escaped via \u003c */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">Tư vấn miễn phí, phản hồi trong vòng 5 phút</p>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin liên hệ</h2>
                <div data-stagger className="space-y-4">
                  {[
                    { icon: MapPin, label: 'Địa chỉ', value: '125 Hoàng Ngân, P.Thanh Xuân, TP Hà Nội', href: undefined },
                    { icon: Phone, label: 'Hotline', value: siteConfig.phoneFormatted, href: `tel:${siteConfig.phone}` },
                    { icon: Mail, label: 'Email', value: 'lienhe@soliq.com.vn', href: 'mailto:lienhe@soliq.com.vn' },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-4 glass rounded-xl p-4 border border-white/50">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-green-700" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-900 uppercase tracking-wider mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="font-semibold text-gray-800 hover:text-green-700 transition-colors">{item.value}</a>
                        ) : (
                          <p className="font-semibold text-gray-800">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-4">Kết nối mạng xã hội</h3>
                <div className="flex gap-3">
                  <a href="https://www.facebook.com/soliqvn" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
                    <FacebookIcon className="h-5 w-5" />
                    Facebook
                  </a>
                  <a href={`https://zalo.me/${siteConfig.phone}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors">
                    <ZaloIcon className="h-5 w-5" />Zalo
                  </a>
                  <a href="https://m.me/829928056870811" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
                    <MessengerIcon className="h-5 w-5" />Messenger
                  </a>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-white/50">
                <h3 className="font-bold text-gray-900 mb-3">Giờ làm việc</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Thứ 2 - Thứ 6</span><span className="font-medium">08:00 - 17:30</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Thứ 7</span><span className="font-medium">08:00 - 12:00</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Chủ nhật</span><span className="text-gray-900">Nghỉ</span></div>
                </div>
              </div>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
