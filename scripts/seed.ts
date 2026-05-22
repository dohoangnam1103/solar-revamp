import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../src/lib/db/schema'

async function seed() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql, { schema })

  console.log('Seeding...')

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
        { termMonths: 36, interestRate: 0.10 },
        { termMonths: 60, interestRate: 0.115 },
      ],
    },
  }).onConflictDoNothing()

  const articles = [
    {
      slug: 'chi-phi-lap-dien-mat-troi-2026',
      title: 'Chi phí lắp điện mặt trời năm 2026: Bảng giá chi tiết',
      description: 'Tổng hợp chi phí lắp đặt điện mặt trời mới nhất năm 2026, từ hệ thống gia đình đến doanh nghiệp.',
      content: 'Chi phí lắp điện mặt trời năm 2026 dao động từ 47 triệu đến hơn 200 triệu tùy công suất và loại hệ thống. Hệ thống hòa lưới (grid-tied) có giá thấp hơn, trong khi hệ thống hybrid với pin lưu trữ có chi phí cao hơn nhưng mang lại nhiều lợi ích hơn.\n\nCác yếu tố ảnh hưởng đến chi phí bao gồm: công suất hệ thống (kWp), loại tấm pin, thương hiệu biến tần, có hay không có pin lưu trữ, và chi phí thi công tùy địa điểm.',
      category: 'Kiến thức', published: true, publishedAt: new Date('2026-05-15'),
    },
    {
      slug: 'thoi-gian-hoan-von-dien-mat-troi',
      title: 'Thời gian hoàn vốn điện mặt trời: Tính như thế nào?',
      description: 'Hướng dẫn cách tính thời gian hoàn vốn khi lắp điện mặt trời, các yếu tố ảnh hưởng và cách tối ưu.',
      content: 'Thời gian hoàn vốn = Tổng đầu tư / Tiết kiệm hàng năm. Với hệ thống 10kWp, đầu tư khoảng 78 triệu, tiết kiệm khoảng 12-15 triệu/năm, thời gian hoàn vốn khoảng 5-6 năm.\n\nCác yếu tố tối ưu thời gian hoàn vốn: tỷ lệ dùng điện ban ngày cao (>60%), hóa đơn điện lớn, vị trí nhiều nắng (miền Nam nhanh hơn miền Bắc).',
      category: 'Tài chính', published: true, publishedAt: new Date('2026-05-10'),
    },
  ]

  for (const article of articles) {
    await db.insert(schema.articles).values(article).onConflictDoNothing()
  }

  console.log('Seed complete!')
}

seed().catch(console.error)
