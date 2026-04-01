"use client"

import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { PageHeader } from "@/components/sections/page-header"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trophy, Calendar, Loader2, X } from "lucide-react"
import { useMemo, useState } from "react"

interface YearGroup {
  year: string
  items: {
    id: string
    title: string
    description: string
    achievementDate: string
    imageUrl: string
  }[]
}

export default function PencapaianPage() {
  const { language, t } = useLanguage()
  const { achievements, isLoading } = useDataStore()
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null)

  // Group by year and sort descending (newest year first, items within each year ascending)
  const grouped = useMemo<YearGroup[]>(() => {
    const map = new Map<string, YearGroup["items"]>()

    for (const a of achievements) {
      const year = a.achievementDate.slice(0, 4)
      if (!map.has(year)) map.set(year, [])
      map.get(year)!.push(a)
    }

    // Sort items within each year ascending (earliest first)
    for (const items of map.values()) {
      items.sort((a, b) => a.achievementDate.localeCompare(b.achievementDate))
    }

    // Sort years descending (newest first)
    return Array.from(map.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([year, items]) => ({ year, items }))
  }, [achievements])

  return (
    <>
      {/* Image lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent
          className="max-h-[95vh] w-[95vw] sm:w-fit border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>button:last-of-type]:sr-only"
          onPointerDownOutside={() => setLightboxImage(null)}
        >
          <DialogTitle className="sr-only">
            {lightboxImage?.title} - {t("common.viewImage")}
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
                src={lightboxImage.url}
                alt={lightboxImage.title}
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

      <PageHeader title={t("achievements.title")} subtitle={t("achievements.subtitle")} />

      {/* Timeline */}
      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-4xl px-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && grouped.length === 0 && (
            <div className="py-20 text-center">
              <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">{t("achievements.empty")}</p>
            </div>
          )}

          {!isLoading && grouped.length > 0 && (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-px" />

              {grouped.map((group) => (
                <div key={group.year} className="relative mb-16 last:mb-0">
                  {/* Year badge */}
                  <div className="relative z-10 mb-8 flex md:justify-center">
                    <span className="ml-1 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-lg md:ml-0">
                      <Calendar className="h-4 w-4" />
                      {group.year}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-8">
                    {group.items.map((item, idx) => {
                      const isLeft = idx % 2 === 0
                      const formattedDate = new Date(item.achievementDate).toLocaleDateString(
                        language === "en" ? "en-MY" : "ms-MY",
                        { day: "numeric", month: "long", year: "numeric" }
                      )

                      return (
                        <div key={item.id} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute left-5 top-6 z-10 -translate-x-1/2 md:left-1/2">
                            <div className="flex h-4 w-4 items-center justify-center rounded-full border-[3px] border-primary bg-background shadow-sm" />
                          </div>

                          {/* Card - mobile always right, desktop alternating */}
                          <div
                            className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                              isLeft ? "md:mr-auto md:pr-0" : "md:ml-auto md:pl-0"
                            }`}
                          >
                            <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-accent/50 hover:shadow-md">
                              {/* Image - clickable to open lightbox */}
                              {item.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => setLightboxImage({ url: item.imageUrl, title: item.title })}
                                  className="aspect-video block w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                >
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                </button>
                              )}

                              <div className="p-5">
                                {/* Date */}
                                <div className="mb-3">
                                  <time className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {formattedDate}
                                  </time>
                                </div>

                                {/* Title */}
                                <h3 className="mb-2 text-base font-semibold leading-snug text-card-foreground transition-colors group-hover:text-accent">
                                  {item.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </article>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Timeline end dot */}
              <div className="absolute -bottom-2 left-5 z-10 -translate-x-1/2 md:left-1/2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-lg">
                  <Trophy className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
