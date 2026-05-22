'use server'

import { db } from '@/lib/db'
import { articles, partners, projects, settings } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── ARTICLES ─────────────────────────────────────────────────────────────────

export async function getArticles() {
  return db.select().from(articles).orderBy(desc(articles.createdAt))
}

export async function getArticle(id: number) {
  const rows = await db.select().from(articles).where(eq(articles.id, id))
  return rows[0] || null
}

export async function getPublishedArticles() {
  return db.select().from(articles).where(eq(articles.published, true)).orderBy(desc(articles.createdAt))
}

export async function getArticleBySlug(slug: string) {
  const rows = await db.select().from(articles).where(eq(articles.slug, slug))
  return rows[0] || null
}

export async function createArticle(formData: FormData) {
  const slug = formData.get('slug') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const category = (formData.get('category') as string) || 'tin-tuc'
  const coverImage = (formData.get('coverImage') as string) || null
  const published = formData.get('published') === 'on'

  await db.insert(articles).values({
    slug, title, description, content, category,
    coverImage, published,
    publishedAt: published ? new Date() : null,
  })
  revalidatePath('/admin/articles')
  revalidatePath('/tin-tuc')
  redirect('/admin/articles')
}

export async function updateArticle(id: number, formData: FormData) {
  const slug = formData.get('slug') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const content = formData.get('content') as string
  const category = (formData.get('category') as string) || 'tin-tuc'
  const coverImage = (formData.get('coverImage') as string) || null
  const published = formData.get('published') === 'on'

  await db.update(articles).set({
    slug, title, description, content, category,
    coverImage, published,
    publishedAt: published ? new Date() : null,
    updatedAt: new Date(),
  }).where(eq(articles.id, id))
  revalidatePath('/admin/articles')
  revalidatePath('/tin-tuc')
  redirect('/admin/articles')
}

export async function deleteArticle(id: number) {
  await db.delete(articles).where(eq(articles.id, id))
  revalidatePath('/admin/articles')
  revalidatePath('/tin-tuc')
}

// ─── PARTNERS ──────────────────────────────────────────────────────────────────

export async function getPartners() {
  return db.select().from(partners).orderBy(partners.sortOrder)
}

export async function createPartner(formData: FormData) {
  const name = formData.get('name') as string
  const logo = (formData.get('logo') as string) || null
  const type = (formData.get('type') as string) || 'supplier'
  const url = (formData.get('url') as string) || null
  const sortOrder = parseInt(formData.get('sortOrder') as string) || 0
  const active = formData.get('active') === 'on'

  await db.insert(partners).values({ name, logo, type, url, sortOrder, active })
  revalidatePath('/admin/partners')
  revalidatePath('/doi-tac-thi-cong')
}

export async function updatePartner(id: number, formData: FormData) {
  const name = formData.get('name') as string
  const logo = (formData.get('logo') as string) || null
  const type = (formData.get('type') as string) || 'supplier'
  const url = (formData.get('url') as string) || null
  const sortOrder = parseInt(formData.get('sortOrder') as string) || 0
  const active = formData.get('active') === 'on'

  await db.update(partners).set({ name, logo, type, url, sortOrder, active })
    .where(eq(partners.id, id))
  revalidatePath('/admin/partners')
  revalidatePath('/doi-tac-thi-cong')
}

export async function deletePartner(id: number) {
  await db.delete(partners).where(eq(partners.id, id))
  revalidatePath('/admin/partners')
  revalidatePath('/doi-tac-thi-cong')
}

// ─── PROJECTS ──────────────────────────────────────────────────────────────────

export async function getProjects() {
  return db.select().from(projects).orderBy(desc(projects.createdAt))
}

export async function getPublishedProjects() {
  return db.select().from(projects).where(eq(projects.published, true)).orderBy(desc(projects.createdAt))
}

export async function getProject(id: number) {
  const rows = await db.select().from(projects).where(eq(projects.id, id))
  return rows[0] || null
}

export async function createProject(formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const location = (formData.get('location') as string) || null
  const capacityKwp = formData.get('capacityKwp') ? parseFloat(formData.get('capacityKwp') as string) : null
  const customerType = (formData.get('customerType') as string) || null
  const coverImage = (formData.get('coverImage') as string) || null
  const content = (formData.get('content') as string) || null
  const published = formData.get('published') === 'on'
  const metricsJson = formData.get('metrics') ? JSON.parse(formData.get('metrics') as string) : null

  await db.insert(projects).values({ title, slug, location, capacityKwp, customerType, coverImage, content, metricsJson, published })
  revalidatePath('/admin/projects')
  revalidatePath('/du-an')
  redirect('/admin/projects')
}

export async function updateProject(id: number, formData: FormData) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const location = (formData.get('location') as string) || null
  const capacityKwp = formData.get('capacityKwp') ? parseFloat(formData.get('capacityKwp') as string) : null
  const customerType = (formData.get('customerType') as string) || null
  const coverImage = (formData.get('coverImage') as string) || null
  const content = (formData.get('content') as string) || null
  const published = formData.get('published') === 'on'
  const metricsJson = formData.get('metrics') ? JSON.parse(formData.get('metrics') as string) : null

  await db.update(projects).set({ title, slug, location, capacityKwp, customerType, coverImage, content, metricsJson, published })
    .where(eq(projects.id, id))
  revalidatePath('/admin/projects')
  revalidatePath('/du-an')
  redirect('/admin/projects')
}

export async function deleteProject(id: number) {
  await db.delete(projects).where(eq(projects.id, id))
  revalidatePath('/admin/projects')
  revalidatePath('/du-an')
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────

export async function getSettings() {
  const rows = await db.select().from(settings)
  const map: Record<string, any> = {}
  for (const row of rows) {
    map[row.key] = row.valueJson
  }
  return map
}

export async function getSetting(key: string) {
  const rows = await db.select().from(settings).where(eq(settings.key, key))
  return rows[0]?.valueJson ?? null
}

export async function updateSettings(formData: FormData) {
  const entries: { key: string; value: any }[] = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('setting_')) {
      const realKey = key.replace('setting_', '')
      let parsed: any
      try { parsed = JSON.parse(value as string) } catch { parsed = value }
      entries.push({ key: realKey, value: parsed })
    }
  }

  for (const { key, value } of entries) {
    await db.insert(settings).values({ key, valueJson: value })
      .onConflictDoUpdate({ target: [settings.key], set: { valueJson: value, updatedAt: new Date() } })
  }
  revalidatePath('/admin/settings')
}
