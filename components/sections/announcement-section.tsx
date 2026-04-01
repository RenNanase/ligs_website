"use client"

import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pin, Calendar, ChevronRight, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function AnnouncementSection() {
  const { language, t } = useLanguage()
  const { announcements } = useDataStore()
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const activeAnnouncements = announcements.filter((a) => a.active !== false)
  const sorted = [...activeAnnouncements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const displayed = sorted.slice(0, 4)

  if (displayed.length === 0) return null

  return (
    <>
      {/* Image lightbox - same style as Sudut Integriti */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent
          className="max-h-[95vh] w-[95vw] sm:w-fit border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>button:last-of-type]:sr-only"
          onPointerDownOutside={() => setLightboxImage(null)}
        >
          <DialogTitle className="sr-only">
            {t("announcements.title")} - {t("common.viewImage")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Full-size image view. Click outside or press Escape to close.
          </DialogDescription>
          <div
            className="relative flex min-h-[75vh] items-center justify-center p-2 sm:min-h-0 sm:p-4"
            onClick={() => setLightboxImage(null)}
          >
            {lightboxImage && (
              <img
                src={lightboxImage}
                alt=""
                className="h-[85vh] max-h-[85vh] w-full max-w-full rounded-xl object-contain shadow-2xl ring-1 ring-white/10 sm:h-auto sm:w-auto"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxImage(null)
              }}
              className="absolute right-2 top-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 text-foreground shadow-xl backdrop-blur-sm transition hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary sm:right-6 sm:top-6 sm:h-11 sm:w-11"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold text-card-foreground md:text-4xl">
            {t("announcements.title")}
          </h2>
        </div>

        {/* Announcement List */}
        <div className="flex flex-col gap-3">
          {displayed.map((item, index) => {
            const title = language === "en" ? item.title : item.titleMs
            const summary = language === "en" ? item.summary : item.summaryMs
            const linkList = (Array.isArray(item.links) ? item.links.filter((l) => (l?.url ?? "").trim()) : []).length > 0
              ? item.links!.filter((l) => (l?.url ?? "").trim())
              : item.linkUrl?.trim()
                ? [{ url: item.linkUrl, text: (item.linkText || "Click here").trim() }]
                : []

            return (
              <Link
                key={item.id}
                href="/announcements"
                className={`group relative flex flex-col gap-4 rounded-xl border bg-card p-5 transition-all hover:shadow-md sm:flex-row sm:items-start ${
                  item.pinned
                    ? "border-accent/30 bg-accent/[0.03]"
                    : "border-border hover:border-accent/50"
                }`}
              >
                {/* Date column */}
                <div className="flex shrink-0 items-start gap-3 sm:w-36">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                      item.pinned ? "bg-accent/10" : "bg-primary/10"
                    }`}
                  >
                    {item.pinned ? (
                      <Pin className="h-5 w-5 text-accent" />
                    ) : (
                      <Calendar className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col sm:hidden">
                    <time
                      dateTime={item.date}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {new Date(item.date).toLocaleDateString(
                        language === "en" ? "en-MY" : "ms-MY",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </time>
                    {item.pinned && (
                      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        {t("announcements.pinned")}
                      </span>
                    )}
                  </div>
                  <div className="hidden flex-col sm:flex">
                    <time
                      dateTime={item.date}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {new Date(item.date).toLocaleDateString(
                        language === "en" ? "en-MY" : "ms-MY",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </time>
                    {item.pinned && (
                      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        {t("announcements.pinned")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 flex flex-col sm:flex-row gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-base font-semibold leading-snug text-card-foreground group-hover:text-accent transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {summary}
                    </p>
                    {linkList.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                        {linkList.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-accent hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {link.text?.trim() || (language === "en" ? "Click here" : "Klik di sini")}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.imageUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setLightboxImage(item.imageUrl!)
                      }}
                      className="shrink-0 w-full sm:w-40 md:w-48 self-start overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-accent/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="aspect-video w-full object-cover"
                      />
                    </button>
                  )}
                </div>

                {/* Arrow */}
                <div className="hidden shrink-0 self-center sm:block">
                  <ChevronRight className="h-5 w-5 text-muted-foreground/40 transition-colors group-hover:text-accent" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* View All - bottom right */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/announcements"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            {t("announcements.viewall")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
    </>
  )
}
