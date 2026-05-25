import { unstable_cache } from 'next/cache'
import { asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { articles, carouselImages, mediaAssets, partners, projects, recruitmentPosts } from '@/lib/db/schema'

const PUBLIC_CONTENT_REVALIDATE_SECONDS = 300

export const getCachedPublishedArticles = unstable_cache(
  async () => {
    return db.select().from(articles).where(eq(articles.published, true)).orderBy(desc(articles.createdAt))
  },
  ['published-articles'],
  { tags: ['articles'], revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS }
)

export const getCachedArticleBySlug = unstable_cache(
  async (slug: string) => {
    const rows = await db.select().from(articles).where(eq(articles.slug, slug))
    return rows[0] || null
  },
  ['article-by-slug'],
  { tags: ['articles'], revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS }
)

export const getCachedPublishedProjects = unstable_cache(
  async () => {
    return db.select().from(projects).where(eq(projects.published, true)).orderBy(desc(projects.createdAt))
  },
  ['published-projects'],
  { tags: ['projects'], revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS }
)

export const getCachedPartners = unstable_cache(
  async () => {
    return db.select().from(partners).orderBy(partners.sortOrder)
  },
  ['partners'],
  { tags: ['partners'], revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS }
)

export const getCachedCarouselImages = unstable_cache(
  async () => {
    return db
      .select({
        id: carouselImages.id,
        src: mediaAssets.url,
        alt: carouselImages.alt,
        sortOrder: carouselImages.sortOrder,
      })
      .from(carouselImages)
      .innerJoin(mediaAssets, eq(carouselImages.mediaAssetId, mediaAssets.id))
      .orderBy(asc(carouselImages.sortOrder), asc(carouselImages.id))
  },
  ['carousel-images'],
  { tags: ['carousel-images'], revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS }
)

export const getCachedPublishedRecruitmentPosts = unstable_cache(
  async () => {
    return db
      .select()
      .from(recruitmentPosts)
      .where(eq(recruitmentPosts.published, true))
      .orderBy(desc(recruitmentPosts.createdAt))
  },
  ['published-recruitment-posts'],
  { tags: ['recruitment-posts'], revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS }
)

export const getCachedRecruitmentPostBySlug = unstable_cache(
  async (slug: string) => {
    const rows = await db
      .select()
      .from(recruitmentPosts)
      .where(eq(recruitmentPosts.slug, slug))
      .limit(1)
    return rows[0] || null
  },
  ['recruitment-post-by-slug'],
  { tags: ['recruitment-posts'], revalidate: PUBLIC_CONTENT_REVALIDATE_SECONDS }
)
