import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { defaultMetadata, localBusinessSchema, organizationSchema, websiteSchema } from '@/lib/seo/metadata'
import { getSiteConfig } from '@/lib/site-config'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-be-vietnam',
  display: 'swap',
})

export const metadata: Metadata = defaultMetadata

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteConfig = await getSiteConfig()
  const phoneIntl = `+84${siteConfig.phone.replace(/^0/, '')}`

  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <head>
        {/* biome-ignore lint: JSON-LD structured data, escaped via \u003c */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema(phoneIntl)).replace(/</g, '\\u003c'),
          }}
        />
        {/* biome-ignore lint: JSON-LD structured data, escaped via \u003c */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema(phoneIntl)).replace(/</g, '\\u003c'),
          }}
        />
        {/* biome-ignore lint: JSON-LD structured data, escaped via \u003c */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema()).replace(/</g, '\\u003c'),
          }}
        />
        {GTM_ID && (
          // biome-ignore lint: Google Tag Manager bootstrap snippet
          <script dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
          }} />
        )}
        {META_PIXEL_ID && (
          // biome-ignore lint: Meta Pixel bootstrap snippet
          <script dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`,
          }} />
        )}
      </head>
      <body className={`${beVietnamPro.className} antialiased`}>
        {GTM_ID && (
          <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} /></noscript>
        )}
        {children}
      </body>
    </html>
  )
}
