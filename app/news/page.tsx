"use client"

import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { getThumbnailImage } from "@/lib/image-utils"
import { PageHeader } from "@/components/sections/page-header"
import { Calendar, Tag, ArrowRight, Newspaper, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 6

function NewsList() {
  const { language, t } = useLanguage()
  const { news } = useDataStore()
  const searchParams = useSearchParams()

  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)

  const sortedNews = useMemo(
    () => [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [news]
  )

  const totalPages = Math.max(1, Math.ceil(sortedNews.length / PAGE_SIZE))
  const page = Math.min(currentPage, totalPages)
  const start = (page - 1) * PAGE_SIZE
  const displayedNews = sortedNews.slice(start, start + PAGE_SIZE)

  const pageUrl = (p: number) => (p <= 1 ? "/news" : `/news?page=${p}`)

  return (
    <>
      <PageHeader title={t("news.title")} />

      {/* News List */}
      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col gap-8">
            {displayedNews.map((article) => {
              const title = language === "en" ? article.title : article.titleMs
              const excerpt =
                (language === "en" ? article.content : article.contentMs).slice(
                  0,
                  200
                ) + "..."

              return (
                <Link key={article.id} href={`/news/${article.id}`}>
                  <article className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent/50 hover:shadow-lg">
                    <div className="flex flex-col sm:flex-row">
                      {/* Thumbnail */}
                      <div className="relative h-48 w-full shrink-0 overflow-hidden bg-primary/10 sm:h-auto sm:w-64">
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
                      </div>

                      <div className="flex flex-1 flex-col justify-center p-6">
                        <div className="mb-4 flex flex-wrap items-center gap-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            <Tag className="h-3 w-3" />
                            {article.category}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.date).toLocaleDateString(
                              language === "en" ? "en-US" : "ms-MY",
                              { year: "numeric", month: "long", day: "numeric" }
                            )}
                          </span>
                        </div>

                        <h2 className="mb-2 font-heading text-xl font-semibold text-card-foreground group-hover:text-accent transition-colors">
                          {title}
                        </h2>

                        <p className="mb-4 line-clamp-2 leading-relaxed text-muted-foreground">
                          {excerpt}
                        </p>

                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                          {t("news.readmore")}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>

          {news.length === 0 && (
            <div className="py-20 text-center">
              <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "en"
                  ? "No news articles yet."
                  : "Tiada artikel berita lagi."}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
              aria-label="News pagination"
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link href={pageUrl(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                    {t("news.prev")}
                  </Link>
                ) : (
                  <span>
                    <ChevronLeft className="h-4 w-4" />
                    {t("news.prev")}
                  </span>
                )}
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="icon"
                    className="h-9 w-9"
                    asChild={p !== page}
                  >
                    {p === page ? (
                      <span aria-current="page">{p}</span>
                    ) : (
                      <Link href={pageUrl(p)}>{p}</Link>
                    )}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={page >= totalPages}
                asChild={page < totalPages}
              >
                {page < totalPages ? (
                  <Link href={pageUrl(page + 1)}>
                    {t("news.next")}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span>
                    {t("news.next")}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </nav>
          )}
        </div>
      </section>
    </>
  )
}

export default function NewsPage() {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Latest News" subtitle="" />
          <section className="bg-primary-bg py-24">
            <div className="mx-auto max-w-4xl px-6 text-center text-muted-foreground">
              Loading…
            </div>
          </section>
        </>
      }
    >
      <NewsList />
    </Suspense>
  )
}
