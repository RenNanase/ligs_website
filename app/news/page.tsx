"use client"

import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Calendar, Tag, ArrowRight, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function NewsPage() {
  const { language, t } = useLanguage()
  const { news } = useDataStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <>
      {/* Page Header */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 font-heading text-4xl font-bold text-primary-foreground md:text-5xl">
            {t("news.title")}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            {t("news.subtitle")}
          </p>
        </div>
      </section>

      {/* News List */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col gap-8">
            {news.map((article) => (
              <article
                key={article.id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="p-8">
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

                  <h2 className="mb-3 font-heading text-2xl font-semibold text-card-foreground">
                    {language === "en" ? article.title : article.titleMs}
                  </h2>

                  <p className="mb-4 leading-relaxed text-muted-foreground">
                    {expandedId === article.id
                      ? language === "en"
                        ? article.content
                        : article.contentMs
                      : (language === "en"
                          ? article.content
                          : article.contentMs
                        ).slice(0, 200) + "..."}
                  </p>

                  <Button
                    variant="ghost"
                    className="gap-2 px-0 text-accent hover:text-accent/80 hover:bg-transparent"
                    onClick={() =>
                      setExpandedId(
                        expandedId === article.id ? null : article.id
                      )
                    }
                  >
                    {expandedId === article.id
                      ? language === "en"
                        ? "Show Less"
                        : "Tunjuk Kurang"
                      : t("news.readmore")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))}
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
        </div>
      </section>
    </>
  )
}
