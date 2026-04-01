import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requirePermission("akal")
  if (!auth.authenticated) return auth.response

  const { id } = await params
  const submission = await prisma.akalSubmission.findUnique({ where: { id } })
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(submission)
}
