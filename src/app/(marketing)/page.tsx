import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata, faqSchema, localBusinessSchema } from '@/lib/seo/metadata'
import QuoteCalculator from '@/components/quote/QuoteCalculator'
import {
  Sun, Zap, Shield, TrendingUp, Phone, CheckCircle,
  Star, ArrowRight, Home, Building2, Factory, Battery,
  Clock, Award, Users, Wrench
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

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-solar-hero overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-start lg:items-center">
            {/* Left: copy */}
            <div className="text-white px-4 sm:px-0 py-8 lg:py-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm text-cyan-300 font-medium mb-6 border border-white/20">
                <Sun className="w-4 h-4" />
                Smart Power From Sun
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Lắp điện mặt trời{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-yellow-300">
                  tiết kiệm thật sự
                </span>
              </h1>
              <p className="text-lg text-green-100 leading-relaxed mb-8 max-w-lg">
                SOLIQ ENERGY — đơn vị thi công điện mặt trời uy tín tại Hà Nội.
                Tư vấn miễn phí, báo giá minh bạch, bảo hành dài hạn.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { value: '500+', label: 'Công trình' },
                  { value: '25 năm', label: 'Bảo hành pin' },
                  { value: '5★', label: 'Đánh giá' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-cyan-300">{stat.value}</p>
                    <p className="text-xs text-green-200">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:0902211893"
                  className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                >
                  <Phone className="w-4 h-4" />
                  Gọi ngay tư vấn
                </a>
                <Link
                  href="/du-an"
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors border border-white/30"
                >
                  Xem dự án
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: calculator */}
            <div className="lg:max-w-md w-full mx-auto lg:mx-0 py-4 lg:py-0">
              <QuoteCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* ── SOLUTIONS ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
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
                className="group glass rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1 border border-white/60"
              >
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
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
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
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
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics dashboard preview */}
            <div className="relative">
              <div className="glass rounded-2xl p-6 border border-white/60 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800">Dashboard năng lượng</h3>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Sản lượng hôm nay', value: '18.4 kWh', color: 'text-orange-500', icon: Sun },
                    { label: 'Tiết kiệm tháng này', value: '1.2 triệu', color: 'text-green-600', icon: TrendingUp },
                    { label: 'CO₂ giảm thiểu', value: '8.2 kg', color: 'text-cyan-600', icon: Zap },
                    { label: 'Hiệu suất hệ thống', value: '97.3%', color: 'text-purple-600', icon: CheckCircle },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-gray-50 rounded-xl p-4">
                      <metric.icon className={`w-5 h-5 ${metric.color} mb-2`} />
                      <p className={`text-xl font-bold ${metric.color}`}>{metric.value}</p>
                      <p className="text-xs text-gray-900 mt-0.5">{metric.label}</p>
                    </div>
                  ))}
                </div>
                {/* Fake chart bar */}
                <div>
                  <p className="text-xs text-gray-900 mb-2">Sản lượng 7 ngày qua (kWh)</p>
                  <div className="flex items-end gap-1.5 h-16">
                    {[12, 15, 18, 14, 19, 17, 18].map((val, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-green-600 to-cyan-400 rounded-t-sm opacity-80"
                        style={{ height: `${(val / 20) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-300 mt-1">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
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
              <div key={item.step} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-300 to-transparent z-0" />
                )}
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
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
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Câu hỏi thường gặp
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group glass rounded-xl border border-white/60 overflow-hidden"
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
      <section className="py-16 bg-solar-hero">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Sẵn sàng tiết kiệm điện?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Liên hệ ngay để được tư vấn miễn phí và nhận báo giá chính xác
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:0902211893"
              className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg text-lg"
            >
              <Phone className="w-5 h-5" />
              090.22.11.893
            </a>
            <Link
              href="/bao-gia-dien-mat-troi"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors border border-white/30 text-lg"
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
