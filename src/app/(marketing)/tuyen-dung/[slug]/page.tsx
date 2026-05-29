import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { buildPageMetadata, breadcrumbSchema } from '@/lib/seo/metadata'
import { getCachedPublishedRecruitmentPosts, getCachedRecruitmentPostBySlug } from '@/lib/db/public-queries'
import { formatSalaryRange } from '@/lib/quote/calculator'
import { ArrowLeft, BriefcaseBusiness, CalendarDays, MapPin } from 'lucide-react'
import RecruitmentApplicationForm from '@/components/marketing/RecruitmentApplicationForm'
import FormattedContent from '@/components/content/FormattedContent'

export const revalidate = 300

type Props = { params: Promise<{ slug: string }> }

function formatDate(value: Date | string | null) {
  if (!value) return 'Đang tuyển'
  return new Date(value).toLocaleDateString('vi-VN')
}

export async function generateStaticParams() {
  const posts = await getCachedPublishedRecruitmentPosts().catch(() => [])
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getCachedRecruitmentPostBySlug(slug).catch(() => null)
  if (!post || !post.published) return buildPageMetadata({ title: 'Tin tuyển dụng không tồn tại' })

  return buildPageMetadata({
    title: `${post.title} - Tuyển dụng SOLIQ ENERGY`,
    description: post.description || `Ứng tuyển vị trí ${post.title} tại SOLIQ ENERGY.`,
    alternates: { canonical: `/tuyen-dung/${slug}` },
  })
}

export default async function RecruitmentDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await getCachedRecruitmentPostBySlug(slug).catch(() => null)
  if (!post || !post.published) notFound()

  const breadcrumb = breadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Tuyển dụng', url: '/tuyen-dung' },
    { name: post.title, url: `/tuyen-dung/${slug}` },
  ])

  return (
    <div className="min-h-screen bg-solar-light">
      {/* biome-ignore lint: JSON-LD structured data, escaped via \u003c */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/tuyen-dung" className="mb-8 inline-flex items-center gap-2 text-sm text-green-700 transition-colors hover:text-green-800">
          <ArrowLeft className="h-4 w-4" />Quay lại tuyển dụng
        </Link>

        <article className="glass rounded-2xl border border-white/60 p-8">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            {post.logo ? <img src={post.logo} alt="" className="h-16 w-16 shrink-0 rounded-xl bg-white/80 object-contain p-2 shadow-sm" /> : null}
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">{post.department || 'SOLIQ ENERGY'}</span>
                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-cyan-700">{post.employmentType || 'full-time'}</span>
              </div>
              <h1 className="mb-4 text-3xl font-extrabold text-gray-900">{post.title}</h1>
              <p className="text-gray-600">{post.description || 'Thông tin tuyển dụng tại SOLIQ ENERGY.'}</p>
            </div>
          </div>

          <div className="mb-8 grid gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 text-sm text-gray-700 sm:grid-cols-3">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-green-700" />{post.location || 'Hà Nội'}</span>
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-green-700" />{formatDate(post.deadline)}</span>
            <span className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-green-700" />{formatSalaryRange(post.salaryRange)}</span>
          </div>

          <FormattedContent content={post.content || ''} className="prose prose-green max-w-none" />

          <RecruitmentApplicationForm position={post.title} />
        </article>
      </div>
    </div>
  )
}
