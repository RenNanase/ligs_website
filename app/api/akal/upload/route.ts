import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import crypto from "crypto"

const ALLOWED_TYPES = new Set(["application/pdf", "application/x-pdf"])
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "akal")

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("file")

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Tiada fail disediakan." }, { status: 400 })
  }

  const isPdf =
    ALLOWED_TYPES.has(file.type) ||
    (typeof file === "object" && "name" in file && (file as File).name?.toLowerCase().endsWith(".pdf"))
  if (!isPdf) {
    return NextResponse.json({ error: "Hanya fail PDF dibenarkan." }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Saiz fail maksimum 10 MB." }, { status: 400 })
  }

  const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.pdf`
  await mkdir(UPLOAD_DIR, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(UPLOAD_DIR, uniqueName), buffer)

  const url = `/uploads/akal/${uniqueName}`
  return NextResponse.json({ url })
}
