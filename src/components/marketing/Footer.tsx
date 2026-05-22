import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img
              src="/brand/logo.png"
              alt="SOLIQ ENERGY"
              className="h-9 w-auto object-contain mb-4"
            />
            <p className="text-sm text-gray-900 leading-relaxed mb-4">
              SMART POWER FROM SUN — Đơn vị lắp đặt điện mặt trời uy tín,
              chuyên nghiệp tại Hà Nội và toàn quốc.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/soliqvn"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors"
                aria-label="Facebook SOLIQ"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://zalo.me/0902211893"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-blue-500 rounded-lg transition-colors"
                aria-label="Zalo SOLIQ"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://m.me/829928056870811"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-blue-700 rounded-lg transition-colors"
                aria-label="Messenger SOLIQ"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Điện mặt trời gia đình', href: '/lap-dat-dien-mat-troi-gia-dinh' },
                { label: 'Điện mặt trời doanh nghiệp', href: '/dien-mat-troi-doanh-nghiep' },
                { label: 'Hệ thống Hybrid lưu trữ', href: '/he-thong-hybrid-luu-tru' },
                { label: 'Thuê hệ thống solar', href: '/thue-he-thong-dien-mat-troi' },
                { label: 'Vật tư điện mặt trời', href: '/vat-tu-dien-mat-troi' },
                { label: 'Báo giá miễn phí', href: '/bao-gia-dien-mat-troi' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-green-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Công ty</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Về SOLIQ ENERGY', href: '/ve-soliq' },
                { label: 'Dự án tiêu biểu', href: '/du-an' },
                { label: 'Tin tức & Blog', href: '/tin-tuc' },
                { label: 'Câu hỏi thường gặp', href: '/cau-hoi-thuong-gap' },
                { label: 'Liên hệ', href: '/lien-he' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-green-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <MapPin className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>125 Hoàng Ngân, P.Thanh Xuân, TP Hà Nội</span>
              </li>
              <li className="flex gap-2.5">
                <Phone className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <a href="tel:0902211893" className="hover:text-green-400 transition-colors block">
                    090.22.11.893
                  </a>
                  <a href="tel:0902262101" className="hover:text-green-400 transition-colors block">
                    0902.262.101
                  </a>
                </div>
              </li>
              <li className="flex gap-2.5">
                <Mail className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:lienhe@soliq.com.vn"
                  className="hover:text-green-400 transition-colors"
                >
                  lienhe@soliq.com.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} SOLIQ ENERGY. Tất cả quyền được bảo lưu.</p>
          <p>Thiết kế bởi SOLIQ ENERGY Team</p>
        </div>
      </div>
    </footer>
  )
}
