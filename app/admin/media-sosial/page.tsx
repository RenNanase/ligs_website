"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft, ExternalLink, Youtube, Plus, Trash2 } from "lucide-react"

const MAX_VIDEOS = 6

export default function AdminMediaSosialPage() {
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = () => {
    fetch("/api/media-sosial")
      .then((res) => res.json())
      .then((data) => setYoutubeUrls(Array.isArray(data.youtubeUrls) ? data.youtubeUrls : []))
      .catch(() => setYoutubeUrls([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleUrlChange = (index: number, value: string) => {
    setYoutubeUrls((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleAdd = () => {
    if (youtubeUrls.length >= MAX_VIDEOS) return
    setYoutubeUrls((prev) => [...prev, ""])
  }

  const handleRemove = (index: number) => {
    setYoutubeUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const urls = youtubeUrls.filter((u) => u.trim() !== "")
      const res = await fetch("/api/media-sosial", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrls: urls }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success("YouTube URLs saved")
      setYoutubeUrls(urls)
    } catch {
      toast.error("Failed to save YouTube URLs")
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
          Media Sosial
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage the YouTube videos shown in the Media Sosial section on the homepage. Add multiple video URLs and they will be displayed inside the YouTube card.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="max-w-4xl rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                <h2 className="font-semibold text-foreground">YouTube Video Links</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdd}
                disabled={youtubeUrls.length >= MAX_VIDEOS}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Video
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="w-12 px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                    YouTube Video URL
                  </th>
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {youtubeUrls.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No videos added. Click &quot;Add Video&quot; to add YouTube links.
                    </td>
                  </tr>
                ) : (
                  youtubeUrls.map((url, index) => (
                    <tr key={index} className="transition-colors hover:bg-muted/20">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(index)}
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {youtubeUrls.length} / {MAX_VIDEOS} videos. Supported formats: youtube.com/watch?v=..., youtu.be/...
            </p>
            <div className="flex gap-2">
              <Link href="/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Preview Homepage
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
