import { unstable_cache } from 'next/cache'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'

const SETTINGS_KEY = 've_soliq_config'

export type StatItem = { value: string; label: string }
export type CoreValueItem = { title: string; desc: string }

export type VeSoliqConfig = {
  heroEyebrow: string
  heroTitle: string
  heroDescription: string

  stats: StatItem[]

  storyTitle: string
  storyParagraphs: string[]

  coreValuesTitle: string
  coreValues: CoreValueItem[]

  galleryEyebrow: string
  galleryTitle: string
  galleryDescription: string

  contactTitle: string
  contactAddress: string
  contactEmail: string
}

export const DEFAULT_VE_SOLIQ_CONFIG: VeSoliqConfig = {
  heroEyebrow: 'Smart Power From Sun',
  heroTitle: 'Về SOLIQ ENERGY',
  heroDescription:
    'SOLIQ ENERGY là đơn vị chuyên lắp đặt hệ thống điện mặt trời uy tín tại Hà Nội và các tỉnh miền Bắc. Với sứ mệnh mang năng lượng sạch, thông minh đến mọi gia đình và doanh nghiệp Việt Nam.',

  stats: [
    { value: '500+', label: 'Công trình hoàn thành' },
    { value: '5+', label: 'Năm kinh nghiệm' },
    { value: '25 năm', label: 'Bảo hành tấm pin' },
    { value: '100%', label: 'Khách hàng hài lòng' },
  ],

  storyTitle: 'Câu chuyện của chúng tôi',
  storyParagraphs: [
    'SOLIQ ENERGY được thành lập với mục tiêu đơn giản: giúp người Việt Nam tiếp cận năng lượng mặt trời một cách dễ dàng, minh bạch và hiệu quả.',
    'Chúng tôi tin rằng điện mặt trời không chỉ là xu hướng mà là giải pháp thiết thực giúp mỗi gia đình và doanh nghiệp tiết kiệm chi phí, đồng thời góp phần bảo vệ môi trường.',
    'Với đội ngũ kỹ sư và kỹ thuật viên giàu kinh nghiệm, SOLIQ cam kết mang đến dịch vụ tư vấn trung thực, thi công chuyên nghiệp và hỗ trợ sau bán hàng tận tâm.',
  ],

  coreValuesTitle: 'Giá trị cốt lõi',
  coreValues: [
    { title: 'Minh bạch', desc: 'Báo giá rõ ràng, không phát sinh chi phí ẩn' },
    { title: 'Chuyên nghiệp', desc: 'Đội ngũ kỹ sư được đào tạo bài bản, thi công đúng tiêu chuẩn' },
    { title: 'Tận tâm', desc: 'Hỗ trợ khách hàng từ tư vấn đến sau lắp đặt' },
    { title: 'Bền vững', desc: 'Cam kết chất lượng dài hạn, bảo hành đầy đủ' },
  ],

  galleryEyebrow: 'Hình ảnh thực tế',
  galleryTitle: 'Đội ngũ SOLIQ tại hiện trường.',
  galleryDescription: 'Một số hình ảnh thi công, nghiệm thu và vận hành từ nguồn tư liệu mới nhất của SOLIQ.',

  contactTitle: 'Thông tin liên hệ',
  contactAddress: '125 Hoàng Ngân, P.Thanh Xuân, TP Hà Nội',
  contactEmail: 'lienhe@soliq.com.vn',
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function pickString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function pickStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback
  const cleaned = value.filter((item): item is string => typeof item === 'string')
  return cleaned.length > 0 ? cleaned : fallback
}

function pickStats(value: unknown, fallback: StatItem[]): StatItem[] {
  if (!Array.isArray(value)) return fallback
  const cleaned = value
    .map((item) => asRecord(item))
    .map((item) => ({
      value: typeof item.value === 'string' ? item.value : '',
      label: typeof item.label === 'string' ? item.label : '',
    }))
    .filter((item) => item.value.trim().length > 0 && item.label.trim().length > 0)
  return cleaned.length > 0 ? cleaned : fallback
}

function pickCoreValues(value: unknown, fallback: CoreValueItem[]): CoreValueItem[] {
  if (!Array.isArray(value)) return fallback
  const cleaned = value
    .map((item) => asRecord(item))
    .map((item) => ({
      title: typeof item.title === 'string' ? item.title : '',
      desc: typeof item.desc === 'string' ? item.desc : '',
    }))
    .filter((item) => item.title.trim().length > 0 && item.desc.trim().length > 0)
  return cleaned.length > 0 ? cleaned : fallback
}

export function normalizeVeSoliqConfig(value: unknown): VeSoliqConfig {
  const source = asRecord(value)
  return {
    heroEyebrow: pickString(source.heroEyebrow, DEFAULT_VE_SOLIQ_CONFIG.heroEyebrow),
    heroTitle: pickString(source.heroTitle, DEFAULT_VE_SOLIQ_CONFIG.heroTitle),
    heroDescription: pickString(source.heroDescription, DEFAULT_VE_SOLIQ_CONFIG.heroDescription),
    stats: pickStats(source.stats, DEFAULT_VE_SOLIQ_CONFIG.stats),
    storyTitle: pickString(source.storyTitle, DEFAULT_VE_SOLIQ_CONFIG.storyTitle),
    storyParagraphs: pickStringArray(source.storyParagraphs, DEFAULT_VE_SOLIQ_CONFIG.storyParagraphs),
    coreValuesTitle: pickString(source.coreValuesTitle, DEFAULT_VE_SOLIQ_CONFIG.coreValuesTitle),
    coreValues: pickCoreValues(source.coreValues, DEFAULT_VE_SOLIQ_CONFIG.coreValues),
    galleryEyebrow: pickString(source.galleryEyebrow, DEFAULT_VE_SOLIQ_CONFIG.galleryEyebrow),
    galleryTitle: pickString(source.galleryTitle, DEFAULT_VE_SOLIQ_CONFIG.galleryTitle),
    galleryDescription: pickString(source.galleryDescription, DEFAULT_VE_SOLIQ_CONFIG.galleryDescription),
    contactTitle: pickString(source.contactTitle, DEFAULT_VE_SOLIQ_CONFIG.contactTitle),
    contactAddress: pickString(source.contactAddress, DEFAULT_VE_SOLIQ_CONFIG.contactAddress),
    contactEmail: pickString(source.contactEmail, DEFAULT_VE_SOLIQ_CONFIG.contactEmail),
  }
}

export const getVeSoliqConfig = unstable_cache(
  async (): Promise<VeSoliqConfig> => {
    try {
      const rows = await db.select().from(settings).where(eq(settings.key, SETTINGS_KEY)).limit(1)
      return normalizeVeSoliqConfig(rows[0]?.valueJson)
    } catch {
      return DEFAULT_VE_SOLIQ_CONFIG
    }
  },
  [SETTINGS_KEY],
  { tags: ['ve-soliq-config'], revalidate: 300 }
)
