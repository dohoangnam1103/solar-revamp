'use client'

import { Phone, X } from 'lucide-react'
import { useState } from 'react'
import { FacebookIcon, MessengerIcon, ZaloIcon } from './SocialIcons'

const CONTACT_LINKS = [
  {
    label: 'Messenger SOLIQ',
    href: 'https://m.me/829928056870811',
    icon: MessengerIcon,
  },
  {
    label: 'Facebook SOLIQ',
    href: 'https://www.facebook.com/soliqvn',
    icon: FacebookIcon,
  },
  {
    label: 'Zalo SOLIQ',
    href: 'https://zalo.me/0902211893',
    icon: ZaloIcon,
  },
]

export default function FloatingContact() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-200 ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        {CONTACT_LINKS.map((item) => {
          const Icon = item.icon

          return (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-white/70 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5"
            >
              <Icon className="h-7 w-7" />
            </a>
          )
        })}
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Đóng kênh liên hệ' : 'Mở kênh liên hệ'}
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl bg-green-700 text-white shadow-[0_18px_45px_rgba(22,101,52,0.32)] transition-colors hover:bg-green-800"
      >
        {open ? <X className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
      </button>
    </div>
  )
}
