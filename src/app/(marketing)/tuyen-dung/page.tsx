import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { buildPageMetadata, breadcrumbSchema } from '@/lib/seo/metadata'
import { getCachedPublishedRecruitmentPosts } from '@/lib/db/public-queries'
import { formatSalaryRange } from '@/lib/quote/calculator'
import { ArrowRight, BriefcaseBusiness, CalendarDays, MapPin } from 'lucide-react'

export const revalidate = 300

export const metadata: Metadata = buildPageMetadata({
  title: 'Tuyển Dụng - SOLIQ ENERGY',
  description: 'Cơ hội nghề nghiệp tại SOLIQ ENERGY trong lĩnh vực điện mặt trời, thi công, kinh doanh và vận hành hệ thống năng lượng tái tạo.',
  alternates: { canonical: '/tuyen-dung' },
})

function formatDate(value: Date | string | null) {
  if (!value) return 'Đang tuyển'
  return new Date(value).toLocaleDateString('vi-VN')
}

export default async function RecruitmentPage() {
  const posts = await getCachedPublishedRecruitmentPosts().catch(() => [])
  const breadcrumb = breadcrumbSchema([
    { name: 'Trang chủ', url: '/' },
    { name: 'Tuyển dụng', url: '/tuyen-dung' },
  ])

  return (
    <>
      {/* biome-ignore lint: JSON-LD structured data, escaped via \u003c */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
      <section className="overflow-hidden bg-solar-hero pt-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl">Tuyển dụng</h1>
          <p className="mx-auto max-w-2xl text-lg text-green-100">
            Gia nhập SOLIQ ENERGY để cùng xây dựng các hệ thống điện mặt trời hiệu quả, bền vững và dễ tiếp cận hơn.
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-6xl px-4 sm:mt-8 sm:px-6 lg:px-8">
          <Image
            src="/recruitment/soliq-team-transparent-completed-cropped.webp"
            alt="Đội ngũ SOLIQ ENERGY"
            width={2400}
            height={1435}
            priority
            sizes="(min-width: 1024px) 1152px, 92vw"
            className="mx-auto h-auto w-full object-contain"
          />
        </div>
      </section>

      <section className="bg-solar-light py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="glass rounded-2xl border border-white/60 p-10 text-center">
              <h2 className="text-2xl font-bold text-gray-900">Chưa có vị trí đang tuyển</h2>
              <p className="mt-3 text-gray-500">SOLIQ sẽ cập nhật cơ hội mới tại đây khi có nhu cầu tuyển dụng.</p>
            </div>
          ) : (
            <div data-stagger className="grid gap-5">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/tuyen-dung/${post.slug}`}
                  className="group glass rounded-2xl border border-white/60 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      {post.logo ? (
                        <img src={post.logo} alt="" className="mt-1 h-14 w-14 shrink-0 rounded-xl bg-white/80 object-contain p-2 shadow-sm" />
                      ) : null}
                      <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-green-700">
                        <span className="rounded-full bg-green-100 px-2 py-0.5">{post.department || 'SOLIQ ENERGY'}</span>
                        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-cyan-700">{post.employmentType || 'full-time'}</span>
                      </div>
                      <h2 className="text-xl font-extrabold text-gray-900 transition-colors group-hover:text-green-700">{post.title}</h2>
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">{post.description || 'Xem mô tả công việc và yêu cầu ứng tuyển.'}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-green-700" />{post.location || 'Hà Nội'}</span>
                        <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-green-700" />Hạn: {formatDate(post.deadline)}</span>
                        {post.salaryRange && <span className="flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4 text-green-700" />{formatSalaryRange(post.salaryRange)}</span>}
                      </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 transition-all group-hover:gap-2">
                      Xem chi tiết <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
