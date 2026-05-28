import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'
import FloatingContact from '@/components/marketing/FloatingContact'
import PageMotionController from '@/components/marketing/PageMotionController'
import NavigationProgressBar from '@/components/shared/NavigationProgressBar'
import { getSiteConfig } from '@/lib/site-config'

// Server-side rendered with `revalidate` from each page (ISR).
// Each page sets its own cache strategy via `export const revalidate`.
export const dynamic = 'force-dynamic'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteConfig = await getSiteConfig()

  return (
    <>
      <NavigationProgressBar />
      <PageMotionController />
      <Header siteConfig={siteConfig} />
      <main className="pt-16">{children}</main>
      <FloatingContact phone={siteConfig.phone} />
      <Footer />
    </>
  )
}
