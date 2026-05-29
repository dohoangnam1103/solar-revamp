import { pgTable, text, integer, boolean, timestamp, real, jsonb, serial } from 'drizzle-orm/pg-core'

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  province: text('province'),
  district: text('district'),
  ward: text('ward'),
  source: text('source').default('website'),
  status: text('status').default('new'), // new | contacted | qualified | closed
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const quoteRequests = pgTable('quote_requests', {
  id: serial('id').primaryKey(),
  publicToken: text('public_token').notNull().unique(),
  leadId: integer('lead_id').references(() => leads.id),
  paymentMode: text('payment_mode').notNull(), // cash | installment | lease
  customerType: text('customer_type').notNull(), // residential | business | factory
  monthlyBillVnd: integer('monthly_bill_vnd').notNull(),
  daytimeUsageRate: real('daytime_usage_rate').notNull(), // 0.0 - 1.0
  roofAreaSqm: real('roof_area_sqm'),
  batteryOption: boolean('battery_option').default(false),
  locationJson: jsonb('location_json'), // { province, district, ward, lat, lng }
  inputJson: jsonb('input_json'), // full raw input snapshot
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const quoteResults = pgTable('quote_results', {
  id: serial('id').primaryKey(),
  quoteRequestId: integer('quote_request_id').references(() => quoteRequests.id),
  recommendedCapacityKwp: real('recommended_capacity_kwp').notNull(),
  estimatedInvestmentVnd: integer('estimated_investment_vnd').notNull(),
  annualProductionKwh: real('annual_production_kwh').notNull(),
  annualSavingsVnd: integer('annual_savings_vnd').notNull(),
  paybackYears: real('payback_years').notNull(),
  irrPercent: real('irr_percent'),
  installmentPlansJson: jsonb('installment_plans_json'),
  resultJson: jsonb('result_json'), // full result snapshot
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  category: text('category').default('tin-tuc'),
  coverImage: text('cover_image'),
  published: boolean('published').default(false),
  publishedAt: timestamp('published_at'),
  seoJson: jsonb('seo_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const partners = pgTable('partners', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  logo: text('logo'),
  type: text('type').default('supplier'), // supplier | installer | financial
  url: text('url'),
  sortOrder: integer('sort_order').default(0),
  active: boolean('active').default(true),
})

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  location: text('location'),
  capacityKwp: real('capacity_kwp'),
  customerType: text('customer_type'),
  coverImage: text('cover_image'),
  content: text('content'),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const mediaAssets = pgTable('media_assets', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  storagePath: text('storage_path').notNull().unique(),
  originalName: text('original_name'),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  usage: text('usage').default('general').notNull(),
  alt: text('alt'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const carouselImages = pgTable('carousel_images', {
  id: serial('id').primaryKey(),
  mediaAssetId: integer('media_asset_id').references(() => mediaAssets.id, { onDelete: 'cascade' }).notNull(),
  alt: text('alt').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const veSoliqGalleryImages = pgTable('ve_soliq_gallery_images', {
  id: serial('id').primaryKey(),
  mediaAssetId: integer('media_asset_id').references(() => mediaAssets.id, { onDelete: 'cascade' }).notNull(),
  alt: text('alt').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const recruitmentPosts = pgTable('recruitment_posts', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content'),
  logo: text('logo'),
  department: text('department'),
  location: text('location'),
  employmentType: text('employment_type').default('full-time'),
  salaryRange: text('salary_range'),
  deadline: timestamp('deadline'),
  published: boolean('published').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const recruitmentApplications = pgTable('recruitment_applications', {
  id: serial('id').primaryKey(),
  recruitmentPostId: integer('recruitment_post_id').references(() => recruitmentPosts.id, { onDelete: 'set null' }),
  position: text('position').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  message: text('message'),
  status: text('status').default('new').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  valueJson: jsonb('value_json').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const auditEvents = pgTable('audit_events', {
  id: serial('id').primaryKey(),
  actor: text('actor'),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  event: text('event').notNull(),
  payloadJson: jsonb('payload_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isSuper: boolean('is_super').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const faqs = pgTable('faqs', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  featured: boolean('featured').default(false).notNull(),
  published: boolean('published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
export type QuoteRequest = typeof quoteRequests.$inferSelect
export type NewQuoteRequest = typeof quoteRequests.$inferInsert
export type QuoteResult = typeof quoteResults.$inferSelect
export type NewQuoteResult = typeof quoteResults.$inferInsert
export type Article = typeof articles.$inferSelect
export type Project = typeof projects.$inferSelect
export type MediaAsset = typeof mediaAssets.$inferSelect
export type NewMediaAsset = typeof mediaAssets.$inferInsert
export type CarouselImage = typeof carouselImages.$inferSelect
export type VeSoliqGalleryImage = typeof veSoliqGalleryImages.$inferSelect
export type RecruitmentPost = typeof recruitmentPosts.$inferSelect
export type RecruitmentApplication = typeof recruitmentApplications.$inferSelect
export type Setting = typeof settings.$inferSelect
export type Admin = typeof admins.$inferSelect
export type NewAdmin = typeof admins.$inferInsert
export const pricingPackages = pgTable('pricing_packages', {
  id: serial('id').primaryKey(),
  page: text('page').notNull(),        // 'gia-dinh' | 'doanh-nghiep' | 'hybrid' | 'vat-tu'
  category: text('category'),          // vat-tu only: 'tam-pin' | 'bien-tan' | 'pin-luu-tru'
  sortOrder: integer('sort_order').notNull().default(0),
  cap: text('cap'),
  panels: text('panels'),
  inv: text('inv'),
  bat: text('bat'),
  fit: text('fit'),
  name: text('name'),                  // vat-tu only
  spec: text('spec'),                  // vat-tu only
  note: text('note'),                  // vat-tu only
  price: integer('price'),             // null for vat-tu
  active: boolean('active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Faq = typeof faqs.$inferSelect
export type NewFaq = typeof faqs.$inferInsert
export type PricingPackage = typeof pricingPackages.$inferSelect
export type NewPricingPackage = typeof pricingPackages.$inferInsert
