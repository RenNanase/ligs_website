"use client"

import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { FileText, Clock, ChevronRight, ExternalLink } from "lucide-react"

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    open: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    closed: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
    awarded: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  }

  const style = config[status] || config.closed

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {t(`tenders.status.${status}`)}
    </span>
  )
}

export function TendersSection() {
  const { language, t } = useLanguage()
  const { tenders } = useDataStore()

  // Show open tenders first, then by closing date (soonest first), limit to 5
  const sorted = [...tenders]
    .sort((a, b) => {
      const statusOrder: Record<string, number> = { open: 0, closed: 1, awarded: 2 }
      const orderDiff = (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1)
      if (orderDiff !== 0) return orderDiff
      return new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime()
    })
    .slice(0, 5)

  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-4.5 w-4.5 text-primary" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                {t("tenders.title")}
              </h2>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              {t("tenders.subtitle")}
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent shrink-0"
          >
            {t("tenders.viewall")}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Table for desktop, cards for mobile */}
        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-xl border border-border md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("tenders.refno")}
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {language === "en" ? "Title" : "Tajuk"}
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("tenders.closing")}
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {language === "en" ? "Status" : "Status"}
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((tender) => {
                const title = language === "en" ? tender.title : tender.titleMs
                const isOpen = tender.status === "open"
                return (
                  <tr
                    key={tender.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-mono text-xs font-medium text-muted-foreground">
                        {tender.referenceNo}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {tender.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(tender.closingDate).toLocaleDateString(
                          language === "en" ? "en-MY" : "ms-MY",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={tender.status} t={t} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {isOpen && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-accent"
                        >
                          {t("tenders.details")}
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {sorted.map((tender) => {
            const title = language === "en" ? tender.title : tender.titleMs
            return (
              <article
                key={tender.id}
                className="rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs font-medium text-muted-foreground">
                    {tender.referenceNo}
                  </span>
                  <StatusBadge status={tender.status} t={t} />
                </div>
                <h3 className="mb-2 text-sm font-semibold leading-snug text-card-foreground">
                  {title}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{t("tenders.closing")}:</span>
                    <time dateTime={tender.closingDate}>
                      {new Date(tender.closingDate).toLocaleDateString(
                        language === "en" ? "en-MY" : "ms-MY",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </time>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {tender.category}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
