'use server'

import { db } from '@/lib/db'
import { articles, carouselImages, faqs, mediaAssets, partners, pricingPackages, projects, recruitmentApplications, recruitmentPosts, settings, veSoliqGalleryImages } from '@/lib/db/schema'
import { eq, desc, asc, max } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, requireSuperAdmin } from '@/lib/auth/admin'
import { buildSolarAssumptionsFromForm } from '@/lib/quote/settings'
import { deleteStoredUpload, saveUploadedImage } from '@/lib/media/storage'
import { slugifyVietnamese } from '@/lib/slug'
import { firePurgePaths } from '@/lib/cdn/cloudflare'

function revalidateArticles() {
  revalidateTag('articles', 'max')
  revalidatePath('/admin/articles')
  revalidatePath('/tin-tuc')
  revalidatePath('/sitemap.xml')
  firePurgePaths(['/tin-tuc', '/sitemap.xml'])
}

function revalidatePartners() {
  revalidateTag('partners', 'max')
  revalidatePath('/admin/partners')
  revalidatePath('/doi-tac-thi-cong')
  firePurgePaths(['/', '/doi-tac-thi-cong'])
}

function revalidateProjects() {
  revalidateTag('projects', 'max')
  revalidatePath('/admin/projects')
  revalidatePath('/du-an')
  firePurgePaths(['/', '/du-an'])
}

function revalidateRecruitmentPosts() {
  revalidateTag('recruitment-posts', 'max')
  revalidatePath('/admin/recruitment')
  revalidatePath('/tuyen-dung')
  revalidatePath('/sitemap.xml')
  firePurgePaths(['/tuyen-dung', '/sitemap.xml'])
}

function revalidateFaqs() {
  revalidateTag('faqs', 'max')
  revalidatePath('/admin/faqs')
  revalidatePath('/')
  revalidatePath('/cau-hoi-thuong-gap')
  firePurgePaths(['/', '/cau-hoi-thuong-gap'])
}

function revalidateCarouselImages() {
  revalidateTag('carousel-images', 'max')
  revalidatePath('/')
  revalidatePath('/admin/carousel')
  firePurgePaths(['/'])
}

function revalidateVeSoliqGalleryImages() {
  revalidateTag('ve-soliq-gallery', 'max')
  revalidatePath('/ve-soliq')
  revalidatePath('/admin/ve-soliq-config')
  firePurgePaths(['/ve-soliq'])
}

const DEFAULT_CAROUSEL_ALT = 'Công trình điện mặt trời SOLIQ đã lắp đặt'
const CONTENT_ADMIN_UPLOAD_USAGES = new Set(['article-cover', 'project-cover', 'carousel', 've-soliq-gallery'])

export type PartnerFormState = {
  error?: string
  success?: string
}

export type ArticleFormState = {
  error?: string
  success?: string
}

async function deleteMediaAssetByUrl(url: string | null) {
  if (!url?.startsWith('/uploads/')) return

  const rows = await db
    .select({
      id: mediaAssets.id,
      storagePath: mediaAssets.storagePath,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.url, url))
    .limit(1)
  const asset = rows[0]
  if (!asset) return

  await db.delete(mediaAssets).where(eq(mediaAssets.id, asset.id))
  await deleteStoredUpload(asset.storagePath)
}

async function getOptionalUploadedImageUrl(formData: FormData, fieldName: string, usage: string) {
  const file = formData.get(fieldName)
  if (!(file instanceof File) || file.size === 0) return null

  const asset = await uploadImageAsset(file, usage)
  return asset.url
}

async function getCoverImageUrl(formData: FormData, usage: string, currentUrl: string | null = null) {
  const uploadedUrl = await getOptionalUploadedImageUrl(formData, 'coverImageUpload', usage)
  if (!uploadedUrl) return currentUrl

  await deleteMediaAssetByUrl(currentUrl)
  return uploadedUrl
}

async function buildUniqueArticleSlug(title: string, currentId?: number) {
  const baseSlug = slugifyVietnamese(title, 'bai-viet')
  let slug = baseSlug
  let suffix = 2

  while (true) {
    const rows = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1)
    const existing = rows[0]
    if (!existing || existing.id === currentId) return slug

    slug = `${baseSlug}-${suffix}`
    suffix++
  }
}

async function buildUniqueProjectSlug(title: string, currentId?: number) {
  const baseSlug = slugifyVietnamese(title, 'du-an')
  let slug = baseSlug
  let suffix = 2

  while (true) {
    const rows = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1)
    const existing = rows[0]
    if (!existing || existing.id === currentId) return slug

    slug = `${baseSlug}-${suffix}`
    suffix++
  }
}

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

export async function createArticle(
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  try {
    await requireAdmin()
    const title = formData.get('title') as string
    const slug = await buildUniqueArticleSlug(title)
    const description = formData.get('description') as string
    const content = formData.get('content') as string
    const category = (formData.get('category') as string) || 'tin-tuc'
    const coverImage = await getCoverImageUrl(formData, 'article-cover')
    const published = formData.get('published') === 'on'

    await db.insert(articles).values({
      slug, title, description, content, category,
      coverImage, published,
      publishedAt: published ? new Date() : null,
    })
    revalidateArticles()
    return { success: 'Đã tạo bài viết.' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Không thể tạo bài viết.' }
  }
}

export async function updateArticle(
  id: number,
  _prevState: ArticleFormState,
  formData: FormData
): Promise<ArticleFormState> {
  try {
    await requireAdmin()
    const currentArticle = await getArticle(id)
    const title = formData.get('title') as string
    const slug = await buildUniqueArticleSlug(title, id)
    const description = formData.get('description') as string
    const content = formData.get('content') as string
    const category = (formData.get('category') as string) || 'tin-tuc'
    const coverImage = await getCoverImageUrl(formData, 'article-cover', currentArticle?.coverImage || null)
    const published = formData.get('published') === 'on'

    await db.update(articles).set({
      slug, title, description, content, category,
      coverImage, published,
      publishedAt: published ? new Date() : null,
      updatedAt: new Date(),
    }).where(eq(articles.id, id))
    revalidateArticles()
    return { success: 'Đã cập nhật bài viết.' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Không thể cập nhật bài viết.' }
  }
}

export async function deleteArticle(id: number) {
  await requireAdmin()
  const article = await getArticle(id)
  await db.delete(articles).where(eq(articles.id, id))
  await deleteMediaAssetByUrl(article?.coverImage || null)
  revalidateArticles()
}

// ─── PARTNERS ──────────────────────────────────────────────────────────────────

export async function getPartners() {
  return db.select().from(partners).orderBy(partners.sortOrder)
}

export async function createPartner(
  _prevState: PartnerFormState,
  formData: FormData
): Promise<PartnerFormState> {
  try {
    await requireSuperAdmin()
    const name = String(formData.get('name') || '').trim()
    if (!name) return { error: 'Vui lòng nhập tên đối tác.' }

    const logo = await getOptionalUploadedImageUrl(formData, 'logo', 'partner-logo')
    const type = (formData.get('type') as string) || 'supplier'
    const url = String(formData.get('url') || '').trim() || null
    const [lastPartner] = await db.select({ sortOrder: partners.sortOrder }).from(partners).orderBy(desc(partners.sortOrder)).limit(1)
    const sortOrder = (lastPartner?.sortOrder ?? 0) + 1
    const active = formData.get('active') === 'on'

    await db.insert(partners).values({ name, logo, type, url, sortOrder, active })
    revalidatePartners()
    return { success: 'Đã thêm đối tác.' }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Không thể thêm đối tác.' }
  }
}

export async function updatePartner(id: number, formData: FormData) {
  await requireSuperAdmin()
  const name = formData.get('name') as string
  const logo = await getOptionalUploadedImageUrl(formData, 'logo', 'partner-logo')
  const type = (formData.get('type') as string) || 'supplier'
  const url = (formData.get('url') as string) || null
  const active = formData.get('active') === 'on'

  await db.update(partners).set({ name, logo, type, url, active })
    .where(eq(partners.id, id))
  revalidatePartners()
}

export async function deletePartner(id: number) {
  await requireSuperAdmin()
  await db.delete(partners).where(eq(partners.id, id))
  revalidatePartners()
}

export async function reorderPartners(ids: number[]) {
  await requireSuperAdmin()
  const orderedIds = Array.from(new Set(ids))
    .filter((id) => Number.isInteger(id) && id > 0)

  for (const [index, id] of orderedIds.entries()) {
    await db.update(partners).set({
      sortOrder: index + 1,
    }).where(eq(partners.id, id))
  }

  revalidatePartners()
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
  await requireAdmin()
  const title = formData.get('title') as string
  const slug = await buildUniqueProjectSlug(title)
  const location = (formData.get('location') as string) || null
  const capacityKwp = formData.get('capacityKwp') ? parseFloat(formData.get('capacityKwp') as string) : null
  const customerType = (formData.get('customerType') as string) || null
  const coverImage = await getCoverImageUrl(formData, 'project-cover')
  const content = (formData.get('content') as string) || null
  const published = formData.get('published') === 'on'

  await db.insert(projects).values({ title, slug, location, capacityKwp, customerType, coverImage, content, published })
  revalidateProjects()
  redirect('/admin/projects')
}

export async function updateProject(id: number, formData: FormData) {
  await requireAdmin()
  const currentProject = await getProject(id)
  const title = formData.get('title') as string
  const slug = await buildUniqueProjectSlug(title, id)
  const location = (formData.get('location') as string) || null
  const capacityKwp = formData.get('capacityKwp') ? parseFloat(formData.get('capacityKwp') as string) : null
  const customerType = (formData.get('customerType') as string) || null
  const coverImage = await getCoverImageUrl(formData, 'project-cover', currentProject?.coverImage || null)
  const content = (formData.get('content') as string) || null
  const published = formData.get('published') === 'on'

  await db.update(projects).set({ title, slug, location, capacityKwp, customerType, coverImage, content, published })
    .where(eq(projects.id, id))
  revalidateProjects()
  redirect('/admin/projects')
}

export async function deleteProject(id: number) {
  await requireAdmin()
  const project = await getProject(id)
  await db.delete(projects).where(eq(projects.id, id))
  await deleteMediaAssetByUrl(project?.coverImage || null)
  revalidateProjects()
}

// ─── RECRUITMENT ─────────────────────────────────────────────────────────────

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

async function buildUniqueRecruitmentSlug(title: string, currentId?: number) {
  const baseSlug = slugifyVietnamese(title, 'tin-tuyen-dung')
  let slug = baseSlug
  let suffix = 2

  while (true) {
    const rows = await db
      .select({ id: recruitmentPosts.id })
      .from(recruitmentPosts)
      .where(eq(recruitmentPosts.slug, slug))
      .limit(1)
    const existing = rows[0]
    if (!existing || existing.id === currentId) return slug

    slug = `${baseSlug}-${suffix}`
    suffix++
  }
}

export async function getRecruitmentPosts() {
  return db.select().from(recruitmentPosts).orderBy(desc(recruitmentPosts.createdAt))
}

export async function getRecruitmentPost(id: number) {
  const rows = await db.select().from(recruitmentPosts).where(eq(recruitmentPosts.id, id))
  return rows[0] || null
}

export async function getRecruitmentApplications() {
  return db.select().from(recruitmentApplications).orderBy(desc(recruitmentApplications.createdAt))
}

export async function createRecruitmentPost(formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  const slug = await buildUniqueRecruitmentSlug(title)
  const description = (formData.get('description') as string) || null
  const content = (formData.get('content') as string) || null
  const department = (formData.get('department') as string) || null
  const location = (formData.get('location') as string) || null
  const employmentType = (formData.get('employmentType') as string) || 'full-time'
  const salaryRange = (formData.get('salaryRange') as string) || null
  const deadline = parseOptionalDate(formData.get('deadline'))
  const published = formData.get('published') === 'on'

  await db.insert(recruitmentPosts).values({
    slug,
    title,
    description,
    content,
    department,
    location,
    employmentType,
    salaryRange,
    deadline,
    published,
    publishedAt: published ? new Date() : null,
  })

  revalidateRecruitmentPosts()
  redirect('/admin/recruitment')
}

export async function updateRecruitmentPost(id: number, formData: FormData) {
  await requireAdmin()
  const title = formData.get('title') as string
  const slug = await buildUniqueRecruitmentSlug(title, id)
  const description = (formData.get('description') as string) || null
  const content = (formData.get('content') as string) || null
  const department = (formData.get('department') as string) || null
  const location = (formData.get('location') as string) || null
  const employmentType = (formData.get('employmentType') as string) || 'full-time'
  const salaryRange = (formData.get('salaryRange') as string) || null
  const deadline = parseOptionalDate(formData.get('deadline'))
  const published = formData.get('published') === 'on'

  await db.update(recruitmentPosts).set({
    slug,
    title,
    description,
    content,
    department,
    location,
    employmentType,
    salaryRange,
    deadline,
    published,
    publishedAt: published ? new Date() : null,
    updatedAt: new Date(),
  }).where(eq(recruitmentPosts.id, id))

  revalidateRecruitmentPosts()
  redirect('/admin/recruitment')
}

export async function deleteRecruitmentPost(id: number) {
  await requireAdmin()
  await db.delete(recruitmentPosts).where(eq(recruitmentPosts.id, id))
  revalidateRecruitmentPosts()
}

export async function updateRecruitmentApplicationStatus(id: number, status: string) {
  await requireAdmin()
  const allowed = new Set(['new', 'reviewing', 'contacted', 'rejected'])
  if (!allowed.has(status)) return

  await db.update(recruitmentApplications).set({
    status,
    updatedAt: new Date(),
  }).where(eq(recruitmentApplications.id, id))

  revalidatePath('/admin/recruitment')
}

// ─── MEDIA + CAROUSEL ────────────────────────────────────────────────────────

export async function uploadImageAsset(file: File, usage: string, alt: string | null = null) {
  const admin = await requireAdmin()
  if (!admin.isSuper && !CONTENT_ADMIN_UPLOAD_USAGES.has(usage)) {
    throw new Error('Forbidden')
  }
  const storedImage = await saveUploadedImage(file, usage)
  const [asset] = await db.insert(mediaAssets).values({
    url: storedImage.url,
    storagePath: storedImage.storagePath,
    originalName: storedImage.originalName,
    mimeType: storedImage.mimeType,
    sizeBytes: storedImage.sizeBytes,
    usage,
    alt,
  }).returning()

  return asset
}

export async function getCarouselImages() {
  return db
    .select({
      id: carouselImages.id,
      alt: carouselImages.alt,
      sortOrder: carouselImages.sortOrder,
      createdAt: carouselImages.createdAt,
      mediaAssetId: mediaAssets.id,
      url: mediaAssets.url,
      originalName: mediaAssets.originalName,
      mimeType: mediaAssets.mimeType,
      sizeBytes: mediaAssets.sizeBytes,
      storagePath: mediaAssets.storagePath,
    })
    .from(carouselImages)
    .innerJoin(mediaAssets, eq(carouselImages.mediaAssetId, mediaAssets.id))
    .orderBy(asc(carouselImages.sortOrder), asc(carouselImages.id))
}

export async function createCarouselImage(formData: FormData) {
  await requireAdmin()
  const file = formData.get('image')
  if (!(file instanceof File)) {
    throw new Error('Chưa chọn ảnh để upload.')
  }

  const [lastImage] = await db
    .select({ sortOrder: carouselImages.sortOrder })
    .from(carouselImages)
    .orderBy(desc(carouselImages.sortOrder))
    .limit(1)
  const asset = await uploadImageAsset(file, 'carousel', DEFAULT_CAROUSEL_ALT)

  await db.insert(carouselImages).values({
    mediaAssetId: asset.id,
    alt: DEFAULT_CAROUSEL_ALT,
    sortOrder: (lastImage?.sortOrder ?? 0) + 1,
  })

  revalidateCarouselImages()
}

export async function deleteCarouselImage(id: number) {
  await requireAdmin()
  const rows = await db
    .select({
      mediaAssetId: carouselImages.mediaAssetId,
      storagePath: mediaAssets.storagePath,
    })
    .from(carouselImages)
    .innerJoin(mediaAssets, eq(carouselImages.mediaAssetId, mediaAssets.id))
    .where(eq(carouselImages.id, id))

  const row = rows[0]
  if (!row) return

  await db.delete(carouselImages).where(eq(carouselImages.id, id))
  await db.delete(mediaAssets).where(eq(mediaAssets.id, row.mediaAssetId))
  await deleteStoredUpload(row.storagePath)

  revalidateCarouselImages()
}

export async function reorderCarouselImages(ids: number[]) {
  await requireAdmin()
  const orderedIds = Array.from(new Set(ids))
    .filter((id) => Number.isInteger(id) && id > 0)

  for (const [index, id] of orderedIds.entries()) {
    await db.update(carouselImages).set({
      sortOrder: index + 1,
      updatedAt: new Date(),
    }).where(eq(carouselImages.id, id))
  }

  revalidateCarouselImages()
}

// ─── VE-SOLIQ GALLERY ────────────────────────────────────────────────────────

const DEFAULT_VE_SOLIQ_GALLERY_ALT = 'Hình ảnh thực tế đội ngũ SOLIQ tại hiện trường'

export async function getVeSoliqGalleryImages() {
  return db
    .select({
      id: veSoliqGalleryImages.id,
      alt: veSoliqGalleryImages.alt,
      sortOrder: veSoliqGalleryImages.sortOrder,
      createdAt: veSoliqGalleryImages.createdAt,
      mediaAssetId: mediaAssets.id,
      url: mediaAssets.url,
      originalName: mediaAssets.originalName,
      mimeType: mediaAssets.mimeType,
      sizeBytes: mediaAssets.sizeBytes,
      storagePath: mediaAssets.storagePath,
    })
    .from(veSoliqGalleryImages)
    .innerJoin(mediaAssets, eq(veSoliqGalleryImages.mediaAssetId, mediaAssets.id))
    .orderBy(asc(veSoliqGalleryImages.sortOrder), asc(veSoliqGalleryImages.id))
}

export async function createVeSoliqGalleryImage(formData: FormData) {
  await requireAdmin()
  const file = formData.get('image')
  if (!(file instanceof File)) {
    throw new Error('Chưa chọn ảnh để upload.')
  }

  const [lastImage] = await db
    .select({ sortOrder: veSoliqGalleryImages.sortOrder })
    .from(veSoliqGalleryImages)
    .orderBy(desc(veSoliqGalleryImages.sortOrder))
    .limit(1)
  const asset = await uploadImageAsset(file, 've-soliq-gallery', DEFAULT_VE_SOLIQ_GALLERY_ALT)

  await db.insert(veSoliqGalleryImages).values({
    mediaAssetId: asset.id,
    alt: DEFAULT_VE_SOLIQ_GALLERY_ALT,
    sortOrder: (lastImage?.sortOrder ?? 0) + 1,
  })

  revalidateVeSoliqGalleryImages()
}

export async function deleteVeSoliqGalleryImage(id: number) {
  await requireAdmin()
  const rows = await db
    .select({
      mediaAssetId: veSoliqGalleryImages.mediaAssetId,
      storagePath: mediaAssets.storagePath,
    })
    .from(veSoliqGalleryImages)
    .innerJoin(mediaAssets, eq(veSoliqGalleryImages.mediaAssetId, mediaAssets.id))
    .where(eq(veSoliqGalleryImages.id, id))

  const row = rows[0]
  if (!row) return

  await db.delete(veSoliqGalleryImages).where(eq(veSoliqGalleryImages.id, id))
  await db.delete(mediaAssets).where(eq(mediaAssets.id, row.mediaAssetId))
  await deleteStoredUpload(row.storagePath)

  revalidateVeSoliqGalleryImages()
}

export async function reorderVeSoliqGalleryImages(ids: number[]) {
  await requireAdmin()
  const orderedIds = Array.from(new Set(ids))
    .filter((id) => Number.isInteger(id) && id > 0)

  for (const [index, id] of orderedIds.entries()) {
    await db.update(veSoliqGalleryImages).set({
      sortOrder: index + 1,
      updatedAt: new Date(),
    }).where(eq(veSoliqGalleryImages.id, id))
  }

  revalidateVeSoliqGalleryImages()
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
  await requireSuperAdmin()
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

export async function updateSiteConfig(formData: FormData) {
  await requireSuperAdmin()
  const phone = (formData.get('phone') as string)?.trim() || '0902211893'
  const phoneFormatted = (formData.get('phoneFormatted') as string)?.trim() || '090.22.11.893'

  const emailsRaw = (formData.get('notificationEmails') as string) || ''
  const notificationEmails = emailsRaw
    .split(/[\n,]+/)
    .map((email) => email.trim())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    .slice(0, 20)

  // Read existing config to preserve logos when no new upload
  const existingRows = await db.select().from(settings).where(eq(settings.key, 'site_config')).limit(1)
  const existingConfig = existingRows[0]?.valueJson as Record<string, unknown> | undefined
  const existingHeaderLogo = typeof existingConfig?.headerLogo === 'string' ? existingConfig.headerLogo : null
  const existingFooterLogo = typeof existingConfig?.footerLogo === 'string' ? existingConfig.footerLogo : null

  // Handle logo uploads or removal
  const removeHeaderLogo = formData.get('removeHeaderLogo') === 'on'
  const removeFooterLogo = formData.get('removeFooterLogo') === 'on'

  const newHeaderLogo = await getOptionalUploadedImageUrl(formData, 'headerLogoUpload', 'site-logo')
  const newFooterLogo = await getOptionalUploadedImageUrl(formData, 'footerLogoUpload', 'site-logo')

  let headerLogo: string | null
  if (newHeaderLogo) {
    if (existingHeaderLogo) await deleteMediaAssetByUrl(existingHeaderLogo)
    headerLogo = newHeaderLogo
  } else if (removeHeaderLogo) {
    if (existingHeaderLogo) await deleteMediaAssetByUrl(existingHeaderLogo)
    headerLogo = null
  } else {
    headerLogo = existingHeaderLogo
  }

  let footerLogo: string | null
  if (newFooterLogo) {
    if (existingFooterLogo) await deleteMediaAssetByUrl(existingFooterLogo)
    footerLogo = newFooterLogo
  } else if (removeFooterLogo) {
    if (existingFooterLogo) await deleteMediaAssetByUrl(existingFooterLogo)
    footerLogo = null
  } else {
    footerLogo = existingFooterLogo
  }

  const config = { phone, phoneFormatted, notificationEmails, headerLogo, footerLogo }

  await db.insert(settings).values({ key: 'site_config', valueJson: config })
    .onConflictDoUpdate({
      target: [settings.key],
      set: { valueJson: config, updatedAt: new Date() },
    })

  revalidateTag('site-config', 'max')
  revalidatePath('/')
  revalidatePath('/admin/site-config')
  // Site config affects every marketing page (header/footer phone, logo)
  firePurgePaths([
    '/',
    '/bao-gia-dien-mat-troi',
    '/cau-hoi-thuong-gap',
    '/check',
    '/dien-mat-troi-doanh-nghiep',
    '/doi-tac-thi-cong',
    '/he-thong-hybrid-luu-tru',
    '/lap-dat-dien-mat-troi-gia-dinh',
    '/lien-he',
    '/thue-he-thong-dien-mat-troi',
    '/tuyen-dung',
    '/vat-tu-dien-mat-troi',
    '/ve-soliq',
  ])
}

export async function updateVeSoliqConfig(formData: FormData) {
  await requireSuperAdmin()

  function getString(key: string): string {
    const value = formData.get(key)
    return typeof value === 'string' ? value.trim() : ''
  }

  function getStringArray(key: string): string[] {
    const value = formData.get(key)
    if (typeof value !== 'string') return []
    return value
      .split(/\r?\n\r?\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
  }

  function getStats(): { value: string; label: string }[] {
    const items: { value: string; label: string }[] = []
    for (let i = 0; i < 8; i++) {
      const value = getString(`stat_${i}_value`)
      const label = getString(`stat_${i}_label`)
      if (value && label) items.push({ value, label })
    }
    return items
  }

  function getCoreValues(): { title: string; desc: string }[] {
    const items: { title: string; desc: string }[] = []
    for (let i = 0; i < 8; i++) {
      const title = getString(`coreValue_${i}_title`)
      const desc = getString(`coreValue_${i}_desc`)
      if (title && desc) items.push({ title, desc })
    }
    return items
  }

  const config = {
    heroEyebrow: getString('heroEyebrow'),
    heroTitle: getString('heroTitle'),
    heroDescription: getString('heroDescription'),
    stats: getStats(),
    storyTitle: getString('storyTitle'),
    storyParagraphs: getStringArray('storyParagraphs'),
    coreValuesTitle: getString('coreValuesTitle'),
    coreValues: getCoreValues(),
    galleryEyebrow: getString('galleryEyebrow'),
    galleryTitle: getString('galleryTitle'),
    galleryDescription: getString('galleryDescription'),
    contactTitle: getString('contactTitle'),
    contactAddress: getString('contactAddress'),
    contactEmail: getString('contactEmail'),
  }

  await db.insert(settings).values({ key: 've_soliq_config', valueJson: config })
    .onConflictDoUpdate({
      target: [settings.key],
      set: { valueJson: config, updatedAt: new Date() },
    })

  revalidateTag('ve-soliq-config', 'max')
  revalidatePath('/ve-soliq')
  revalidatePath('/admin/ve-soliq-config')
  firePurgePaths(['/ve-soliq'])
}

export async function updateSolarAssumptions(formData: FormData) {
  await requireSuperAdmin()
  const assumptions = buildSolarAssumptionsFromForm(formData)

  await db.insert(settings).values({ key: 'solar_assumptions', valueJson: assumptions })
    .onConflictDoUpdate({
      target: [settings.key],
      set: { valueJson: assumptions, updatedAt: new Date() },
    })

  revalidateTag('quote-assumptions', 'max')
  revalidatePath('/')
  revalidatePath('/bao-gia-dien-mat-troi')
  revalidatePath('/admin/settings')
  revalidatePath('/admin/pricing')
  firePurgePaths(['/', '/bao-gia-dien-mat-troi'])
}

// ─── FAQS ─────────────────────────────────────────────────────────────────────

export async function getFaqs() {
  return db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id))
}

export async function getFaq(id: number) {
  const rows = await db.select().from(faqs).where(eq(faqs.id, id))
  return rows[0] || null
}

export async function getPublishedFaqs() {
  return db.select().from(faqs).where(eq(faqs.published, true)).orderBy(asc(faqs.sortOrder), asc(faqs.id))
}

export async function getFeaturedFaqs() {
  return db
    .select()
    .from(faqs)
    .where(eq(faqs.published, true))
    .orderBy(asc(faqs.sortOrder), asc(faqs.id))
    .then((rows) => rows.filter((r) => r.featured))
}

export async function createFaq(formData: FormData) {
  await requireSuperAdmin()
  const question = (formData.get('question') as string)?.trim()
  const answer = (formData.get('answer') as string)?.trim()
  if (!question || !answer) return
  const sortOrder = parseInt((formData.get('sortOrder') as string) || '0', 10) || 0
  const featured = formData.get('featured') === 'on'
  const published = formData.get('published') === 'on'

  await db.insert(faqs).values({ question, answer, sortOrder, featured, published })
  revalidateFaqs()
  redirect('/admin/faqs')
}

export async function updateFaq(id: number, formData: FormData) {
  await requireSuperAdmin()
  const question = (formData.get('question') as string)?.trim()
  const answer = (formData.get('answer') as string)?.trim()
  if (!question || !answer) return
  const sortOrder = parseInt((formData.get('sortOrder') as string) || '0', 10) || 0
  const featured = formData.get('featured') === 'on'
  const published = formData.get('published') === 'on'

  await db
    .update(faqs)
    .set({ question, answer, sortOrder, featured, published, updatedAt: new Date() })
    .where(eq(faqs.id, id))
  revalidateFaqs()
  redirect('/admin/faqs')
}

export async function deleteFaq(id: number) {
  await requireSuperAdmin()
  await db.delete(faqs).where(eq(faqs.id, id))
  revalidateFaqs()
}

function revalidatePricing() {
  revalidateTag('pricing', 'max')
  revalidatePath('/admin/pricing')
  revalidatePath('/lap-dat-dien-mat-troi-gia-dinh')
  revalidatePath('/dien-mat-troi-doanh-nghiep')
  revalidatePath('/he-thong-hybrid-luu-tru')
  revalidatePath('/vat-tu-dien-mat-troi')
  firePurgePaths([
    '/lap-dat-dien-mat-troi-gia-dinh',
    '/dien-mat-troi-doanh-nghiep',
    '/he-thong-hybrid-luu-tru',
    '/vat-tu-dien-mat-troi',
  ])
}

export async function createPricingPackage(formData: FormData) {
  await requireSuperAdmin()
  const page = formData.get('page') as string
  const category = (formData.get('category') as string) || null
  const cap = (formData.get('cap') as string) || null
  const panels = (formData.get('panels') as string) || null
  const inv = (formData.get('inv') as string) || null
  const bat = (formData.get('bat') as string) || null
  const fit = (formData.get('fit') as string) || null
  const name = (formData.get('name') as string) || null
  const spec = (formData.get('spec') as string) || null
  const note = (formData.get('note') as string) || null
  const priceRaw = formData.get('price') as string
  const price = priceRaw ? parseInt(priceRaw.replace(/\D/g, '')) : null
  const [{ maxOrder }] = await db.select({ maxOrder: max(pricingPackages.sortOrder) }).from(pricingPackages).where(eq(pricingPackages.page, page))
  const sortOrder = (maxOrder ?? 0) + 1
  await db.insert(pricingPackages).values({ page, category, sortOrder, cap, panels, inv, bat, fit, name, spec, note, price })
  revalidatePricing()
}

export async function updatePricingPackage(id: number, formData: FormData) {
  await requireSuperAdmin()
  const category = (formData.get('category') as string) || null
  const cap = (formData.get('cap') as string) || null
  const panels = (formData.get('panels') as string) || null
  const inv = (formData.get('inv') as string) || null
  const bat = (formData.get('bat') as string) || null
  const fit = (formData.get('fit') as string) || null
  const name = (formData.get('name') as string) || null
  const spec = (formData.get('spec') as string) || null
  const note = (formData.get('note') as string) || null
  const priceRaw = formData.get('price') as string
  const price = priceRaw ? parseInt(priceRaw.replace(/\D/g, '')) : null
  await db.update(pricingPackages)
    .set({ category, cap, panels, inv, bat, fit, name, spec, note, price, updatedAt: new Date() })
    .where(eq(pricingPackages.id, id))
  revalidatePricing()
}

export async function deletePricingPackage(id: number) {
  await requireSuperAdmin()
  await db.delete(pricingPackages).where(eq(pricingPackages.id, id))
  revalidatePricing()
}

export async function reorderPricingPackages(ids: number[]) {
  await requireSuperAdmin()
  const orderedIds = Array.from(new Set(ids)).filter((id) => Number.isInteger(id) && id > 0)
  for (const [index, id] of orderedIds.entries()) {
    await db.update(pricingPackages).set({ sortOrder: index + 1, updatedAt: new Date() }).where(eq(pricingPackages.id, id))
  }
  revalidatePricing()
}
