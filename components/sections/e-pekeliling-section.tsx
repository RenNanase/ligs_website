"use client"

import { useLanguage } from "@/lib/language-context"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"

interface EPekelilingItem {
  id: string
  noPekeliling: string
  noRujukan: string
  tajuk: string
  tarikhDikeluarkan: string
  pdfUrl: string
}

const PAGE_SIZE = 15

export function EPekelilingSection() {
  const { language } = useLanguage()
  const [items, setItems] = useState<EPekelilingItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/e-pekeliling?page=${page}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setItems(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page])

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(language === "en" ? "en-MY" : "ms-MY", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })

  const downloadLabel = language === "en" ? "Download" : "Muat Turun"
  const downloadPdfLabel = language === "en" ? "Download PDF" : "Muat Turun PDF"

  return (
    <section className="bg-primary-bg py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {loading ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-muted-foreground">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm">{language === "en" ? "Loading..." : "Memuatkan..."}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-6 py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p className="text-sm">
              {language === "en" ? "No circulars available." : "Tiada pekeliling buat masa ini."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table - same style as tenders */}
            <div className="hidden overflow-x-auto overflow-y-visible rounded-xl border border-border bg-white md:block">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="w-12 border-r border-border px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {language === "en" ? "No." : "Bil"}
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      No. Pekeliling
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      No. Rujukan
                    </th>
                    <th className="min-w-[12rem] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {language === "en" ? "Title" : "Tajuk"}
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {language === "en" ? "Date Issued" : "Tarikh Dikeluarkan"}
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {downloadLabel}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group transition-colors">
                      <td className="border-r border-border whitespace-nowrap px-5 py-4 align-top text-muted-foreground">
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-sm font-medium text-foreground">
                        {item.noPekeliling}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top text-sm text-muted-foreground">
                        {item.noRujukan}
                      </td>
                      <td className="min-w-[12rem] max-w-xl px-5 py-4 align-top">
                        <p className="text-sm font-medium text-foreground leading-relaxed break-words whitespace-normal group-hover:text-accent transition-colors">
                          {item.tajuk}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <time dateTime={item.tarikhDikeluarkan}>
                            {formatDate(item.tarikhDikeluarkan)}
                          </time>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 align-top">
                        {item.pdfUrl ? (
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-accent"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {downloadPdfLabel}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-4 md:hidden">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow active:shadow-md sm:p-5"
                >
                  <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground">
                    {item.tajuk}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>No. Pekeliling: {item.noPekeliling}</span>
                    <span>No. Rujukan: {item.noRujukan}</span>
                    <span>{formatDate(item.tarikhDikeluarkan)}</span>
                  </div>
                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-accent/20 hover:text-accent active:bg-primary/15"
                    >
                      <FileText className="h-4 w-4" />
                      {downloadPdfLabel}
                    </a>
                  )}
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  {language === "en"
                    ? `Page ${page} of ${totalPages} (${total} items)`
                    : `Halaman ${page} daripada ${totalPages} (${total} item)`}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === "en" ? "Previous" : "Sebelumnya"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {language === "en" ? "Next" : "Seterusnya"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
