import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { eq } from 'drizzle-orm'
import { randomBytes, scryptSync } from 'crypto'
import * as schema from '../src/lib/db/schema'
import { formatVnd } from '../src/lib/quote/calculator'
import { loadEnvFile } from './lib/load-env'

loadEnvFile()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const db = drizzle(pool, { schema })

function hashPassword(plain: string): string {
  const salt = randomBytes(16)
  const key = scryptSync(plain, salt, 64)
  return `${salt.toString('hex')}:${key.toString('hex')}`
}

const SUPERADMIN_EMAIL = 'superadmin@gmail.com'
const SUPERADMIN_PASSWORD = '123456@@'

async function seed() {
  console.log('Seeding...')

  // ─── Superadmin ───────────────────────────────────────────────────────────
  const existing = await db.select().from(schema.admins).where(eq(schema.admins.email, SUPERADMIN_EMAIL))
  if (!existing.length) {
    await db.insert(schema.admins).values({
      email: SUPERADMIN_EMAIL,
      passwordHash: hashPassword(SUPERADMIN_PASSWORD),
      isSuper: true,
    })
    console.log(`  ✓ Created superadmin: ${SUPERADMIN_EMAIL}`)
  } else {
    console.log(`  · Superadmin exists: ${SUPERADMIN_EMAIL}`)
  }

  await db.insert(schema.settings).values({
    key: 'solar_assumptions',
    valueJson: {
      evnPricePerKwh: 2800,
      annualProductionPerKwp: { north: 1100, central: 1350, south: 1450, default: 1300 },
      systemPricePerKwp: { gridTied: 8000000, hybrid: 9800000 },
      vatRate: 0.08,
      annualDegradation: 0.005,
      annualElectricityPriceIncrease: 0.05,
      annualOmRate: 0.01,
      installmentSetupFee: 0.02,
      installmentOptions: [
        { termMonths: 12, interestRate: 0.08 },
        { termMonths: 24, interestRate: 0.09 },
        { termMonths: 36, interestRate: 0.1 },
        { termMonths: 60, interestRate: 0.115 },
      ],
    },
  }).onConflictDoNothing()

  const articles = [
    {
      slug: 'chi-phi-lap-dien-mat-troi-2026',
      title: 'Chi phí lắp điện mặt trời năm 2026: Bảng giá chi tiết',
      description: 'Tổng hợp chi phí lắp đặt điện mặt trời mới nhất năm 2026, từ hệ thống gia đình đến doanh nghiệp.',
      content: `Chi phí lắp điện mặt trời năm 2026 dao động từ ${formatVnd(47_000_000)} đến hơn ${formatVnd(200_000_000)} tùy công suất và loại hệ thống. Hệ thống hòa lưới (grid-tied) có giá thấp hơn, trong khi hệ thống hybrid với pin lưu trữ có chi phí cao hơn nhưng mang lại nhiều lợi ích hơn.\n\nCác yếu tố ảnh hưởng đến chi phí bao gồm: công suất hệ thống (kWp), loại tấm pin, thương hiệu biến tần, có hay không có pin lưu trữ, và chi phí thi công tùy địa điểm.`,
      category: 'Kiến thức', published: true, publishedAt: new Date('2026-05-15'),
    },
    {
      slug: 'thoi-gian-hoan-von-dien-mat-troi',
      title: 'Thời gian hoàn vốn điện mặt trời: Tính như thế nào?',
      description: 'Hướng dẫn cách tính thời gian hoàn vốn khi lắp điện mặt trời, các yếu tố ảnh hưởng và cách tối ưu.',
      content: `Thời gian hoàn vốn = Tổng đầu tư / Tiết kiệm hàng năm. Với hệ thống 10kWp, đầu tư khoảng ${formatVnd(78_000_000)}, tiết kiệm khoảng ${formatVnd(12_000_000)} - ${formatVnd(15_000_000)}/năm, thời gian hoàn vốn khoảng 5-6 năm.\n\nCác yếu tố tối ưu thời gian hoàn vốn: tỷ lệ dùng điện ban ngày cao (>60%), hóa đơn điện lớn, vị trí nhiều nắng (miền Nam nhanh hơn miền Bắc).`,
      category: 'Tài chính', published: true, publishedAt: new Date('2026-05-10'),
    },
  ]

  for (const article of articles) {
    await db.insert(schema.articles).values(article).onConflictDoNothing()
  }

  const projects = [
    {
      title: 'Hệ thống 10kWp - Biệt thự Hà Đông',
      slug: 'biet-thu-ha-dong',
      location: 'Hà Đông, Hà Nội',
      capacityKwp: 10,
      customerType: 'residential',
      content:
        'Hệ thống điện mặt trời 10kWp cho biệt thự tại Hà Đông, tối ưu sản lượng ban ngày và giảm hóa đơn điện sinh hoạt.',
      published: true,
      createdAt: new Date('2026-05-06T09:00:00+07:00'),
    },
    {
      title: 'Hệ thống 25kWp - Nhà xưởng Bắc Ninh',
      slug: 'nha-xuong-bac-ninh',
      location: 'Từ Sơn, Bắc Ninh',
      capacityKwp: 25,
      customerType: 'business',
      content:
        'Dự án 25kWp cho nhà xưởng tại Bắc Ninh, ưu tiên bù tải sản xuất ban ngày và kiểm soát chi phí vận hành.',
      published: true,
      createdAt: new Date('2026-05-05T09:00:00+07:00'),
    },
    {
      title: 'Hybrid 8kWp - Nhà phố Cầu Giấy',
      slug: 'nha-pho-cau-giay',
      location: 'Cầu Giấy, Hà Nội',
      capacityKwp: 8,
      customerType: 'residential',
      content:
        'Hệ thống hybrid 8kWp cho nhà phố tại Cầu Giấy, kết hợp pin lưu trữ để duy trì tải thiết yếu khi mất điện.',
      published: true,
      createdAt: new Date('2026-05-04T09:00:00+07:00'),
    },
    {
      title: 'Hệ thống 20kWp - Văn phòng Long Biên',
      slug: 'van-phong-long-bien',
      location: 'Long Biên, Hà Nội',
      capacityKwp: 20,
      customerType: 'business',
      content:
        'Hệ thống 20kWp cho văn phòng tại Long Biên, thiết kế để khai thác tốt tải điều hòa và thiết bị văn phòng ban ngày.',
      published: true,
      createdAt: new Date('2026-05-03T09:00:00+07:00'),
    },
    {
      title: 'Hệ thống 15kWp - Nhà máy Hưng Yên',
      slug: 'nha-may-hung-yen',
      location: 'Mỹ Hào, Hưng Yên',
      capacityKwp: 15,
      customerType: 'factory',
      content:
        'Dự án điện mặt trời 15kWp tại nhà máy Hưng Yên, phục vụ nhu cầu tải sản xuất ổn định trong giờ nắng.',
      published: true,
      createdAt: new Date('2026-05-02T09:00:00+07:00'),
    },
    {
      title: 'Hybrid 5kWp - Nhà ở Đống Đa',
      slug: 'nha-o-dong-da',
      location: 'Đống Đa, Hà Nội',
      capacityKwp: 5,
      customerType: 'residential',
      content:
        'Hệ thống hybrid 5kWp cho nhà ở Đống Đa, phù hợp hộ gia đình cần tiết kiệm điện và có nguồn dự phòng cơ bản.',
      published: true,
      createdAt: new Date('2026-05-01T09:00:00+07:00'),
    },
  ]

  for (const project of projects) {
    await db.insert(schema.projects).values(project).onConflictDoNothing()
  }

  console.log('Seed complete!')
}

seed()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
