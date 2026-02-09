"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, Newspaper } from "lucide-react"

export function ActivitySection() {
  const { language, t } = useLanguage()
  const { news } = useDataStore()

  // Sort by latest date and take 3
  const latestNews = [...news]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-3 font-heading text-3xl font-bold text-foreground md:text-4xl">
            {t("activity.title")}
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("activity.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {latestNews.map((article) => {
            const articleTitle = language === "en" ? article.title : article.titleMs
            const articleContent = language === "en" ? article.content : article.contentMs
            const excerpt = articleContent.length > 120 ? `${articleContent.slice(0, 120)}...` : articleContent

            return (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
              >
                {/* Image area */}
                <div className="relative h-48 overflow-hidden bg-primary/10">
                  {article.image ? (
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${article.image})` }}
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

                {/* Content */}
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
                    href="/news"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-accent"
                  >
                    {t("news.readmore")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        {/* See More Button */}
        <div className="mt-12 flex justify-center">
          <Link href="/news">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 border-primary px-8 text-base font-semibold text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              {t("activity.seemore")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
