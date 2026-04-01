"use client"

import { useLanguage } from "@/lib/language-context"
import { api, type KelabSukanPublic } from "@/lib/api-client"
import { Trophy, Newspaper, Calendar, User, X } from "lucide-react"
import { useEffect, useState, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

type BeritaArticle = NonNullable<KelabSukanPublic["news"]>[number]

function formatPeriod(start: string, end: string | null) {
  const s = new Date(start).getFullYear()
  if (!end) return `${s} - Present`
  const e = new Date(end).getFullYear()
  return `${s} - ${e}`
}

type TabType = "pengenalan" | "berita" | "sejarah"

export default function KelabSukanPage() {
  const { language, t } = useLanguage()
  const [data, setData] = useState<KelabSukanPublic | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("pengenalan")
  const [selectedArticle, setSelectedArticle] = useState<BeritaArticle | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCardClick = (article: BeritaArticle) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
    clickTimeoutRef.current = setTimeout(() => setSelectedArticle(article), 250)
  }

  const handleImageDoubleClick = (e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
      clickTimeoutRef.current = null
    }
    setLightboxImage(url)
  }

  useEffect(() => {
    api
      .getKelabSukan()
      .then(setData)
      .catch(() => setData({ news: [], logo: null, intro: "", presidents: [] }))
      .finally(() => setLoading(false))
  }, [])

  const hasIntro = (data?.logo && data.logo.trim()) || (data?.intro && data.intro.trim())
  const hasNews = (data?.news?.length ?? 0) > 0
  const hasPresidents = (data?.presidents?.length ?? 0) > 0

  // Group berita by year (newest first)
  const beritaByYear = useMemo(() => {
    if (!data?.news) return []
    const grouped = new Map<number, typeof data.news>()
    for (const article of data.news) {
      const year = new Date(article.datePosted).getFullYear()
      if (!grouped.has(year)) grouped.set(year, [])
      grouped.get(year)!.push(article)
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => b - a)
  }, [data?.news])

  useEffect(() => {
    if (!data) return
    if (activeTab === "pengenalan" && !hasIntro && hasNews) setActiveTab("berita")
    if (activeTab === "pengenalan" && !hasIntro && hasPresidents) setActiveTab("sejarah")
    if (activeTab === "berita" && !hasNews && hasPresidents) setActiveTab("sejarah")
    if (activeTab === "berita" && !hasNews && hasIntro) setActiveTab("pengenalan")
    if (activeTab === "sejarah" && !hasPresidents && hasNews) setActiveTab("berita")
    if (activeTab === "sejarah" && !hasPresidents && hasIntro) setActiveTab("pengenalan")
  }, [data, activeTab, hasIntro, hasNews, hasPresidents])

  if (loading) {
    return (
      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </section>
    )
  }

  const hasContent = hasIntro || hasNews || hasPresidents

  if (!hasContent) {
    return (
      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">{t("common.comingSoon")}</p>
        </div>
      </section>
    )
  }

  const pengenalanLabel = t("kelabSukan.pengenalan")
  const beritaLabel = language === "en" ? "News & Updates" : "Berita & Kemaskini"
  const sejarahLabel = language === "en" ? "President History" : "Sejarah Presiden"

  return (
    <div className="bg-primary-bg">
      {/* Berita full-content modal */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto bg-white dark:bg-white">
          <DialogTitle className="sr-only">{beritaLabel}</DialogTitle>
          <DialogDescription className="sr-only">
            {language === "en" ? "Full article content" : "Kandungan penuh artikel"}
          </DialogDescription>
          {selectedArticle && (
            <div className="space-y-4">
              {selectedArticle.featuredImage && (
                <div
                  className="relative cursor-zoom-in overflow-hidden rounded-lg bg-muted"
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setLightboxImage(selectedArticle.featuredImage)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setLightboxImage(selectedArticle.featuredImage)}
                  aria-label={t("common.viewImage")}
                >
                  <img
                    src={selectedArticle.featuredImage}
                    alt=""
                    className="w-full max-h-80 object-contain"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(selectedArticle.datePosted).toLocaleDateString(
                  language === "en" ? "en-US" : "ms-MY",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                {selectedArticle.title}
              </h2>
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-p:text-foreground prose-p:leading-relaxed prose-p:text-justify"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image full-view lightbox (like Sudut Integriti) */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent
          className="max-h-[95vh] w-[95vw] sm:w-fit border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>button:last-of-type]:sr-only"
          onPointerDownOutside={() => setLightboxImage(null)}
        >
          <DialogTitle className="sr-only">{t("common.viewImage")}</DialogTitle>
          <DialogDescription className="sr-only">
            Full-size image view. Double-click to open. Click outside or press Escape to close.
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

      {/* Mini menu - sticky at top */}
      <nav className="sticky top-0 z-20 border-b border-border bg-primary-bg/95 backdrop-blur supports-[backdrop-filter]:bg-primary-bg/90">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-1 px-6 py-3">
          {hasIntro && (
            <button
              type="button"
              onClick={() => setActiveTab("pengenalan")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "pengenalan"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/20 hover:text-accent"
              )}
            >
              {pengenalanLabel}
            </button>
          )}
          {hasNews && (
            <button
              type="button"
              onClick={() => setActiveTab("berita")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "berita"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/20 hover:text-accent"
              )}
            >
              {beritaLabel}
            </button>
          )}
          {hasPresidents && (
            <button
              type="button"
              onClick={() => setActiveTab("sejarah")}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === "sejarah"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/20 hover:text-accent"
              )}
            >
              {sejarahLabel}
            </button>
          )}
        </div>
      </nav>

      {/* Pengenalan tab - Introduction content only */}
      {hasIntro && activeTab === "pengenalan" && (
        <section className="px-6 py-12">
          <div className="mx-auto max-w-3xl">
            {data?.logo && (
              <div className="mb-8 flex justify-center">
                <img
                  src={data.logo}
                  alt="Kelab Sukan"
                  className="h-24 w-auto max-w-[280px] object-contain sm:h-28 sm:max-w-[320px]"
                  style={{ width: "auto" }}
                />
              </div>
            )}
            {data?.intro && data.intro.trim() && (
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-p:text-foreground prose-p:leading-relaxed prose-p:text-justify"
                dangerouslySetInnerHTML={{ __html: data.intro }}
              />
            )}
          </div>
        </section>
      )}

      {/* Berita & Kemaskini tab - Grid layout by year, 6 per row */}
      {hasNews && activeTab === "berita" && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 font-heading text-2xl font-bold text-foreground flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              {beritaLabel}
            </h2>

            {beritaByYear.map(([year, articles]) => (
              <div key={year} className="mb-16">
                <h3 className="mb-6 font-heading text-xl font-semibold text-foreground border-b border-primary pb-2">
                  {year}
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {articles.map((article) => (
                    <article
                      key={article.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleCardClick(article)}
                      onKeyDown={(e) => e.key === "Enter" && handleCardClick(article)}
                      className="cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      {article.featuredImage ? (
                        <div
                          className="aspect-[4/3] max-h-72 overflow-hidden bg-muted/30 sm:max-h-80 lg:max-h-88"
                          onDoubleClick={(e) => handleImageDoubleClick(e, article.featuredImage!)}
                        >
                          <img
                            src={article.featuredImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[4/3] flex max-h-72 items-center justify-center bg-muted/30 sm:max-h-80 lg:max-h-88">
                          <Newspaper className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="mb-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {new Date(article.datePosted).toLocaleDateString(
                            language === "en" ? "en-US" : "ms-MY",
                            { year: "numeric", month: "short", day: "numeric" }
                          )}
                        </p>
                        <h4 className="line-clamp-3 font-heading text-sm font-medium text-card-foreground">
                          {article.title}
                        </h4>
                        <div
                          className="mt-2 line-clamp-2 text-xs text-muted-foreground prose prose-sm max-w-none dark:prose-invert prose-p:my-0 prose-p:text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Presidents section - shown when tab is sejarah */}
      {hasPresidents && activeTab === "sejarah" && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 font-heading text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              {sejarahLabel}
            </h2>
            <div className="space-y-8">
              {data!.presidents.map((president, index) => {
                const isLeft = index % 2 === 0
                return (
                  <div
                    key={president.id}
                    className={cn(
                      "flex items-stretch gap-6",
                      isLeft ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    <div className="w-28 shrink-0 sm:w-32">
                      <div className="aspect-square overflow-hidden rounded-2xl border-2 border-primary/20 shadow-md">
                        <img
                          src={president.imageUrl}
                          alt={president.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center rounded-xl border border-border bg-card px-6 py-5 shadow-sm">
                      <h3 className="font-heading text-lg font-semibold text-card-foreground">
                        {president.name}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-primary">
                        {formatPeriod(president.startDate, president.endDate)}
                      </p>
                      {president.description && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {president.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
