import type { Metadata } from 'next'
import { buildPageMetadata, localBusinessSchema } from '@/lib/seo/metadata'
import { Award, Users, Shield, Zap, MapPin, Phone, Mail } from 'lucide-react'

export const metadata: Metadata = buildPageMetadata({
  title: 'Về SOLIQ ENERGY - Đơn Vị Lắp Điện Mặt Trời Uy Tín Hà Nội',
  description: 'SOLIQ ENERGY - đơn vị lắp đặt điện mặt trời uy tín tại Hà Nội. Hơn 500 công trình, 5+ năm kinh nghiệm, bảo hành 25 năm. Smart Power From Sun.',
  alternates: { canonical: '/ve-soliq' },
})

export default function VeSoliqPage() {
  const jsonLd = localBusinessSchema()
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="bg-solar-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-cyan-300 font-semibold mb-3 text-sm uppercase tracking-wider">Smart Power From Sun</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">Về SOLIQ ENERGY</h1>
            <p className="text-green-100 text-lg leading-relaxed">
              SOLIQ ENERGY là đơn vị chuyên lắp đặt hệ thống điện mặt trời uy tín tại Hà Nội và các tỉnh miền Bắc.
              Với sứ mệnh mang năng lượng sạch, thông minh đến mọi gia đình và doanh nghiệp Việt Nam.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-solar-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { value: '500+', label: 'Công trình hoàn thành', icon: Zap },
              { value: '5+', label: 'Năm kinh nghiệm', icon: Award },
              { value: '25 năm', label: 'Bảo hành tấm pin', icon: Shield },
              { value: '100%', label: 'Khách hàng hài lòng', icon: Users },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-6 border border-white/50 text-center">
                <stat.icon className="w-8 h-8 text-green-700 mx-auto mb-3" />
                <p className="text-3xl font-extrabold text-green-700 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Câu chuyện của chúng tôi</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>SOLIQ ENERGY được thành lập với mục tiêu đơn giản: giúp người Việt Nam tiếp cận năng lượng mặt trời một cách dễ dàng, minh bạch và hiệu quả.</p>
                <p>Chúng tôi tin rằng điện mặt trời không chỉ là xu hướng mà là giải pháp thiết thực giúp mỗi gia đình và doanh nghiệp tiết kiệm chi phí, đồng thời góp phần bảo vệ môi trường.</p>
                <p>Với đội ngũ kỹ sư và kỹ thuật viên giàu kinh nghiệm, SOLIQ cam kết mang đến dịch vụ tư vấn trung thực, thi công chuyên nghiệp và hỗ trợ sau bán hàng tận tâm.</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Giá trị cốt lõi</h3>
              {[
                { title: 'Minh bạch', desc: 'Báo giá rõ ràng, không phát sinh chi phí ẩn' },
                { title: 'Chuyên nghiệp', desc: 'Đội ngũ kỹ sư được đào tạo bài bản, thi công đúng tiêu chuẩn' },
                { title: 'Tận tâm', desc: 'Hỗ trợ khách hàng từ tư vấn đến sau lắp đặt' },
                { title: 'Bền vững', desc: 'Cam kết chất lượng dài hạn, bảo hành đầy đủ' },
              ].map((val) => (
                <div key={val.title} className="flex gap-3 glass rounded-xl p-4 border border-white/50">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900">{val.title}: </span>
                    <span className="text-gray-600 text-sm">{val.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Thông tin liên hệ</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: MapPin, label: 'Địa chỉ', value: '125 Hoàng Ngân, P.Thanh Xuân, TP Hà Nội' },
              { icon: Phone, label: 'Hotline', value: '090.22.11.893\n0902.262.101' },
              { icon: Mail, label: 'Email', value: 'lienhe@soliq.com.vn' },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-6 border border-white/50 text-center">
                <item.icon className="w-8 h-8 text-green-700 mx-auto mb-3" />
                <p className="text-xs text-gray-900 uppercase tracking-wider mb-2">{item.label}</p>
                <p className="font-semibold text-gray-800 whitespace-pre-line text-sm">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
