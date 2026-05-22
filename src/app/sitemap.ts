import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://soliq.com.vn'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/bao-gia-dien-mat-troi', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/lap-dat-dien-mat-troi-gia-dinh', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/dien-mat-troi-doanh-nghiep', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/he-thong-hybrid-luu-tru', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/thue-he-thong-dien-mat-troi', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/vat-tu-dien-mat-troi', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/du-an', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/tin-tuc', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/cau-hoi-thuong-gap', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/ve-soliq', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/lien-he', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/doi-tac-thi-cong', priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))
}
