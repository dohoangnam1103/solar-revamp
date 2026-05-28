import type { Metadata } from 'next'
import { buildPageMetadata, localBusinessSchema } from '@/lib/seo/metadata'
import { getSiteConfig } from '@/lib/site-config'
import { getVeSoliqConfig } from '@/lib/ve-soliq-config'
import ProjectCarousel from '@/components/marketing/ProjectCarousel'
import AnimatedNumber from '@/components/marketing/AnimatedNumber'
import WordRevealHeading from '@/components/marketing/WordRevealHeading'
import { Award, Mail, MapPin, Phone, Shield, Star, Users, Zap } from 'lucide-react'

export const metadata: Metadata = buildPageMetadata({
  title: 'Về SOLIQ ENERGY - Đơn Vị Lắp Điện Mặt Trời Uy Tín Hà Nội',
  description: 'SOLIQ ENERGY - đơn vị lắp đặt điện mặt trời uy tín tại Hà Nội. Hơn 500 công trình, 5+ năm kinh nghiệm, bảo hành 25 năm. Smart Power From Sun.',
  alternates: { canonical: '/ve-soliq' },
})

const MASTER_PHI_PROJECT_IMAGES = Array.from({ length: 29 }, (_, index) => ({
  src: `/projects/master-phi/master-phi-${String(index + 1).padStart(2, '0')}.webp`,
  alt: `Hình ảnh công trình điện mặt trời SOLIQ ${index + 1}`,
}))

const STAT_ICONS = [Zap, Award, Shield, Users, Star, Star, Star, Star]

export default async function VeSoliqPage() {
  const [siteConfig, veSoliqConfig] = await Promise.all([getSiteConfig(), getVeSoliqConfig()])
  const phoneIntl = `+84${siteConfig.phone.replace(/^0/, '')}`
  const jsonLd = localBusinessSchema(phoneIntl)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section data-reveal className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p data-text-motion className="text-cyan-300 font-semibold mb-3 text-sm uppercase tracking-wider">
              {veSoliqConfig.heroEyebrow}
            </p>
            <WordRevealHeading
              as="h1"
              text={veSoliqConfig.heroTitle}
              className="text-4xl sm:text-5xl font-extrabold text-white mb-6"
            />
            <p data-text-motion className="text-green-100 text-lg leading-relaxed">
              {veSoliqConfig.heroDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-stagger className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {veSoliqConfig.stats.map((stat, index) => {
              const Icon = STAT_ICONS[index] || Star
              return (
                <div key={`${stat.label}-${index}`} className="glass rounded-2xl p-6 border border-white/50 text-center">
                  <Icon className="w-8 h-8 text-green-700 mx-auto mb-3" />
                  <p className="text-3xl font-extrabold text-green-700 mb-1">
                    <AnimatedNumber value={stat.value} />
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <WordRevealHeading
                as="h2"
                text={veSoliqConfig.storyTitle}
                className="text-3xl font-bold text-gray-900 mb-6"
              />
              <div data-stagger className="space-y-4 text-gray-600 leading-relaxed">
                {veSoliqConfig.storyParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 60)}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 data-text-motion className="text-xl font-bold text-gray-900">{veSoliqConfig.coreValuesTitle}</h3>
              <div data-stagger className="space-y-4">
                {veSoliqConfig.coreValues.map((val, index) => (
                  <div key={`${val.title}-${index}`} className="flex gap-3 glass rounded-xl p-4 border border-white/50">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">{val.title}: </span>
                      <span className="text-gray-600 text-sm">{val.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f3fbff_52%,#effdf8_100%)] py-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(37,93,43,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(37,93,43,0.045)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p data-text-motion className="text-sm font-bold uppercase tracking-[0.16em] text-green-700">
              Hình ảnh thực tế
            </p>
            <WordRevealHeading
              as="h2"
              text="Đội ngũ SOLIQ tại hiện trường."
              className="mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl"
            />
            <p data-text-motion className="mx-auto mt-4 max-w-2xl text-gray-600 leading-relaxed">
              Một số hình ảnh thi công, nghiệm thu và vận hành từ nguồn tư liệu mới nhất của SOLIQ.
            </p>
          </div>

          <ProjectCarousel images={MASTER_PHI_PROJECT_IMAGES} />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <WordRevealHeading
            as="h2"
            text="Thông tin liên hệ"
            className="text-3xl font-bold text-gray-900 text-center mb-10"
          />
          <div data-stagger className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: 'Địa chỉ', value: '125 Hoàng Ngân, P.Thanh Xuân, TP Hà Nội' },
              { icon: Phone, label: 'Hotline', value: siteConfig.phoneFormatted },
              { icon: Mail, label: 'Email', value: 'lienhe@soliq.com.vn' },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-6 border border-white/50 text-center">
                <item.icon className="w-8 h-8 text-green-700 mx-auto mb-3" />
                <p className="text-xs text-gray-900 uppercase tracking-wider mb-2">{item.label}</p>
                <p className="font-semibold text-gray-800 whitespace-pre-line text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
