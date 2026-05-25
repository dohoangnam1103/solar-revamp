import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'
import FloatingContact from '@/components/marketing/FloatingContact'

export const dynamic = 'force-dynamic'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
      <FloatingContact />
      <Footer />
    </>
  )
}
