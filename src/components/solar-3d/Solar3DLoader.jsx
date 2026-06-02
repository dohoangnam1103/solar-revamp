'use client'

import dynamic from 'next/dynamic'
import styles from './Solar3DApp.module.css'

const Solar3DApp = dynamic(() => import('./Solar3DApp.jsx'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Đang tải mô phỏng 3D...</div>,
})

export default function Solar3DLoader() {
  return <Solar3DApp />
}
