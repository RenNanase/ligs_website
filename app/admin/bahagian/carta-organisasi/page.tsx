"use client"

import { AdminLayout } from "@/components/admin-layout"
import { ImageUpload } from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink } from "lucide-react"

export default function AdminCartaOrganisasiPage() {
  const [centerImage, setCenterImage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/carta-organisasi")
      .then((res) => res.json())
      .then((data) => setCenterImage(data.centerImage || ""))
      .catch(() => setCenterImage(""))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/carta-organisasi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centerImage: centerImage || null }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Carta Organisasi image saved successfully")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <Link
          href="/admin/bahagian"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bahagian
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Carta Organisasi LIGS
        </h1>
        <p className="mt-1 text-muted-foreground">
          Upload the organisational chart image to display in the center of the Carta Organisasi page.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-foreground">Center Image</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              This image appears prominently in the middle of the Carta Organisasi page. Use a clear, high-quality organisational chart or structure diagram.
            </p>
            <ImageUpload
              value={centerImage}
              onChange={setCenterImage}
              uploadPath="/api/bahagian/upload"
              aspectRatio="video"
              maxSize={20 * 1024 * 1024}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Link href="/info-korporat/carta-organisasi" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Preview Page
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
