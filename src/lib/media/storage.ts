import { randomUUID } from 'node:crypto'
import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const COMPRESSED_IMAGE_MIME_TYPE = 'image/webp'
const COMPRESSED_IMAGE_EXTENSION = 'webp'
const COMPRESSED_IMAGE_MAX_WIDTH = 1200
const COMPRESSED_IMAGE_QUALITY = 78

const IMAGE_MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export type StoredImage = {
  url: string
  storagePath: string
  originalName: string
  mimeType: string
  sizeBytes: number
}

export function getUploadsRoot() {
  return path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'))
}

function getImageExtension(file: File) {
  const mimeExtension = IMAGE_MIME_EXTENSIONS[file.type]
  if (mimeExtension) return mimeExtension

  const originalExtension = path.extname(file.name).replace('.', '').toLowerCase()
  if (Object.values(IMAGE_MIME_EXTENSIONS).includes(originalExtension)) {
    return originalExtension
  }

  return null
}

async function compressImage(file: File) {
  const inputBuffer = Buffer.from(await file.arrayBuffer())
  return sharp(inputBuffer, { animated: false })
    .rotate()
    .resize({
      width: COMPRESSED_IMAGE_MAX_WIDTH,
      withoutEnlargement: true,
    })
    .webp({
      quality: COMPRESSED_IMAGE_QUALITY,
      effort: 5,
    })
    .toBuffer()
}

function getUploadSubdir() {
  const now = new Date()
  return `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

export async function saveUploadedImage(file: File, namespace: string): Promise<StoredImage> {
  if (!file || file.size === 0) {
    throw new Error('Chưa chọn ảnh để upload.')
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Ảnh upload không được vượt quá 10MB.')
  }

  const extension = getImageExtension(file)
  if (!extension || !IMAGE_MIME_EXTENSIONS[file.type]) {
    throw new Error('Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc GIF.')
  }

  const safeNamespace = namespace.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
  const subdir = `${safeNamespace}/${getUploadSubdir()}`
  const filename = `${randomUUID()}.${COMPRESSED_IMAGE_EXTENSION}`
  const storagePath = `${subdir}/${filename}`
  const absoluteDir = path.join(getUploadsRoot(), subdir)
  const absolutePath = path.join(absoluteDir, filename)
  const compressedImage = await compressImage(file)

  await mkdir(absoluteDir, { recursive: true })
  await writeFile(absolutePath, compressedImage)

  return {
    url: `/uploads/${storagePath}`,
    storagePath,
    originalName: file.name,
    mimeType: COMPRESSED_IMAGE_MIME_TYPE,
    sizeBytes: compressedImage.byteLength,
  }
}

export async function readStoredUpload(storagePath: string) {
  const root = getUploadsRoot()
  const absolutePath = path.resolve(root, storagePath)
  const relative = path.relative(root, absolutePath)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return null
  }

  const info = await stat(absolutePath).catch(() => null)
  if (!info?.isFile()) return null

  return {
    bytes: await readFile(absolutePath),
    size: info.size,
    mtime: info.mtime,
    absolutePath,
  }
}

export async function deleteStoredUpload(storagePath: string) {
  const root = getUploadsRoot()
  const absolutePath = path.resolve(root, storagePath)
  const relative = path.relative(root, absolutePath)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return
  }

  await unlink(absolutePath).catch(() => undefined)
}

export function contentTypeForStoragePath(storagePath: string) {
  const extension = path.extname(storagePath).toLowerCase()
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.png') return 'image/png'
  if (extension === '.webp') return 'image/webp'
  if (extension === '.gif') return 'image/gif'
  return 'application/octet-stream'
}
