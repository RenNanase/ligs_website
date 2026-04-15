import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"
import sharp from "sharp"
import { prisma } from "@/lib/prisma"
import { galleryFolderSlugFromTitle } from "@/lib/gallery-upload-path"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB per file
/** Per-request batch cap (client may send multiple requests for huge selections). */
const MAX_FILES_PER_REQUEST = 200
const IMAGE_SIZE = 600
const DEFAULT_QUALITY = 90
const MIN_QUALITY = 70

const GALLERY_ROOT = path.join(process.cwd(), "public", "uploads", "gallery")

async function processImage(buffer: Buffer): Promise<{ buffer: Buffer; ext: string }> {
  let quality = DEFAULT_QUALITY
  let result = await sharp(buffer)
    .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer()

  while (result.length > MAX_FILE_SIZE && quality > MIN_QUALITY) {
    quality -= 10
    result = await sharp(buffer)
      .resize(IMAGE_SIZE, IMAGE_SIZE, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()
  }

  return { buffer: result, ext: ".jpg" }
}

async function resolveSubfolder(params: {
  eventId: string | null
  eventTitle: string | null
}): Promise<{ slug: string; error?: string }> {
  const { eventId, eventTitle } = params

  if (eventId) {
    const ev = await prisma.galleryEvent.findUnique({
      where: { id: eventId },
      select: { title: true },
    })
    if (!ev) {
      return { slug: "", error: "Event not found" }
    }
    return { slug: galleryFolderSlugFromTitle(ev.title) }
  }

  if (eventTitle?.trim()) {
    return { slug: galleryFolderSlugFromTitle(eventTitle) }
  }

  return {
    slug: "",
    error: "Provide eventId or eventTitle so images can be stored in the correct folder.",
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const url = new URL(request.url)
  const eventIdFromQuery = url.searchParams.get("eventId")?.trim() || null
  const eventTitleFromQuery = url.searchParams.get("eventTitle")?.trim() || null

  const formData = await request.formData()
  const files = formData.getAll("files").filter((f): f is Blob => f instanceof Blob)
  const singleFile = formData.get("file")
  const eventIdFromBody = typeof formData.get("eventId") === "string" ? String(formData.get("eventId")).trim() : null
  const eventTitleFromBody =
    typeof formData.get("eventTitle") === "string" ? String(formData.get("eventTitle")).trim() : null

  const eventId = eventIdFromQuery || eventIdFromBody || null
  const eventTitle = eventTitleFromQuery || eventTitleFromBody || null

  const { slug, error: folderError } = await resolveSubfolder({ eventId, eventTitle })
  if (folderError || !slug) {
    return NextResponse.json({ error: folderError ?? "Invalid folder" }, { status: 400 })
  }

  const toProcess = files.length > 0 ? files : singleFile instanceof Blob ? [singleFile] : []

  if (toProcess.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 })
  }

  if (toProcess.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json(
      { error: `Maximum ${MAX_FILES_PER_REQUEST} files per request. Upload in batches.` },
      { status: 400 }
    )
  }

  const targetDir = path.join(GALLERY_ROOT, slug)
  await mkdir(targetDir, { recursive: true })

  const results: { url: string; error?: string }[] = []

  for (const file of toProcess) {
    if (!ALLOWED_TYPES.has(file.type)) {
      results.push({ url: "", error: `Invalid format: ${file.name || "file"}. Use JPEG or PNG.` })
      continue
    }

    if (file.size > MAX_FILE_SIZE) {
      results.push({
        url: "",
        error: `File too large: ${file.name || "file"}. Max 10MB.`,
      })
      continue
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const { buffer: finalBuffer, ext } = await processImage(buffer)
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`
      await writeFile(path.join(targetDir, uniqueName), finalBuffer)
      results.push({ url: `/uploads/gallery/${slug}/${uniqueName}` })
    } catch (err) {
      console.error("Gallery upload error:", err)
      results.push({ url: "", error: `Failed to process ${file.name || "file"}` })
    }
  }

  const urls = results.filter((r) => r.url).map((r) => r.url)
  const errors = results.filter((r) => r.error).map((r) => r.error)

  if (urls.length > 0) await updateLastUpdated()
  return NextResponse.json({
    urls,
    errors: errors.length > 0 ? errors : undefined,
  })
}
