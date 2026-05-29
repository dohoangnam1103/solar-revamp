import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { FacebookIcon, MessengerIcon, TiktokIcon, YoutubeIcon, ZaloIcon } from './SocialIcons'
import { getSiteConfig } from '@/lib/site-config'

export default async function Footer() {
  const siteConfig = await getSiteConfig()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            {siteConfig.footerLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={siteConfig.footerLogo}
                alt="SOLIQ ENERGY"
                className="mb-6 h-28 w-auto object-contain"
              />
            ) : (
              <Image
                src="/brand/symbol-10.png"
                alt="SMART POWER FROM SUN"
                width={215}
                height={125}
                className="mb-6 h-28 w-auto object-contain"
              />
            )}
            <div className="mb-4 flex gap-3">
              <a
                href="https://www.facebook.com/soliqvn"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-800 p-2 transition-colors hover:bg-gray-700"
                aria-label="Facebook SOLIQ"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href={`https://zalo.me/${siteConfig.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-800 p-2 transition-colors hover:bg-gray-700"
                aria-label="Zalo SOLIQ"
              >
                <ZaloIcon className="h-5 w-5" />
              </a>
              <a
                href="https://m.me/829928056870811"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-800 p-2 transition-colors hover:bg-gray-700"
                aria-label="Messenger SOLIQ"
              >
                <MessengerIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@soliq.energy?_r=1&_t=ZS-96eFcVZPQjo"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-800 p-2 transition-colors hover:bg-gray-700"
                aria-label="TikTok SOLIQ"
              >
                <TiktokIcon className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-800 p-2 transition-colors hover:bg-gray-700"
                aria-label="YouTube SOLIQ"
              >
                <YoutubeIcon className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              SMART POWER FROM SUN — Đơn vị lắp đặt điện mặt trời uy tín,
              chuyên nghiệp tại Hà Nội và toàn quốc.
            </p>
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
                { label: 'Tin tức', href: '/tin-tuc' },
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
                <a href={`tel:${siteConfig.phone}`} className="hover:text-green-400 transition-colors">
                  {siteConfig.phoneFormatted}
                </a>
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
