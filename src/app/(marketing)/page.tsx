import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata, faqSchema } from '@/lib/seo/metadata'
import PageMotionController from '@/components/marketing/PageMotionController'
import ProjectCarousel from '@/components/marketing/ProjectCarousel'
import PartnerLogoCarousel from '@/components/marketing/PartnerLogoCarousel'
import SolarSystemExperience from '@/components/marketing/SolarSystemExperience'
import AnimatedFAQItem from '@/components/marketing/AnimatedFAQItem'
import QuoteBackgroundVideo from '@/components/marketing/QuoteBackgroundVideo'
import QuoteCalculator from '@/components/quote/QuoteCalculator'
import { getSolarAssumptions } from '@/lib/quote/settings'
import { getCachedCarouselImages, getCachedPartners } from '@/lib/db/public-queries'
import { getFeaturedFaqs } from '@/app/actions/admin-crud'
import {
  Shield, TrendingUp, Phone, CheckCircle,
  ArrowRight, Home, Building2, Factory, Battery,
  Award, Users, Wrench, MapPin
} from 'lucide-react'

export const metadata: Metadata = buildPageMetadata({
  title: 'SOLIQ ENERGY - Lắp Điện Mặt Trời Chuyên Nghiệp tại Hà Nội',
  description:
    'SOLIQ ENERGY - Đơn vị lắp đặt điện mặt trời uy tín tại Hà Nội. ' +
    'Tính báo giá miễn phí, thi công chuyên nghiệp, bảo hành dài hạn. ' +
    'Hệ thống hòa lưới, hybrid, lưu trữ cho gia đình và doanh nghiệp.',
  alternates: { canonical: '/' },
})

export const revalidate = 300

const SOLIQ_MAP_URL =
  'https://www.google.com/maps/place/125+P.+Ho%C3%A0ng+Ng%C3%A2n,+Thanh+Xu%C3%A2n,+H%C3%A0+N%E1%BB%99i,+Vietnam/@21.0075669,105.8064545,16.1z/data=!4m5!3m4!1s0x3135ac9c248e336b:0xcd4ee9cfca9e2e05!8m2!3d21.0071503!4d105.8119902?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D'

const SOLIQ_MAP_IMAGE =
  'https://maps.google.com/maps/api/staticmap?center=21.0071503,105.8119902&zoom=16&size=900x520&language=vi&markers=color:green%7Clabel:S%7C21.0071503,105.8119902&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0'

const STATIC_PROJECT_IMAGES = Array.from({ length: 14 }, (_, index) => ({
  src: `/projects/soliq/project-${String(index + 1).padStart(2, '0')}.webp`,
  alt: `Công trình điện mặt trời SOLIQ đã lắp đặt ${index + 1}`,
}))

export default async function HomePage() {
  const [quoteAssumptions, featuredFaqs, partners, carouselImages] = await Promise.all([
    getSolarAssumptions(),
    getFeaturedFaqs(),
    getCachedPartners().catch(() => []),
    getCachedCarouselImages().catch(() => []),
  ])
  const activePartners = partners.filter((partner) => partner.active)
  const projectImages = carouselImages.length > 0 ? carouselImages : STATIC_PROJECT_IMAGES

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqSchema(featuredFaqs.map((f) => ({ question: f.question, answer: f.answer })))
          ).replace(/</g, '\\u003c'),
        }}
      />
      <PageMotionController />

      {/* ── INTERACTIVE SYSTEM PREVIEW ───────────────────────────────────── */}
      <SolarSystemExperience />

      {/* ── QUICK QUOTE ──────────────────────────────────────────────────── */}
      <section data-reveal className="relative mt-8 pb-20 sm:mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="motion-surface relative isolate grid gap-y-8 overflow-hidden rounded-[2rem] border border-emerald-100/80 bg-emerald-50 p-5 shadow-2xl backdrop-blur sm:gap-y-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-x-8 lg:gap-y-0 lg:p-8">
            <QuoteBackgroundVideo />
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[60px] bg-[linear-gradient(180deg,#ecfdf5_0%,#ecfdf5_28%,rgba(236,253,245,0.78)_58%,transparent_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[60px] bg-[linear-gradient(0deg,#ecfdf5_0%,#ecfdf5_28%,rgba(236,253,245,0.78)_58%,transparent_100%)]" />
            <div className="relative z-10 flex flex-col self-start rounded-3xl bg-white/55 p-5 backdrop-blur-sm lg:pt-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-green-700">
                Ước tính đầu tư
              </p>
              <h2 data-text-motion className="motion-title motion-title-soft mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Biến mức tiêu thụ điện thành cấu hình hệ thống phù hợp.
              </h2>
              <p className="mt-4 max-w-xl text-gray-600 leading-relaxed">
                Chọn hóa đơn, tỷ lệ dùng điện ban ngày và nhu cầu lưu trữ để nhận
                đề xuất công suất, chi phí và thời gian hoàn vốn ban đầu.
              </p>
              <div className="mt-7 grid max-w-xl gap-3 text-base font-extrabold leading-snug text-slate-900 sm:text-lg">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-600/15 bg-white/55 px-4 py-3 shadow-sm backdrop-blur">
                  <CheckCircle className="h-6 w-6 shrink-0 text-emerald-700" />
                  <span>Lắp đặt trọn gói từ khảo sát đến vận hành</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-600/15 bg-white/55 px-4 py-3 shadow-sm backdrop-blur">
                  <CheckCircle className="h-6 w-6 shrink-0 text-emerald-700" />
                  <span>
                    Vay ngân hàng tới <span className="text-orange-600">500tr</span>, không thế chấp
                  </span>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[58%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.48)_46%,rgba(255,255,255,0.16)_72%,transparent_100%)] lg:block" />
            <div className="relative z-10 lg:max-w-xl lg:justify-self-end">
              <QuoteCalculator assumptions={quoteAssumptions} />
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTALLED PROJECTS ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fffe_0%,#effdf8_48%,#f3fbff_100%)] py-20">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(37,93,43,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,93,43,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-cyan-300/18 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-reveal className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-green-700">
              Công trình thực tế
            </p>
            <h2 data-text-motion className="motion-title motion-title-soft mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Những hệ thống điện mặt trời đã được SOLIQ lắp đặt.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-relaxed">
              Hình ảnh thi công thực tế từ các công trình dân dụng và thương mại,
              được trình bày trong carousel tự động để dễ xem nhanh.
            </p>
          </div>

          <div data-reveal className="[--reveal-delay:120ms]">
            <ProjectCarousel images={projectImages} />
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-12">
            <h2 data-text-motion className="motion-title motion-title-soft text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Giải pháp điện mặt trời toàn diện
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Từ hộ gia đình đến nhà máy, SOLIQ cung cấp giải pháp phù hợp với từng nhu cầu
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Home,
                title: 'Gia đình',
                desc: 'Hệ thống 3-15kWp, tiết kiệm 50-100% hóa đơn điện',
                href: '/lap-dat-dien-mat-troi-gia-dinh',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: Building2,
                title: 'Doanh nghiệp',
                desc: 'Hệ thống 15-100kWp, tối ưu chi phí vận hành',
                href: '/dien-mat-troi-doanh-nghiep',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Battery,
                title: 'Hybrid lưu trữ',
                desc: 'Kết hợp pin lưu trữ, dùng điện cả khi mất điện lưới',
                href: '/he-thong-hybrid-luu-tru',
                color: 'text-cyan-600',
                bg: 'bg-cyan-50',
              },
              {
                icon: Factory,
                title: 'Thuê hệ thống',
                desc: 'Không cần đầu tư ban đầu, trả phí theo tháng',
                href: '/thue-he-thong-dien-mat-troi',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-reveal
                className="motion-card group glass rounded-2xl p-6 border border-white/60"
              >
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`motion-icon w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{item.desc}</p>
                <span className={`text-sm font-medium ${item.color} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                  Tìm hiểu thêm <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-reveal>
              <h2 data-text-motion className="motion-title motion-title-soft text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Tại sao chọn{' '}
                <span className="text-green-700">SOLIQ ENERGY?</span>
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: Award,
                    title: 'Kinh nghiệm thực chiến',
                    desc: 'Hơn 500 công trình đã thi công, từ hộ gia đình đến nhà máy sản xuất',
                  },
                  {
                    icon: Shield,
                    title: 'Bảo hành toàn diện',
                    desc: 'Pin mặt trời bảo hành 25 năm, biến tần 5-10 năm, thi công 2 năm',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Minh bạch chi phí',
                    desc: 'Báo giá chi tiết, không phát sinh, cam kết đúng tiến độ',
                  },
                  {
                    icon: Wrench,
                    title: 'Hỗ trợ sau lắp đặt',
                    desc: 'Đội ngũ kỹ thuật hỗ trợ 24/7, bảo trì định kỳ theo hợp đồng',
                  },
                ].map((item) => (
                  <div key={item.title} data-reveal className="flex gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="motion-icon w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div data-reveal className="relative [--reveal-delay:140ms]">
              <div className="glass overflow-hidden rounded-2xl border border-white/60 shadow-xl">
                <div className="flex items-start justify-between gap-4 bg-white/85 p-5">
                  <div>
                    <h3 className="font-bold text-gray-900">Văn phòng bán hàng</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      125 Hoàng Ngân, P.Thanh Xuân, TP Hà Nội
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
                <div className="relative h-[22rem] bg-green-50">
                  <Image
                    src={SOLIQ_MAP_IMAGE}
                    alt="Bản đồ Google Maps tại 125 Hoàng Ngân, Thanh Xuân, Hà Nội"
                    width={900}
                    height={520}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
                    <div className="rounded-full bg-white/95 p-2 shadow-[0_14px_35px_rgba(15,23,42,0.28)]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-700 text-white shadow-[inset_0_-6px_14px_rgba(0,0,0,0.18)]">
                        <MapPin className="h-10 w-10" />
                      </div>
                    </div>
                    <div className="mt-2 rounded-xl bg-white/95 px-3 py-1 text-xs font-bold text-green-800 shadow-lg">
                      Văn phòng bán hàng
                    </div>
                  </div>
                  <a
                    href={SOLIQ_MAP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-shine absolute bottom-10 left-5 z-20 inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-green-800"
                  >
                    <MapPin className="h-4 w-4" />
                    Mở Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-12">
            <h2 data-text-motion className="motion-title motion-title-soft text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Quy trình lắp đặt đơn giản
            </h2>
            <p className="text-gray-500">Từ tư vấn đến vận hành chỉ trong vài ngày</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Phone, title: 'Tư vấn miễn phí', desc: 'Gọi hotline hoặc điền form, chuyên viên liên hệ trong 5 phút' },
              { step: '02', icon: Users, title: 'Khảo sát thực địa', desc: 'Kỹ sư đến khảo sát mái nhà, thiết kế hệ thống phù hợp' },
              { step: '03', icon: Wrench, title: 'Thi công chuyên nghiệp', desc: 'Đội ngũ lắp đặt 1-3 ngày, đảm bảo an toàn và thẩm mỹ' },
              { step: '04', icon: CheckCircle, title: 'Bàn giao & vận hành', desc: 'Kiểm tra hệ thống, hướng dẫn sử dụng, bảo hành đầy đủ' },
            ].map((item, i) => (
              <div key={item.step} data-reveal className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%+1.5rem-4rem)] h-0.5 bg-gradient-to-r from-green-300 to-transparent z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="motion-icon-box w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    Bước {item.step}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fffe_0%,#effdf8_55%,#f3fbff_100%)] py-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(37,93,43,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(37,93,43,0.045)_1px,transparent_1px)] bg-[size:46px_46px]" />
        <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-orange-300/18 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-300/16 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-reveal className="mx-auto mb-9 max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-green-700">
              Hệ sinh thái đối tác
            </p>
            <h2 data-text-motion className="motion-title motion-title-soft mt-3 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Đối tác đồng hành cùng SOLIQ.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600 leading-relaxed">
              Nhà cung cấp thiết bị, đội thi công và đối tác tài chính cùng tham gia
              để hoàn thiện giải pháp điện mặt trời từ khảo sát đến vận hành.
            </p>
          </div>

          <div data-reveal className="[--reveal-delay:120ms]">
            <PartnerLogoCarousel partners={activePartners} />
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-12">
            <h2 data-text-motion className="motion-title motion-title-soft text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Câu hỏi thường gặp
            </h2>
          </div>
          <div className="space-y-4">
            {featuredFaqs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-8 text-center text-gray-500">
                Chưa có câu hỏi nổi bật. Quản lý FAQ trong /admin/faqs.
              </div>
            ) : (
              featuredFaqs.map((faq) => (
                <div key={faq.id} data-reveal>
                  <AnimatedFAQItem question={faq.question} answer={faq.answer} />
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/cau-hoi-thuong-gap"
              className="inline-flex items-center gap-2 text-green-700 font-medium hover:text-green-800 transition-colors"
            >
              Xem tất cả câu hỏi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ────────────────────────────────────────────────────── */}
      <section data-reveal className="py-16 bg-solar-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 data-text-motion className="motion-title text-3xl sm:text-4xl font-bold text-white mb-4">
            Sẵn sàng tiết kiệm điện?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Liên hệ ngay để được tư vấn miễn phí và nhận báo giá chính xác
          </p>
          <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-4 sm:max-w-none sm:flex-row sm:flex-wrap">
            <a
              href="tel:0902211893"
              className="cta-shine flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-orange-600 sm:w-auto"
            >
              <Phone className="w-5 h-5" />
              090.22.11.893
            </a>
            <Link
              href="/bao-gia-dien-mat-troi"
              className="motion-glass-button flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/20 sm:w-auto"
            >
              Tính báo giá online
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
