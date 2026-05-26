import Image from 'next/image'
import { Award, Handshake, Wrench } from 'lucide-react'

type PartnerType = 'supplier' | 'installer' | 'financial' | string | null | undefined

type PartnerLogoCarouselItem = {
  id: number | string
  name: string
  logo?: string | null
  type?: PartnerType
  url?: string | null
}

const TYPE_META = {
  supplier: {
    label: 'Nhà cung cấp',
    icon: Award,
    iconClassName: 'text-emerald-600',
    iconBgClassName: 'from-emerald-100 to-cyan-50',
  },
  installer: {
    label: 'Thi công',
    icon: Wrench,
    iconClassName: 'text-cyan-600',
    iconBgClassName: 'from-cyan-100 to-blue-50',
  },
  financial: {
    label: 'Tài chính',
    icon: Handshake,
    iconClassName: 'text-orange-500',
    iconBgClassName: 'from-orange-100 to-yellow-50',
  },
} as const

const FALLBACK_PARTNERS: PartnerLogoCarouselItem[] = [
  { id: 'supplier-1', name: 'Nhà cung cấp thiết bị', type: 'supplier' },
  { id: 'supplier-2', name: 'Thương hiệu inverter', type: 'supplier' },
  { id: 'installer-1', name: 'Đối tác thi công', type: 'installer' },
  { id: 'installer-2', name: 'Đội kỹ thuật vùng', type: 'installer' },
  { id: 'financial-1', name: 'Đối tác ngân hàng', type: 'financial' },
  { id: 'financial-2', name: 'Hỗ trợ trả góp', type: 'financial' },
]

function getPartnerTypeMeta(type: PartnerType) {
  if (type === 'installer' || type === 'financial' || type === 'supplier') {
    return TYPE_META[type]
  }

  return TYPE_META.supplier
}

export default function PartnerLogoCarousel({ partners }: { partners: PartnerLogoCarouselItem[] }) {
  const source = partners.length > 0 ? partners : FALLBACK_PARTNERS
  const visiblePartners = source.length >= 6
    ? source
    : Array.from({ length: Math.ceil(6 / source.length) }, () => source).flat()
  const loopPartners = [...visiblePartners, ...visiblePartners]

  return (
    <div className="partner-marquee group relative overflow-hidden py-2">

      <div className="partner-marquee-track flex w-max gap-4 pr-4 sm:gap-5 sm:pr-5">
        {loopPartners.map((partner, index) => {
          const meta = getPartnerTypeMeta(partner.type)
          const Icon = meta.icon
          const content = partner.logo ? (
            <Image
              src={partner.logo}
              alt={partner.name}
              width={120}
              height={120}
              unoptimized
              className="h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
          ) : (
            <Icon className={`h-16 w-16 ${meta.iconClassName}`} />
          )

          const className =
            'flex h-28 w-[10rem] shrink-0 items-center justify-center sm:w-[12rem]'

          return partner.url ? (
            <a
              key={`${partner.id}-${index}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {content}
            </a>
          ) : (
            <div key={`${partner.id}-${index}`} className={className}>
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
