"use client"

import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Pin, Calendar, ChevronRight, Megaphone } from "lucide-react"

export function AnnouncementSection() {
  const { language, t } = useLanguage()
  const { announcements } = useDataStore()

  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const displayed = sorted.slice(0, 4)

  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Megaphone className="h-4.5 w-4.5 text-primary" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-card-foreground md:text-4xl">
                {t("announcements.title")}
              </h2>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              {t("announcements.subtitle")}
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent shrink-0"
          >
            {t("announcements.viewall")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Announcement List */}
        <div className="flex flex-col gap-3">
          {displayed.map((item, index) => {
            const title = language === "en" ? item.title : item.titleMs
            const summary = language === "en" ? item.summary : item.summaryMs

            return (
              <article
                key={item.id}
                className={`group relative flex flex-col gap-4 rounded-xl border bg-background p-5 transition-all hover:shadow-md sm:flex-row sm:items-start ${
                  item.pinned
                    ? "border-accent/30 bg-accent/[0.03]"
                    : "border-border hover:border-primary/20"
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
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold leading-snug text-card-foreground group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {summary}
                  </p>
                </div>

                {/* Arrow */}
                <div className="hidden shrink-0 self-center sm:block">
                  <ChevronRight className="h-5 w-5 text-muted-foreground/40 transition-colors group-hover:text-primary" />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
