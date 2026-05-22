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
  metricsJson: jsonb('metrics_json'),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert
export type QuoteRequest = typeof quoteRequests.$inferSelect
export type NewQuoteRequest = typeof quoteRequests.$inferInsert
export type QuoteResult = typeof quoteResults.$inferSelect
export type NewQuoteResult = typeof quoteResults.$inferInsert
export type Article = typeof articles.$inferSelect
export type Project = typeof projects.$inferSelect
export type Setting = typeof settings.$inferSelect
