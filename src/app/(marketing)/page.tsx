import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata, faqSchema } from '@/lib/seo/metadata'
import PageMotionController from '@/components/marketing/PageMotionController'
import ProjectCarousel from '@/components/marketing/ProjectCarousel'
import SolarSystemExperience from '@/components/marketing/SolarSystemExperience'
import QuoteCalculator from '@/components/quote/QuoteCalculator'
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

const FAQS = [
  {
    question: 'Chi phí lắp điện mặt trời gia đình là bao nhiêu?',
    answer:
      'Chi phí phụ thuộc vào công suất hệ thống. Với hệ thống hòa lưới, giá dao động từ 47 triệu (5kWp) đến 143 triệu (25kWp). Hệ thống hybrid có pin lưu trữ từ 51 triệu (5kWp). Bạn có thể dùng công cụ tính báo giá trên trang để ước tính chi phí phù hợp.',
  },
  {
    question: 'Thời gian hoàn vốn khi lắp điện mặt trời là bao lâu?',
    answer:
      'Thông thường từ 5-8 năm tùy theo mức tiêu thụ điện và tỷ lệ dùng điện ban ngày. Với hóa đơn điện 2-3 triệu/tháng và dùng điện nhiều ban ngày, thời gian hoàn vốn thường khoảng 5-6 năm. Hệ thống có tuổi thọ 25-30 năm.',
  },
  {
    question: 'SOLIQ ENERGY có bảo hành không?',
    answer:
      'Có. Tấm pin mặt trời được bảo hành hiệu suất 25 năm, bảo hành sản phẩm 10-12 năm. Biến tần (inverter) bảo hành 5-10 năm tùy hãng. SOLIQ bảo hành thi công 2 năm và hỗ trợ bảo trì định kỳ.',
  },
  {
    question: 'Có thể lắp điện mặt trời trả góp không?',
    answer:
      'Có. SOLIQ hỗ trợ trả góp 12, 24, 36 và 60 tháng với lãi suất cạnh tranh. Bạn có thể xem các gói trả góp cụ thể trong kết quả báo giá sau khi điền thông tin.',
  },
  {
    question: 'Mái nhà cần điều kiện gì để lắp điện mặt trời?',
    answer:
      'Mái cần đủ diện tích (tối thiểu 10-15m² cho hệ 3-5kWp), hướng Nam hoặc Đông-Tây, không bị che khuất nhiều. Kết cấu mái cần đủ chắc chắn. SOLIQ sẽ khảo sát miễn phí để đánh giá phù hợp.',
  },
  {
    question: 'Quy trình lắp đặt mất bao lâu?',
    answer:
      'Sau khi ký hợp đồng, thời gian thi công thường 1-3 ngày cho hệ gia đình, 3-7 ngày cho hệ doanh nghiệp. Bao gồm lắp khung, tấm pin, biến tần, đấu nối điện và kiểm tra vận hành.',
  },
]

const SOLIQ_MAP_URL =
  'https://www.google.com/maps/place/125+P.+Ho%C3%A0ng+Ng%C3%A2n,+Thanh+Xu%C3%A2n,+H%C3%A0+N%E1%BB%99i,+Vietnam/@21.0075669,105.8064545,16.1z/data=!4m5!3m4!1s0x3135ac9c248e336b:0xcd4ee9cfca9e2e05!8m2!3d21.0071503!4d105.8119902?entry=ttu&g_ep=EgoyMDI2MDUyMC4wIKXMDSoASAFQAw%3D%3D'

const SOLIQ_MAP_IMAGE =
  'https://maps.google.com/maps/api/staticmap?center=21.0071503,105.8119902&zoom=16&size=900x520&language=vi&markers=color:green%7Clabel:S%7C21.0071503,105.8119902&key=AIzaSyBoYjeRtfVI0Jd8Q_9mnflo9i4sOYpShB0'

const PROJECT_IMAGES = Array.from({ length: 14 }, (_, index) => ({
  src: `/projects/soliq/project-${String(index + 1).padStart(2, '0')}.jpg`,
  alt: `Công trình điện mặt trời SOLIQ đã lắp đặt ${index + 1}`,
}))

export default function HomePage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema(FAQS)).replace(/</g, '\\u003c'),
        }}
      />
      <PageMotionController />

      {/* ── INTERACTIVE SYSTEM PREVIEW ───────────────────────────────────── */}
      <SolarSystemExperience />

      {/* ── QUICK QUOTE ──────────────────────────────────────────────────── */}
      <section data-reveal className="relative -mt-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="motion-surface relative isolate grid gap-y-8 overflow-hidden rounded-[2rem] border border-emerald-100/80 bg-[radial-gradient(circle_at_18%_18%,rgba(255,184,75,0.24),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(14,165,233,0.18),transparent_34%),linear-gradient(135deg,#f9fffb_0%,#ecfff7_42%,#e8f7ff_100%)] p-5 shadow-2xl backdrop-blur sm:gap-y-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-x-8 lg:gap-y-0 lg:p-8">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(rgba(37,93,43,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(37,93,43,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
            <div className="pointer-events-none absolute -left-20 top-12 z-0 h-80 w-80 rounded-full bg-orange-300/25 blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-52 bg-[radial-gradient(ellipse_at_18%_100%,rgba(251,146,60,0.24),transparent_38%),radial-gradient(ellipse_at_72%_100%,rgba(16,185,129,0.22),transparent_42%),linear-gradient(180deg,transparent,rgba(14,165,233,0.12))]" />
            <div className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-[25rem] w-[48rem] translate-x-[-9rem] translate-y-[3rem] lg:block">
              <Image
                src="/hero/hybrid-system-3d-transparent-grid-clean.png"
                alt=""
                fill
                sizes="760px"
                className="object-contain object-bottom opacity-40 [mask-image:linear-gradient(90deg,black_0%,black_58%,transparent_100%)]"
              />
            </div>
            <div className="relative z-10 flex flex-col justify-center">
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
            </div>
            <div className="relative z-10 lg:max-w-xl lg:justify-self-end">
              <QuoteCalculator />
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
            <ProjectCarousel images={PROJECT_IMAGES} />
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <h3 className="font-bold text-gray-900">Cửa hàng SOLIQ</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">
                      125 Hoàng Ngân, P.Thanh Xuân, TP Hà Nội
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                </div>
                <div className="relative h-[22rem] bg-green-50">
                  <img
                    src={SOLIQ_MAP_IMAGE}
                    alt="Bản đồ Google Maps tại 125 Hoàng Ngân, Thanh Xuân, Hà Nội"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
                    <div className="rounded-full bg-white/95 p-2 shadow-[0_14px_35px_rgba(15,23,42,0.28)]">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-700 text-white shadow-[inset_0_-6px_14px_rgba(0,0,0,0.18)]">
                        <MapPin className="h-10 w-10" />
                      </div>
                    </div>
                    <div className="mt-2 rounded-xl bg-white/95 px-3 py-1 text-xs font-bold text-green-800 shadow-lg">
                      Cửa hàng SOLIQ
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center mb-12">
            <h2 data-text-motion className="motion-title motion-title-soft text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Câu hỏi thường gặp
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                data-reveal
                className="motion-card group glass rounded-xl border border-white/60 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-800 hover:text-green-700 transition-colors list-none">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-gray-900 group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                  <p className="pt-4">{faq.answer}</p>
                </div>
              </details>
            ))}
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
