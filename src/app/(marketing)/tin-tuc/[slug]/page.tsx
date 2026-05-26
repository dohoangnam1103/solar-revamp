import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildPageMetadata, articleSchema, breadcrumbSchema } from '@/lib/seo/metadata'
import { ArrowLeft, Calendar } from 'lucide-react'
import { getCachedArticleBySlug, getCachedPublishedArticles } from '@/lib/db/public-queries'
import FormattedContent from '@/components/content/FormattedContent'

export const revalidate = 300

const FALLBACK_CONTENT: Record<string, { title: string; desc: string; date: string; category: string; content: string }> = {
  'chi-phi-lap-dien-mat-troi-2026': {
    title: 'Chi phí lắp điện mặt trời năm 2026: Bảng giá chi tiết',
    desc: 'Tổng hợp chi phí lắp đặt điện mặt trời mới nhất năm 2026, từ hệ thống gia đình đến doanh nghiệp.',
    date: '2026-05-15', category: 'Kiến thức',
    content: `Chi phí lắp điện mặt trời năm 2026 dao động từ 47 triệu đến hơn 200 triệu tùy công suất và loại hệ thống. Hệ thống hòa lưới (grid-tied) có giá thấp hơn, trong khi hệ thống hybrid với pin lưu trữ có chi phí cao hơn nhưng mang lại nhiều lợi ích hơn.\n\nCác yếu tố ảnh hưởng đến chi phí bao gồm: công suất hệ thống (kWp), loại tấm pin, thương hiệu biến tần, có hay không có pin lưu trữ, và chi phí thi công tùy địa điểm.\n\nVới hóa đơn điện 2-3 triệu/tháng, hệ thống 8-10kWp thường là lựa chọn tối ưu với chi phí 56-78 triệu đồng.`,
  },
  'thoi-gian-hoan-von-dien-mat-troi': {
    title: 'Thời gian hoàn vốn điện mặt trời: Tính như thế nào?',
    desc: 'Hướng dẫn cách tính thời gian hoàn vốn khi lắp điện mặt trời.',
    date: '2026-05-10', category: 'Tài chính',
    content: `Thời gian hoàn vốn = Tổng đầu tư / Tiết kiệm hàng năm. Với hệ thống 10kWp, đầu tư khoảng 78 triệu, tiết kiệm khoảng 12-15 triệu/năm, thời gian hoàn vốn khoảng 5-6 năm.\n\nCác yếu tố tối ưu thời gian hoàn vốn: tỷ lệ dùng điện ban ngày cao (>60%), hóa đơn điện lớn, vị trí nhiều nắng (miền Nam nhanh hơn miền Bắc).`,
  },
}

type Props = { params: Promise<{ slug: string }> }

function toDisplayDate(value: Date | string | null) {
  return new Date(value || Date.now()).toLocaleDateString('vi-VN')
}

export async function generateStaticParams() {
  const articles = await getCachedPublishedArticles().catch(() => [])
  const slugs = new Set([
    ...Object.keys(FALLBACK_CONTENT),
    ...articles.map((article) => article.slug),
  ])

  return Array.from(slugs, (slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let title = '', description = ''
  try {
    const article = await getCachedArticleBySlug(slug)
    if (article) {
      title = article.title; description = article.description || ''
    }
  } catch {}
  if (!title) {
    const fallback = FALLBACK_CONTENT[slug]
    if (fallback) { title = fallback.title; description = fallback.desc }
  }
  if (!title) return buildPageMetadata({ title: 'Bài viết không tồn tại' })
  return buildPageMetadata({ title, description, alternates: { canonical: `/tin-tuc/${slug}` } })
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  let article: { title: string; description?: string; date: string; category: string; content: string; image?: string } | null = null

  try {
    const dbArticle = await getCachedArticleBySlug(slug)
    if (dbArticle) {
      article = {
        title: dbArticle.title,
        description: dbArticle.description || undefined,
        date: toDisplayDate(dbArticle.publishedAt || dbArticle.createdAt),
        category: dbArticle.category || 'Tin tức',
        content: dbArticle.content || '',
        image: dbArticle.coverImage || undefined,
      }
    }
  } catch {}

  if (!article) {
    const fallback = FALLBACK_CONTENT[slug]
    if (fallback) {
      article = { ...fallback, description: fallback.desc }
    }
  }

  if (!article) notFound()

  const jsonLd = articleSchema({
    title: article.title,
    description: article.description || article.content.slice(0, 160),
    url: `/tin-tuc/${slug}`,
    image: article.image,
    publishedAt: article.date,
  })

  const breadcrumb = breadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Tin tức', url: '/tin-tuc' },
    { name: article.title, url: `/tin-tuc/${slug}` },
  ])

  return (
    <div className="bg-solar-light min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/tin-tuc" className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />Quay lại tin tức
        </Link>
        <div className="glass rounded-2xl p-8 border border-white/50">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 mb-4 inline-block">{article.category}</span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-900 mb-8 pb-6 border-b border-gray-100">
            <Calendar className="w-4 h-4" />{article.date} · SOLIQ ENERGY
          </div>
          {article.image && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={article.image}
                alt={article.title}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}
          <FormattedContent content={article.content} className="prose prose-green max-w-none" />
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-4">Cần tư vấn thêm?</p>
            <a href="tel:0902211893" className="inline-flex items-center gap-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors">
              Gọi ngay: 090.22.11.893
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
