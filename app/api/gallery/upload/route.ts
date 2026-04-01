import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"
import sharp from "sharp"

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB per file
const MAX_IMAGES = 20
const IMAGE_SIZE = 600
const DEFAULT_QUALITY = 90
const MIN_QUALITY = 70

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery")

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

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const formData = await request.formData()
  const files = formData.getAll("files").filter((f): f is Blob => f instanceof Blob)
  const singleFile = formData.get("file")
  const toProcess = files.length > 0 ? files : singleFile instanceof Blob ? [singleFile] : []

  if (toProcess.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 })
  }

  if (toProcess.length > MAX_IMAGES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_IMAGES} images per upload` },
      { status: 400 }
    )
  }

  const results: { url: string; error?: string }[] = []

  await mkdir(UPLOAD_DIR, { recursive: true })

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
      await writeFile(path.join(UPLOAD_DIR, uniqueName), finalBuffer)
      results.push({ url: `/uploads/gallery/${uniqueName}` })
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
