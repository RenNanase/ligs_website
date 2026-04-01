"use client"

import { useParams, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

const BAHAGIAN_SLUGS = new Set([
  "ahli-lembaga-pengarah",
  "bahagian-pengurus-besar",
  "bahagian-pentadbiran",
  "bahagian-kemajuan-pekebun-kecil",
  "bahagian-kewangan",
  "bahagian-skim-penempatan-getah",
  "bahagian-pembelian-getah",
  "bahagian-pemprosesan-pemasaran",
])

const SLUG_TO_TITLE_KEY: Record<string, string> = {
  direktori: "nav.corpinfo.direktori",
  "lagu-ligs": "nav.corpinfo.laguLigs",
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (!trimmed) return null
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  )
  return ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0` : null
}

export default function InfoKorporatPage() {
  const params = useParams()
  const router = useRouter()
  const slug = typeof params.slug === "string" ? params.slug : ""
  const { t } = useLanguage()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (BAHAGIAN_SLUGS.has(slug)) {
      router.replace(`/bahagian/${slug}`)
    } else if (slug === "direktori") {
      router.replace("/direktori")
    }
  }, [slug, router])

  useEffect(() => {
    if (slug === "lagu-ligs") {
      fetch("/api/lagu-ligs")
        .then((res) => res.json())
        .then((data) => setVideoUrl(data.videoUrl || null))
        .catch(() => setVideoUrl(null))
    }
  }, [slug])

  if (BAHAGIAN_SLUGS.has(slug) || slug === "direktori") {
    return null
  }

  const titleKey = SLUG_TO_TITLE_KEY[slug]
  const title = titleKey ? t(titleKey) : t("nav.corpinfo")
  const isLaguLigs = slug === "lagu-ligs"
  const embedUrl = isLaguLigs && videoUrl ? getYouTubeEmbedUrl(videoUrl) : null

  return (
    <>
      <PageHeader title={title} />
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-5xl px-6">
          {isLaguLigs && embedUrl ? (
            <div className="mx-auto max-w-3xl">
              <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted shadow-lg">
                <iframe
                  src={embedUrl}
                  title={t("nav.corpinfo.laguLigs")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-muted p-4">
                <Clock className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                {t("common.comingSoon")}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
