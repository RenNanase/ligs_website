import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/svg+xml",
])

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "perkhidmatan")

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
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
      { error: "Invalid file type. Allowed: PNG, JPG, JPEG, SVG" },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 2 MB" },
      { status: 400 }
    )
  }

  const ext = EXT_MAP[file.type] || ".bin"
  const uniqueName = `logo-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`

  await mkdir(UPLOAD_DIR, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOAD_DIR, uniqueName), buffer)

  await updateLastUpdated()
  const filePath = `/uploads/perkhidmatan/${uniqueName}`
  return NextResponse.json({ url: filePath, path: filePath })
}
