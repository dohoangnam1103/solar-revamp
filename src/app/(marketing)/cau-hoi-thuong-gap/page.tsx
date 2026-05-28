import type { Metadata } from 'next'
import { buildPageMetadata, faqSchema } from '@/lib/seo/metadata'
import { getSiteConfig } from '@/lib/site-config'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AnimatedFAQItem from '@/components/marketing/AnimatedFAQItem'
import { getPublishedFaqs } from '@/app/actions/admin-crud'

export const metadata: Metadata = buildPageMetadata({
  title: 'Câu Hỏi Thường Gặp Về Điện Mặt Trời - SOLIQ ENERGY',
  description: 'Giải đáp các câu hỏi thường gặp về lắp đặt điện mặt trời: chi phí, hoàn vốn, bảo hành, quy trình, kỹ thuật và hình thức thanh toán.',
  alternates: { canonical: '/cau-hoi-thuong-gap' },
})

export const revalidate = 300

export default async function FAQPage() {
  const [faqs, siteConfig] = await Promise.all([getPublishedFaqs(), getSiteConfig()])
  const jsonLd = faqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Câu hỏi thường gặp</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">Giải đáp mọi thắc mắc về điện mặt trời</p>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-stagger className="space-y-3">
            {faqs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-10 text-center text-gray-500">
                Chưa có câu hỏi nào được đăng. Liên hệ trực tiếp để được tư vấn.
              </div>
            ) : (
              faqs.map((faq) => (
                <AnimatedFAQItem key={faq.id} question={faq.question} answer={faq.answer} />
              ))
            )}
          </div>
          <div className="mt-12 text-center glass rounded-2xl p-8 border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Còn câu hỏi khác?</h2>
            <p className="text-gray-500 mb-6">Liên hệ trực tiếp để được tư vấn chi tiết</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={`tel:${siteConfig.phone}`} className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors">
                Gọi: {siteConfig.phoneFormatted}
              </a>
              <Link href="/bao-gia-dien-mat-troi" className="flex items-center gap-2 px-6 py-3 border border-green-700 text-green-700 hover:bg-green-50 font-semibold rounded-xl transition-colors">
                Tính báo giá <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
