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
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_WIDTH = 1600
const MAX_HEIGHT = 1200
const DEFAULT_QUALITY = 85
const MIN_QUALITY = 60

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "calendar")

async function processImage(buffer: Buffer): Promise<{ buffer: Buffer; ext: string }> {
  let pipeline = sharp(buffer)
    .resize(MAX_WIDTH, MAX_HEIGHT, { fit: "inside", withoutEnlargement: true })

  let quality = DEFAULT_QUALITY
  let result = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()

  while (result.length > MAX_FILE_SIZE && quality > MIN_QUALITY) {
    quality -= 10
    result = await sharp(buffer)
      .resize(MAX_WIDTH, MAX_HEIGHT, { fit: "inside", withoutEnlargement: true })
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
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
      { status: 400 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  if (buffer.length > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5 MB" },
      { status: 400 }
    )
  }

  try {
    const processed = await processImage(buffer)
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${processed.ext}`
    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(path.join(UPLOAD_DIR, uniqueName), processed.buffer)
    await updateLastUpdated()
    const url = `/uploads/calendar/${uniqueName}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error("Calendar upload error:", err)
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    )
  }
}
