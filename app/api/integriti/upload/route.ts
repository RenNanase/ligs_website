import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"
import sharp from "sharp"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const THUMB_SIZE = 512
const DEFAULT_QUALITY = 90
const MIN_QUALITY = 70

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "integriti")

async function processImage(buffer: Buffer): Promise<{ buffer: Buffer; ext: string }> {
  // Resize to 512x512 with cover (crops to fill, maintains aspect ratio, no distortion)
  let quality = DEFAULT_QUALITY
  let result = await sharp(buffer)
    .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover", position: "center" })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer()

  while (result.length > MAX_FILE_SIZE && quality > MIN_QUALITY) {
    quality -= 10
    result = await sharp(buffer)
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: "cover", position: "center" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()
  }

  return { buffer: result, ext: ".jpg" }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const formData = await request.formData()
  const file = formData.get("file")

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let finalBuffer: Buffer
  let ext: string

  try {
    const processed = await processImage(buffer)
    finalBuffer = processed.buffer
    ext = processed.ext
  } catch (err) {
    console.error("Image processing error:", err)
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    )
  }

  const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`

  await mkdir(UPLOAD_DIR, { recursive: true })
  await writeFile(path.join(UPLOAD_DIR, uniqueName), finalBuffer)

  await updateLastUpdated()
  const filePath = `/uploads/integriti/${uniqueName}`
  return NextResponse.json({ url: filePath, path: filePath })
}
