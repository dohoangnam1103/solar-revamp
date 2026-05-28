import type { Metadata } from 'next'
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

      <iframe
        src={CHECK_IFRAME_URL}
        title="Solar Check"
        className="block h-[calc(100vh-4rem)] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </>
  )
}
