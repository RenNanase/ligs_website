"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { getThumbnailImage } from "@/lib/image-utils"
import { ArrowRight, Calendar, ChevronRight, Newspaper } from "lucide-react"

export function ActivitySection() {
  const { language, t } = useLanguage()
  const { news } = useDataStore()

  // Sort by latest date and take 4 (1 featured + 3 behind)
  const sorted = [...news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const featured = sorted[0]
  const others = sorted.slice(1, 4)

  const renderFeaturedCard = (article: (typeof news)[0]) => {
    const articleTitle = language === "en" ? article.title : article.titleMs
    const articleContent = language === "en" ? article.content : article.contentMs
    const excerpt =
      articleContent.length > 180
        ? `${articleContent.slice(0, 180)}...`
        : articleContent

    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-accent/50 hover:shadow-lg">
        <div className="relative h-72 flex-shrink-0 overflow-hidden bg-primary/10 md:h-80">
          {getThumbnailImage(article.images) ? (
            <img
              src={getThumbnailImage(article.images)}
              alt=""
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
              <Newspaper className="h-12 w-12 text-primary/30" />
            </div>
          )}
          <div className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            {article.category}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString(
                language === "en" ? "en-MY" : "ms-MY",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </time>
          </div>
          <h3 className="mb-3 font-heading text-lg font-semibold leading-snug text-card-foreground line-clamp-2">
            {articleTitle}
          </h3>
          <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
            {excerpt}
          </p>
          <Link
            href={`/news/${article.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-accent"
          >
            {t("news.readmore")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    )
  }

  const renderCompactCard = (article: (typeof news)[0]) => {
    const articleTitle = language === "en" ? article.title : article.titleMs

    return (
      <Link
        key={article.id}
        href={`/news/${article.id}`}
        className="group flex min-h-0 flex-1 items-center gap-4 overflow-hidden rounded-xl border border-border bg-card p-3 transition-all hover:border-accent/50 hover:shadow-md"
      >
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-primary/10">
          {getThumbnailImage(article.images) ? (
            <img
              src={getThumbnailImage(article.images)}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
              <Newspaper className="h-6 w-6 text-primary/30" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <time dateTime={article.date}>
              {new Date(article.date).toLocaleDateString(
                language === "en" ? "en-MY" : "ms-MY",
                { day: "numeric", month: "short", year: "numeric" }
              )}
            </time>
          </div>
          <h3 className="font-heading text-sm font-semibold leading-snug text-card-foreground line-clamp-2 group-hover:text-accent">
            {articleTitle}
          </h3>
        </div>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-accent" />
      </Link>
    )
  }

  return (
    <section className="bg-primary-bg py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-3 font-heading text-3xl font-bold text-foreground md:text-4xl">
            {t("activity.title")}
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Featured - latest activity */}
          {featured && (
            <div className="lg:col-span-7">
              {renderFeaturedCard(featured)}
            </div>
          )}
          {/* 3 others - compact, fit same height as featured */}
          <div className="flex min-h-0 flex-col gap-3 lg:col-span-5 lg:h-full">
            {others.map((article) => renderCompactCard(article))}
          </div>
        </div>

        {/* See More - bottom right */}
        <div className="mt-12 flex justify-end">
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            {t("activity.seemore")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
