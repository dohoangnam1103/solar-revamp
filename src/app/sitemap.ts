import type { MetadataRoute } from 'next'
import { getCachedPublishedArticles, getCachedPublishedRecruitmentPosts } from '@/lib/db/public-queries'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://soliq.com.vn'

export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    { url: '/tuyen-dung', priority: 0.7, changeFrequency: 'weekly' as const },
    { url: '/cau-hoi-thuong-gap', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/ve-soliq', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/lien-he', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/doi-tac-thi-cong', priority: 0.6, changeFrequency: 'monthly' as const },
  ]

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.url}`,
    lastModified: new Date('2026-05-23'),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  try {
    const publishedArticles = await getCachedPublishedArticles()

    routes.push(
      ...publishedArticles.map((article) => ({
        url: `${SITE_URL}/tin-tuc/${article.slug}`,
        lastModified: new Date(article.updatedAt || article.publishedAt || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    )

    const recruitmentPosts = await getCachedPublishedRecruitmentPosts()

    routes.push(
      ...recruitmentPosts.map((post) => ({
        url: `${SITE_URL}/tuyen-dung/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.publishedAt || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    )
  } catch {
    // During Docker builds the placeholder DATABASE_URL is intentionally offline.
  }

  return routes
}
