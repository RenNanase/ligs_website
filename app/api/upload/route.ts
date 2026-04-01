<<<<<<< HEAD
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

const EXT_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
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
=======
import { requireAuth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: jpeg, png, webp, gif" },
      { status: 400 },
>>>>>>> 91866b5ba89e98143037e30abed31cce5d1e3e33
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
<<<<<<< HEAD
      { error: "File too large. Maximum size is 5 MB" },
      { status: 400 }
    )
  }

  const ext = EXT_MAP[file.type] || ".bin"
  const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`

  await mkdir(UPLOAD_DIR, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  const filePath = path.join(UPLOAD_DIR, uniqueName)
  await writeFile(filePath, buffer)

  await updateLastUpdated()
  return NextResponse.json({ url: `/uploads/${uniqueName}` })
=======
      { error: "File too large. Max 5MB" },
      { status: 400 },
    )
  }

  const ext = file.name.split(".").pop() || "jpg"
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  await mkdir(uploadsDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(uploadsDir, filename), buffer)

  return NextResponse.json({ url: `/uploads/${filename}` })
>>>>>>> 91866b5ba89e98143037e30abed31cce5d1e3e33
}
