"use client"

import { useParams } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { getImageUrl } from "@/lib/image-utils"
import { PageHeader } from "@/components/sections/page-header"
import { Calendar, Tag, ArrowLeft, Newspaper, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useMemo, useState, useEffect, useCallback } from "react"

function NewsImageCarousel({ images }: { images: string[] }) {
  const validImages = useMemo(
    () => images.map((url) => getImageUrl(url)).filter(Boolean),
    [images]
  )
  const [current, setCurrent] = useState(0)
  const total = validImages.length

  const goTo = useCallback((index: number) => {
    setCurrent((i) => (index + total) % total)
  }, [total])

  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [goTo])

  useEffect(() => {
    if (total <= 1) return
    const interval = setInterval(goNext, 5000)
    return () => clearInterval(interval)
  }, [total, goNext])

  if (validImages.length === 0) return null

  if (validImages.length === 1) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img
          src={validImages[0]}
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted">
      {validImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          aria-hidden={index !== current}
        >
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </div>
      ))}
      {/* Prev / Next */}
      <button
        type="button"
        onClick={goPrev}
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={goNext}
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {validImages.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all ${
              index === current
                ? "w-6 bg-white"
                : "w-2 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to image ${index + 1}`}
            aria-current={index === current ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  )
}

export default function NewsDetailPage() {
  const params = useParams()
  const { language, t } = useLanguage()
  const { news, isLoading } = useDataStore()
  const [fetchedArticle, setFetchedArticle] = useState<(typeof news)[0] | null>(null)
  const [fetching, setFetching] = useState(false)

  const id = params.id as string
  const articleFromStore = useMemo(() => news.find((n) => n.id === id), [news, id])
  const article = articleFromStore ?? fetchedArticle

  // Fetch from API when not in store (e.g. archived article)
  useEffect(() => {
    if (articleFromStore || !id || isLoading) return
    setFetching(true)
    fetch(`/api/news/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data)
          setFetchedArticle({
            id: data.id,
            title: data.title,
            titleMs: data.titleMs,
            content: data.content,
            contentMs: data.contentMs,
            date: data.date,
            category: data.category,
            images: data.images || [],
          })
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [id, articleFromStore, isLoading])

  if ((isLoading || fetching) && !article) {
    return (
      <>
        <PageHeader title={t("news.title")} />
        <section className="bg-primary-bg py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="text-muted-foreground">
              {language === "en" ? "Loading..." : "Memuatkan..."}
            </p>
          </div>
        </section>
      </>
    )
  }

  if (!article) {
    return (
      <>
        <PageHeader title={t("news.title")} />
        <section className="bg-primary-bg py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-6 text-muted-foreground">
              {language === "en" ? "Article not found." : "Artikel tidak dijumpai."}
            </p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              {language === "en" ? "Back to News" : "Kembali ke Berita"}
            </Link>
          </div>
        </section>
      </>
    )
  }

  const title = language === "en" ? article.title : article.titleMs
  const content = language === "en" ? article.content : article.contentMs
  const hasImages = article.images && article.images.length > 0

  return (
    <>
      <PageHeader title={t("news.title")}  />

      <article className="bg-primary-bg py-20">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/news"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === "en" ? "Back to News" : "Kembali ke Berita"}
          </Link>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Hero: single image or carousel when multiple */}
            {hasImages ? (
              <NewsImageCarousel images={article.images} />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                <Newspaper className="h-16 w-16 text-primary/30" />
              </div>
            )}

            <div className="p-8">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Tag className="h-3 w-3" />
                  {article.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.date).toLocaleDateString(
                    language === "en" ? "en-MY" : "ms-MY",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </span>
              </div>

              <h1 className="mb-6 font-heading text-3xl font-bold text-card-foreground md:text-4xl">
                {title}
              </h1>

              <div className="prose prose-neutral max-w-none text-muted-foreground">
                <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
