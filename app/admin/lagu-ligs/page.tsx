"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink } from "lucide-react"

export default function AdminLaguLigsPage() {
  const [videoUrl, setVideoUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch("/api/lagu-ligs")
      .then((res) => res.json())
      .then((data) => setVideoUrl(data.videoUrl || ""))
      .catch(() => setVideoUrl(""))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/lagu-ligs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: videoUrl.trim() || null }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("Video URL saved")
    } catch {
      toast.error("Failed to save video URL")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-heading text-3xl font-bold text-foreground">
          Lagu LIGS
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage the LIGS song video. Enter a YouTube URL and it will appear centered on the public Lagu LIGS page.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-foreground">Video URL</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter a YouTube URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)
          </p>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-4 flex flex-wrap gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {saving ? "Saving..." : "Save Video URL"}
            </Button>
            <Link href="/info-korporat/lagu-ligs" target="_blank" rel="noopener noreferrer">
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
