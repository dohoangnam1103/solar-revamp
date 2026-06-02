import Solar3DLoader from '@/components/solar-3d/Solar3DLoader.jsx'

export const metadata = {
  title: 'Mô phỏng 3D hệ điện mặt trời',
  description: 'Cấu hình và xem mô hình 3D hệ điện mặt trời trên mái nhà.',
  alternates: { canonical: '/3d' },
}

export default function Solar3DPage() {
  return <Solar3DLoader />
}
