'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Phone, ChevronDown } from 'lucide-react'

const navLinks = [
  {
    label: 'Dịch vụ',
    href: '#',
    children: [
      { label: 'Điện mặt trời gia đình', href: '/lap-dat-dien-mat-troi-gia-dinh' },
      { label: 'Điện mặt trời doanh nghiệp', href: '/dien-mat-troi-doanh-nghiep' },
      { label: 'Hệ thống Hybrid lưu trữ', href: '/he-thong-hybrid-luu-tru' },
      { label: 'Thuê hệ thống', href: '/thue-he-thong-dien-mat-troi' },
      { label: 'Vật tư điện mặt trời', href: '/vat-tu-dien-mat-troi' },
    ],
  },
  { label: 'Dự án', href: '/du-an' },
  { label: 'Tin tức', href: '/tin-tuc' },
  { label: 'Đối tác', href: '/doi-tac-thi-cong' },
  { label: 'FAQ', href: '/cau-hoi-thuong-gap' },
  { label: 'Về SOLIQ', href: '/ve-soliq' },
  { label: 'Liên hệ', href: '/lien-he' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/brand/logo-transparent.png"
              alt="SOLIQ ENERGY"
              className="h-9 w-auto object-contain brightness-0"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                    {link.label}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {openDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-56 glass rounded-xl shadow-lg py-1 border border-white/50">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50/80 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href="tel:0902211893"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
            >
              <Phone className="w-4 h-4" />
              090.22.11.893
            </a>
            <Link
              href="/bao-gia-dien-mat-troi"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded-lg transition-colors shadow-sm"
            >
              Báo giá miễn phí
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden glass border-t border-white/30">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {link.label}
                  </p>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-6 py-2 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-2 pb-1 border-t border-gray-100 flex flex-col gap-2">
              <a
                href="tel:0902211893"
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-green-700"
              >
                <Phone className="w-4 h-4" />
                090.22.11.893
              </a>
              <Link
                href="/bao-gia-dien-mat-troi"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-green-700 rounded-lg"
              >
                Báo giá miễn phí
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
