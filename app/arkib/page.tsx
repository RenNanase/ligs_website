"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { useEffect, useState } from "react"
import { Search, Newspaper, ImageIcon, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ArchiveItem {
  id: string
  type: "berita" | "galeri"
  title: string
  titleMs?: string
  originalDate: string
  archivedAt: string
}

export default function ArkibPage() {
  const { language, t } = useLanguage()
  const [items, setItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"all" | "berita" | "galeri">("all")
  const [search, setSearch] = useState("")
  const [searchDebounced, setSearchDebounced] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)
  const [availableYears, setAvailableYears] = useState<number[]>([])

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [activeTab, searchDebounced, yearFilter])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      type: activeTab,
      search: searchDebounced,
      sort: "year_desc",
      page: String(page),
      ...(yearFilter ? { year: yearFilter } : {}),
    })
    fetch(`/api/archive/list?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || [])
        const pag = data.pagination || null
        setPagination(pag)
        setAvailableYears(data.availableYears || [])
        if (pag && page > pag.totalPages) setPage(1)
      })
      .catch(() => {
        setItems([])
        setPagination(null)
        setAvailableYears([])
      })
      .finally(() => setLoading(false))
  }, [activeTab, searchDebounced, yearFilter, page])

  return (
    <>
      <PageHeader
        title={t("arkib.title")}
        subtitle={t("arkib.subtitle")}
      />
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-5xl px-6">
          {/* Sticky tabs + search + year filter */}
          <div className="sticky top-0 z-10 -mx-6 mb-8 border-b border-border bg-primary-bg/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-primary-bg/90">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1">
                  {(["all", "berita", "galeri"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        activeTab === tab
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent/20 hover:text-accent"
                      )}
                    >
                      {t(`arkib.tab.${tab}`)}
                    </button>
                  ))}
                </div>
                {availableYears.length > 0 && (
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="">{t("arkib.allYears")}</option>
                    {availableYears.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="relative max-w-xs flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder={t("arkib.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <ImageIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">{t("arkib.empty")}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {(() => {
                const byYear = items.reduce(
                  (acc, item) => {
                    const year = new Date(item.originalDate).getFullYear().toString()
                    if (!acc[year]) acc[year] = []
                    acc[year].push(item)
                    return acc
                  },
                  {} as Record<string, ArchiveItem[]>
                )
                const years = Object.keys(byYear).sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
                return years.map((year) => (
                  <div key={year}>
                    <h2 className="mb-4 border-b border-border pb-2 font-heading text-lg font-semibold text-foreground">
                      {year}
                    </h2>
                    <div className="space-y-3">
                      {byYear[year].map((item) => {
                        const title = language === "en" ? item.title : (item.titleMs || item.title)
                        const href = item.type === "berita" ? `/news/${item.id}` : `/gallery?event=${item.id}`
                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex flex-1 items-start gap-3">
                              <span
                                className={cn(
                                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                  item.type === "berita" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent"
                                )}
                              >
                                {item.type === "berita" ? (
                                  <Newspaper className="h-5 w-5" />
                                ) : (
                                  <ImageIcon className="h-5 w-5" />
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="break-words font-medium text-foreground">{title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {t(`arkib.tab.${item.type}`)} ·{" "}
                                  {new Date(item.originalDate).toLocaleDateString(
                                    language === "en" ? "en-MY" : "ms-MY",
                                    { year: "numeric", month: "short", day: "numeric" }
                                  )}
                                </p>
                              </div>
                            </div>
                            <Link
                              href={href}
                              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-accent"
                            >
                              {t("arkib.view")}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))
              })()}

              {pagination && pagination.totalPages > 1 && (
                <nav
                  className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6"
                  aria-label={language === "en" ? "Archive pagination" : "Pagination arkib"}
                >
                  <p className="text-sm text-muted-foreground">
                    {t("arkib.pageOf")
                      .replace("{page}", String(page))
                      .replace("{total}", String(pagination.totalPages))}
                    {pagination.total > 0 && ` (${pagination.total} ${t("arkib.items")})`}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t("arkib.prev")}
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                          key={p}
                          variant={p === page ? "default" : "outline"}
                          size="icon"
                          className="h-9 w-9"
                          onClick={() => setPage(p)}
                          aria-current={p === page ? "page" : undefined}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    >
                      {t("arkib.next")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </nav>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
