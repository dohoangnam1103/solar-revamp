import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { ArrowRight, Calendar } from 'lucide-react'
import { getCachedPublishedArticles } from '@/lib/db/public-queries'

export const revalidate = 300

export const metadata: Metadata = buildPageMetadata({
  title: 'Tin Tức & Blog Điện Mặt Trời - SOLIQ ENERGY',
  description: 'Cập nhật tin tức, kiến thức về điện mặt trời, chính sách năng lượng tái tạo, hướng dẫn lắp đặt và bảo trì hệ thống solar.',
  alternates: { canonical: '/tin-tuc' },
})

const FALLBACK_ARTICLES = [
  { slug: 'chi-phi-lap-dien-mat-troi-2026', title: 'Chi phí lắp điện mặt trời năm 2026: Bảng giá chi tiết', description: 'Tổng hợp chi phí lắp đặt điện mặt trời mới nhất năm 2026.', category: 'Kiến thức', publishedAt: new Date('2026-05-15') },
  { slug: 'thoi-gian-hoan-von-dien-mat-troi', title: 'Thời gian hoàn vốn điện mặt trời: Tính như thế nào?', description: 'Hướng dẫn cách tính thời gian hoàn vốn khi lắp điện mặt trời.', category: 'Tài chính', publishedAt: new Date('2026-05-10') },
  { slug: 'he-thong-hybrid-la-gi', title: 'Hệ thống điện mặt trời Hybrid là gì?', description: 'Giải thích chi tiết về hệ thống hybrid, so sánh với hòa lưới.', category: 'Kiến thức', publishedAt: new Date('2026-05-05') },
  { slug: 'chinh-sach-dien-mat-troi-2026', title: 'Chính sách điện mặt trời mái nhà 2026', description: 'Tổng hợp các chính sách hỗ trợ điện mặt trời của Chính phủ.', category: 'Chính sách', publishedAt: new Date('2026-04-28') },
  { slug: 'bao-tri-dien-mat-troi', title: 'Hướng dẫn bảo trì hệ thống điện mặt trời', description: 'Các bước bảo trì định kỳ để hệ thống hoạt động hiệu quả.', category: 'Kỹ thuật', publishedAt: new Date('2026-04-20') },
  { slug: 'tam-pin-mono-vs-poly', title: 'Tấm pin Mono vs Poly: Nên chọn loại nào?', description: 'So sánh chi tiết tấm pin monocrystalline và polycrystalline.', category: 'Kiến thức', publishedAt: new Date('2026-04-15') },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Kiến thức': 'bg-blue-100 text-blue-700',
  'Tài chính': 'bg-green-100 text-green-700',
  'Chính sách': 'bg-orange-100 text-orange-700',
  'Kỹ thuật': 'bg-purple-100 text-purple-700',
}

function toDisplayDate(value: Date | string | null) {
  return new Date(value || Date.now()).toLocaleDateString('vi-VN')
}

export default async function TinTucPage() {
  const articles = await getCachedPublishedArticles().catch(() => [])

  const displayArticles = articles.length > 0 ? articles.map(a => ({
    slug: a.slug,
    title: a.title,
    description: a.description || '',
    category: a.category || 'tin-tuc',
    publishedAt: a.publishedAt || a.createdAt,
  })) : FALLBACK_ARTICLES

  return (
    <>
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Tin tức & Blog</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">Kiến thức, tin tức và cập nhật mới nhất về điện mặt trời</p>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => (
              <Link key={article.slug} href={`/tin-tuc/${article.slug}`} className="group glass rounded-2xl overflow-hidden border border-white/50 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="h-36 bg-gradient-to-br from-green-700 to-cyan-600 flex items-center justify-center p-6">
                  <p className="text-white font-bold text-center text-sm leading-snug">{article.title}</p>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-600'}`}>
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />{toDisplayDate(article.publishedAt)}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors line-clamp-2">{article.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">{article.description}</p>
                  <span className="text-sm font-medium text-green-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Đọc thêm <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
