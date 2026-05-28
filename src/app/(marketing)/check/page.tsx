import type { Metadata } from 'next'
import { ExternalLink } from 'lucide-react'
import { buildPageMetadata, breadcrumbSchema } from '@/lib/seo/metadata'

export const revalidate = 300

export const metadata: Metadata = buildPageMetadata({
  title: 'Solar Check - Kiểm tra hệ thống điện mặt trời',
  description: 'Công cụ kiểm tra và giám sát hệ thống điện mặt trời từ SOLIQ ENERGY. Theo dõi sản lượng, hiệu suất và tình trạng vận hành theo thời gian thực.',
  alternates: { canonical: '/check' },
})

const CHECK_IFRAME_URL = 'https://solarcheck.best/?theme=white'

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

      <div className="relative h-[calc(100vh-4rem)] w-full">
        <iframe
          src={CHECK_IFRAME_URL}
          title="Solar Check"
          className="block h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="geolocation; accelerometer; gyroscope; magnetometer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />

        {/* Fallback when iframe is blocked by the target site's CSP */}
        <noscript>
          <div className="absolute inset-0 flex items-center justify-center bg-white p-6">
            <a
              href={CHECK_IFRAME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-white shadow-md transition-colors hover:bg-green-800"
            >
              Mở Solar Check
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </noscript>
      </div>
    </>
  )
}
