import type { Metadata } from 'next'
import { buildPageMetadata, breadcrumbSchema } from '@/lib/seo/metadata'
import { SolarCheckClient } from '@/components/check/SolarCheckClient'

export const revalidate = 300

export const metadata: Metadata = buildPageMetadata({
  title: 'Solar Check - Kiểm tra vị trí lắp tấm pin mặt trời',
  description:
    'Dùng cảm biến điện thoại để mô phỏng vị trí lắp tấm pin mặt trời và ước lượng năng lượng thu được trong năm. Toàn bộ tính toán chạy trên thiết bị, không gửi đi đâu.',
  alternates: { canonical: '/check' },
})

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

      <SolarCheckClient />
    </>
  )
}
