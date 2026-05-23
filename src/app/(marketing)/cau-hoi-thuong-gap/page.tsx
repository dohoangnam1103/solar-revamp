import type { Metadata } from 'next'
import { buildPageMetadata, faqSchema } from '@/lib/seo/metadata'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import AnimatedFAQItem from '@/components/marketing/AnimatedFAQItem'

export const metadata: Metadata = buildPageMetadata({
  title: 'Câu Hỏi Thường Gặp Về Điện Mặt Trời - SOLIQ ENERGY',
  description: 'Giải đáp các câu hỏi thường gặp về lắp đặt điện mặt trời: chi phí, hoàn vốn, bảo hành, quy trình, kỹ thuật và hình thức thanh toán.',
  alternates: { canonical: '/cau-hoi-thuong-gap' },
})

const FAQS = [
  { q: 'Chi phí lắp điện mặt trời gia đình là bao nhiêu?', a: 'Chi phí từ 47 triệu (5kWp) đến 143 triệu (25kWp) cho hệ hòa lưới. Hệ hybrid có pin lưu trữ từ 51 triệu. Dùng công cụ tính báo giá trên trang để ước tính chính xác hơn.' },
  { q: 'Thời gian hoàn vốn khi lắp điện mặt trời là bao lâu?', a: 'Thường 5-8 năm tùy mức tiêu thụ và tỷ lệ dùng điện ban ngày. Hóa đơn 2-3 triệu/tháng, dùng điện nhiều ban ngày thì hoàn vốn khoảng 5-6 năm. Hệ thống dùng được 25-30 năm.' },
  { q: 'SOLIQ ENERGY có bảo hành không?', a: 'Có. Tấm pin bảo hành hiệu suất 25 năm, sản phẩm 10-12 năm. Biến tần bảo hành 5-10 năm tùy hãng. SOLIQ bảo hành thi công 2 năm và hỗ trợ bảo trì định kỳ.' },
  { q: 'Có thể lắp điện mặt trời trả góp không?', a: 'Có. SOLIQ hỗ trợ trả góp 12, 24, 36 và 60 tháng với lãi suất cạnh tranh. Xem các gói trả góp cụ thể trong kết quả báo giá sau khi điền thông tin.' },
  { q: 'Mái nhà cần điều kiện gì để lắp điện mặt trời?', a: 'Mái cần đủ diện tích (tối thiểu 10-15m² cho 3-5kWp), hướng Nam hoặc Đông-Tây, không bị che khuất nhiều. Kết cấu mái cần đủ chắc chắn. SOLIQ khảo sát miễn phí để đánh giá.' },
  { q: 'Quy trình lắp đặt mất bao lâu?', a: 'Sau ký hợp đồng, thi công 1-3 ngày cho hệ gia đình, 3-7 ngày cho doanh nghiệp. Bao gồm lắp khung, tấm pin, biến tần, đấu nối điện và kiểm tra vận hành.' },
  { q: 'Điện mặt trời có hoạt động khi trời mưa/흐리 không?', a: 'Có, nhưng hiệu suất giảm 20-50% so với ngày nắng. Hệ thống vẫn sản xuất điện từ ánh sáng khuếch tán. Tính toán sản lượng đã tính trung bình cả ngày mưa và nắng theo vùng.' },
  { q: 'Có cần xin phép khi lắp điện mặt trời không?', a: 'Hệ thống dưới 100kWp thường không cần xin phép xây dựng. Tuy nhiên cần đăng ký với EVN để hòa lưới và bán điện dư (nếu muốn). SOLIQ hỗ trợ toàn bộ thủ tục.' },
  { q: 'Điện mặt trời có bán lại cho EVN được không?', a: 'Có, theo chính sách net-metering. Điện dư được bán lại lưới điện quốc gia theo giá quy định. Tuy nhiên hiện tại chính sách đang được cập nhật, liên hệ SOLIQ để biết thông tin mới nhất.' },
  { q: 'Hệ thống hybrid khác gì hệ thống hòa lưới thông thường?', a: 'Hệ hòa lưới chỉ kết nối với lưới điện, không có pin lưu trữ, mất điện lưới thì hệ thống dừng. Hệ hybrid có thêm pin lưu trữ, dùng điện được cả khi mất điện lưới và tối ưu giờ cao điểm.' },
  { q: 'Tấm pin mặt trời có cần bảo trì không?', a: 'Chỉ cần vệ sinh tấm pin 1-2 lần/năm để loại bỏ bụi bẩn. Không cần bảo trì phức tạp. SOLIQ cung cấp dịch vụ vệ sinh và kiểm tra định kỳ theo hợp đồng bảo trì.' },
  { q: 'Lắp điện mặt trời có ảnh hưởng đến mái nhà không?', a: 'Nếu thi công đúng kỹ thuật thì không ảnh hưởng. SOLIQ dùng khung nhôm chuyên dụng, bu lông chống rỉ, và xử lý chống thấm tại các điểm khoan. Bảo hành chống thấm 2 năm.' },
]

export default function FAQPage() {
  const jsonLd = faqSchema(FAQS.map(f => ({ question: f.q, answer: f.a })))
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">Câu hỏi thường gặp</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">Giải đáp mọi thắc mắc về điện mặt trời</p>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <AnimatedFAQItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
          <div className="mt-12 text-center glass rounded-2xl p-8 border border-white/50">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Còn câu hỏi khác?</h2>
            <p className="text-gray-500 mb-6">Liên hệ trực tiếp để được tư vấn chi tiết</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:0902211893" className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl transition-colors">
                Gọi: 090.22.11.893
              </a>
              <Link href="/bao-gia-dien-mat-troi" className="flex items-center gap-2 px-6 py-3 border border-green-700 text-green-700 hover:bg-green-50 font-semibold rounded-xl transition-colors">
                Tính báo giá <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
