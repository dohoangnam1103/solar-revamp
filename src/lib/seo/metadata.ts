import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://soliq.com.vn'
const SITE_NAME = 'SOLIQ ENERGY'
const LOGO_URL = '/brand/logo.png'
const OG_IMAGE = '/brand/og-image.png'

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Lắp Điện Mặt Trời Chuyên Nghiệp`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'SOLIQ ENERGY - Đơn vị lắp đặt điện mặt trời uy tín tại Hà Nội. ' +
    'Báo giá miễn phí, thi công chuyên nghiệp, bảo hành dài hạn. ' +
    'Hệ thống hòa lưới, hybrid, lưu trữ cho gia đình và doanh nghiệp.',
  keywords: [
    'lắp điện mặt trời',
    'điện mặt trời gia đình',
    'điện mặt trời doanh nghiệp',
    'lắp điện mặt trời trả góp',
    'chi phí lắp điện mặt trời',
    'hệ thống điện mặt trời hybrid',
    'bộ lưu điện năng lượng mặt trời',
    'điện mặt trời mái nhà',
    'SOLIQ ENERGY',
    'solar Hà Nội',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Smart Power From Sun`,
    description:
      'Lắp đặt điện mặt trời chuyên nghiệp tại Hà Nội. Báo giá miễn phí, thi công uy tín.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - Điện Mặt Trời`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Smart Power From Sun`,
    description: 'Lắp đặt điện mặt trời chuyên nghiệp tại Hà Nội.',
    images: [OG_IMAGE],
  },
  icons: {
    icon: OG_IMAGE,
    shortcut: OG_IMAGE,
    apple: OG_IMAGE,
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export function buildPageMetadata(overrides: Partial<Metadata>): Metadata {
  return {
    ...defaultMetadata,
    ...overrides,
  }
}

// ─── JSON-LD schemas ──────────────────────────────────────────────────────────

export function localBusinessSchema(phone = '+84902211893') {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'SOLIQ',
    description: 'Đơn vị lắp đặt điện mặt trời uy tín tại Hà Nội',
    url: SITE_URL,
    logo: LOGO_URL,
    image: OG_IMAGE,
    telephone: phone,
    email: 'lienhe@soliq.com.vn',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '125 Hoàng Ngân',
      addressLocality: 'Thanh Xuân',
      addressRegion: 'Hà Nội',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 20.9897,
      longitude: 105.8142,
    },
    sameAs: [
      'https://www.facebook.com/soliqvn',
      `https://zalo.me/${phone.replace(/^\+84/, '0')}`,
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '17:30',
      },
    ],
    priceRange: '$$',
    currenciesAccepted: 'VND',
    paymentAccepted: 'Cash, Bank Transfer, Installment',
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam',
    },
  }
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/tin-tuc?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationSchema(phone = '+84902211893') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#brand`,
    name: SITE_NAME,
    alternateName: 'SOLIQ',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}${LOGO_URL}`,
    },
    sameAs: [
      'https://www.facebook.com/soliqvn',
      `https://zalo.me/${phone.replace(/^\+84/, '0')}`,
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: phone,
        contactType: 'customer service',
        areaServed: 'VN',
        availableLanguage: ['Vietnamese'],
      },
    ],
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  }
}

export function serviceSchema(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: `${SITE_URL}${url}`,
    provider: {
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam',
    },
    serviceType: 'Solar Energy Installation',
  }
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }
}

export function articleSchema(article: {
  title: string
  description: string
  url: string
  image?: string
  publishedAt: string
  updatedAt?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: `${SITE_URL}${article.url}`,
    image: article.image || OG_IMAGE,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_URL,
      },
    },
  }
}
