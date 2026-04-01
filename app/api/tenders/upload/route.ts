import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/auth"
import { updateLastUpdated } from "@/lib/update-last-updated"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const ALLOWED_TYPES = new Set(["application/pdf"])
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "tenders")

export async function POST(request: Request) {
  const auth = await requirePermission("tenders")
  if (!auth.authenticated) return auth.response

  const formData = await request.formData()
  const file = formData.get("file")

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Only PDF is allowed." }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large. Maximum size is 10 MB" }, { status: 400 })
  }

  const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.pdf`
  await mkdir(UPLOAD_DIR, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOAD_DIR, uniqueName), buffer)

  await updateLastUpdated()
  const url = `/uploads/tenders/${uniqueName}`
  return NextResponse.json({ url })
}
