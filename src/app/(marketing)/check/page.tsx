import type { Metadata } from 'next'
import { buildPageMetadata, breadcrumbSchema } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = buildPageMetadata({
  title: 'Solar Check - Kiểm tra hệ thống điện mặt trời',
  description: 'Công cụ kiểm tra và giám sát hệ thống điện mặt trời từ SOLIQ ENERGY. Theo dõi sản lượng, hiệu suất và tình trạng vận hành theo thời gian thực.',
  alternates: { canonical: '/check' },
})

const CHECK_IFRAME_URL = 'https://solarcheck.best/'

export default function CheckPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Solar Check', url: '/check' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c'),
        }}
      />

      <section className="bg-solar-hero py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">Solar Check</h1>
          <p className="mx-auto max-w-2xl text-lg text-green-100">
            Công cụ kiểm tra & giám sát hệ thống điện mặt trời từ SOLIQ ENERGY.
            Theo dõi sản lượng, hiệu suất và trạng thái vận hành theo thời gian thực.
          </p>
        </div>
      </section>

      <section className="bg-solar-light py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl border border-white/60 bg-white shadow-xl">
            <iframe
              src={CHECK_IFRAME_URL}
              title="Solar Check"
              className="block h-[80vh] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            Nếu nội dung không hiển thị, vui lòng truy cập trực tiếp tại{' '}
            <a
              href={CHECK_IFRAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-green-700 hover:underline"
            >
              solarcheck.best
            </a>
            .
          </p>
        </div>
      </section>
    </>
  )
}
