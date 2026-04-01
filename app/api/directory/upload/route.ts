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

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const AVATAR_SIZE = 256
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "directory")

async function processAvatar(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()
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
      { error: "File too large. Maximum size is 2 MB" },
      { status: 400 }
    )
  }

  try {
    const processed = await processAvatar(buffer)
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.jpg`
    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(path.join(UPLOAD_DIR, uniqueName), processed)
    await updateLastUpdated()
    const url = `/uploads/directory/${uniqueName}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error("Directory upload error:", err)
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    )
  }
}
