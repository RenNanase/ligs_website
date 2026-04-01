"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Clock, ChevronRight, FileText } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function TendersSection() {
  const { language, t } = useLanguage()
  const pathname = usePathname()
  const { tenders } = useDataStore()
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open")

  const isTendersPage = pathname === "/tenders"

  // Open first, then by closing date (newest first)
  const sortedBase = [...tenders].sort((a, b) => {
    const statusOrder = { open: 0, closed: 1, awarded: 1 }
    const aStatus = statusOrder[a.status as keyof typeof statusOrder] ?? 1
    const bStatus = statusOrder[b.status as keyof typeof statusOrder] ?? 1
    if (aStatus !== bStatus) return aStatus - bStatus
    return new Date(b.closingDate).getTime() - new Date(a.closingDate).getTime()
  })

  // Filter by status: homepage shows only open (Dibuka); tenders page uses tab
  const isClosed = (s: string) => s === "closed" || s === "awarded"
  const filteredTenders = isTendersPage
    ? sortedBase.filter((t) => (activeTab === "open" ? !isClosed(t.status) : isClosed(t.status)))
    : sortedBase.filter((t) => !isClosed(t.status))
  const sorted = isTendersPage ? filteredTenders : filteredTenders.slice(0, 5)

  const hasOpen = tenders.some((t) => !isClosed(t.status))
  const hasClosed = tenders.some((t) => isClosed(t.status))

  return (
    <section className="bg-white py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Sticky mini menu - only on tenders page */}
        {isTendersPage && (hasOpen || hasClosed) && (
          <nav className="sticky top-0 z-20 mb-8 border-b border-border bg-primary-bg/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-primary-bg/90 lg:mb-10">
            <div className="flex gap-1">
              {hasOpen && (
                <button
                  type="button"
                  onClick={() => setActiveTab("open")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === "open"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent/20 hover:text-accent"
                  )}
                >
                  {t("tenders.tab.open")}
                </button>
              )}
              {hasClosed && (
                <button
                  type="button"
                  onClick={() => setActiveTab("closed")}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    activeTab === "closed"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent/20 hover:text-accent"
                  )}
                >
                  {t("tenders.tab.closed")}
                </button>
              )}
            </div>
          </nav>
        )}

        {/* Header - hide on full tenders page (uses PageHeader instead) */}
        {!isTendersPage && (
          <div className="mb-8 text-center sm:mb-10 md:mb-12">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              {t("tenders.title")}
            </h2>
          </div>
        )}

        {/* Table for desktop, cards for mobile */}
        {/* Empty state */}
        {sorted.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm">{t("tenders.empty")}</p>
          </div>
        ) : (
          <>
        {/* Desktop Table - scrollable on smaller tablets */}
        <div className="hidden overflow-x-auto overflow-y-visible rounded-xl border border-border bg-white md:block">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-12 border-r border-border px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("jawatanKosong.bil")}
                </th>
                <th className="min-w-[12rem] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {language === "en" ? "Title" : "Tajuk"}
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("tenders.opening")}
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("tenders.closing")}
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {language === "en" ? "Status" : "Status"}
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("jawatanKosong.download")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.map((tender, index) => {
                const title = language === "en" ? tender.title : tender.titleMs
                return (
                  <tr
                    key={tender.id}
                    className="group transition-colors"
                  >
                    <td className="border-r border-border whitespace-nowrap px-5 py-4 align-top text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="min-w-[12rem] max-w-xl px-5 py-4 align-top">
                      <p className="text-sm font-medium text-foreground leading-relaxed break-words whitespace-normal group-hover:text-accent transition-colors">
                        {title}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(tender.openingDate).toLocaleDateString(
                          language === "en" ? "en-MY" : "ms-MY",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(tender.closingDate).toLocaleDateString(
                          language === "en" ? "en-MY" : "ms-MY",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tender.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {t(`tenders.status.${tender.status}`)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-top">
                      {tender.pdfUrl ? (
                        <a
                          href={tender.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-accent"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {t("jawatanKosong.downloadPdf")}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - optimized for small screens */}
        <div className="flex flex-col gap-4 md:hidden">
          {sorted.map((tender) => (
            <article
              key={tender.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow active:shadow-md sm:p-5"
            >
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">
                  {language === "en" ? tender.title : tender.titleMs}
                </h3>
                <span
                  className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tender.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                >
                  {t(`tenders.status.${tender.status}`)}
                </span>
              </div>

              {/* Dates - stacked on very small screens, side-by-side on wider */}
              <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-x-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    {t("tenders.opening")}:{" "}
                    <time dateTime={tender.openingDate}>
                      {new Date(tender.openingDate).toLocaleDateString(
                        language === "en" ? "en-MY" : "ms-MY",
                        { day: "numeric", month: "short", year: "2-digit" }
                      )}
                    </time>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    {t("tenders.closing")}:{" "}
                    <time dateTime={tender.closingDate}>
                      {new Date(tender.closingDate).toLocaleDateString(
                        language === "en" ? "en-MY" : "ms-MY",
                        { day: "numeric", month: "short", year: "2-digit" }
                      )}
                    </time>
                  </span>
                </div>
              </div>

              {/* Download CTA - full width, touch-friendly */}
              {tender.pdfUrl && (
                <a
                  href={tender.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-accent/20 hover:text-accent active:bg-primary/15"
                >
                  <FileText className="h-4 w-4" />
                  {t("jawatanKosong.downloadPdf")}
                </a>
              )}
            </article>
          ))}
        </div>

        {/* View All CTA */}
        {!isTendersPage && (
          <div className="mt-6 flex justify-center sm:mt-8 sm:justify-end">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              {t("tenders.viewall")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
          </>
        )}
      </div>
    </section>
  )
}
