"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Youtube, ChevronDown } from "lucide-react"

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (!trimmed) return null
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  )
  return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0` : null
}

export function YoutubeEmbed() {
  const { t } = useLanguage()
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/media-sosial")
      .then((res) => res.json())
      .then((data) => setYoutubeUrls(Array.isArray(data.youtubeUrls) ? data.youtubeUrls : []))
      .catch(() => setYoutubeUrls([]))
      .finally(() => setLoading(false))
  }, [])

  const embedUrls = youtubeUrls
    .map((url) => getYouTubeEmbedUrl(url))
    .filter((url): url is string => url !== null)

  if (loading) {
    return (
      <div className="flex aspect-video min-h-[200px] w-full items-center justify-center overflow-hidden rounded-lg bg-[#0f0f0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  if (embedUrls.length === 0) {
    return (
      <div className="flex aspect-video min-h-[200px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-muted/30">
        <Youtube className="h-12 w-12 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-sm text-muted-foreground">
          {t("social.noVideo")}
        </p>
      </div>
    )
  }

  const hasMoreVideos = embedUrls.length > 2

  return (
    <div className="relative flex min-h-[320px] max-h-[420px] flex-col">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden pr-1">
        {embedUrls.map((embedUrl, index) => (
          <div
            key={index}
            className="aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-black"
          >
            <iframe
              src={embedUrl}
              title={`YouTube video ${index + 1} - Lembaga Industri Getah Sabah`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ))}
      </div>
      {hasMoreVideos && (
        <div className="mt-2 flex shrink-0 items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          <span>{t("social.scrollForMore")}</span>
        </div>
      )}
    </div>
  )
}
