import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { updateLastUpdated } from "@/lib/update-last-updated"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  try {
    const { id, imageId } = await params

    await prisma.galleryEventImage.deleteMany({
      where: { id: imageId, eventId: id },
    })

    await updateLastUpdated()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/gallery/events/[id]/images/[imageId] error:", err)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
