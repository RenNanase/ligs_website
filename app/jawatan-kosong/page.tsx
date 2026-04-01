"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { Briefcase, Clock, FileText } from "lucide-react"
import { useEffect, useState } from "react"

interface JawatanKosongItem {
  id: string
  jawatanName: string
  taraf: string
  kekosongan: number
  tarikhLuput: string
  pdfUrl: string
}

export default function JawatanKosongPage() {
  const { language, t } = useLanguage()
  const [items, setItems] = useState<JawatanKosongItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/jawatan-kosong")
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...items].sort(
    (a, b) => new Date(b.tarikhLuput).getTime() - new Date(a.tarikhLuput).getTime()
  )

  return (
    <>
      <PageHeader
        title={t("nav.orangAwam.jawatanKosong")}
        subtitle={t("jawatanKosong.subtitle")}
      />
      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-24 text-center">
              <Briefcase className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                {t("jawatanKosong.empty")}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-hidden rounded-xl border border-border bg-white shadow-sm md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="w-12 border-r border-border px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("jawatanKosong.bil")}
                      </th>
                      <th className="min-w-[12rem] px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("jawatanKosong.jawatan")}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("jawatanKosong.taraf")}
                      </th>
                      <th className="w-24 px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("jawatanKosong.kekosongan")}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("jawatanKosong.tarikhLuput")}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("jawatanKosong.download")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {sorted.map((item, index) => (
                      <tr
                        key={item.id}
                        className="group transition-colors hover:bg-muted/50"
                      >
                        <td className="border-r border-border whitespace-nowrap px-5 py-4 align-top text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="min-w-[12rem] max-w-xl px-5 py-4 align-top">
                          <p className="text-sm font-medium text-foreground leading-relaxed break-words whitespace-normal group-hover:text-accent transition-colors">
                            {item.jawatanName}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 align-top">
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {item.taraf === "Tetap"
                              ? t("jawatanKosong.taraf.tetap")
                              : t("jawatanKosong.taraf.kontrak")}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-center align-top text-muted-foreground">
                          {item.kekosongan ?? 1}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 align-top">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {new Date(item.tarikhLuput).toLocaleDateString(
                              language === "en" ? "en-MY" : "ms-MY",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 align-top">
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-accent"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {t("jawatanKosong.downloadPdf")}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="flex flex-col gap-3 md:hidden">
                {sorted.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-border bg-white p-5 shadow-sm transition-all hover:border-accent/50 hover:shadow-md"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-relaxed break-words text-foreground flex-1 min-w-0">
                        {item.jawatanName}
                      </h3>
                      <span className="shrink-0 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {item.taraf === "Tetap"
                          ? t("jawatanKosong.taraf.tetap")
                          : t("jawatanKosong.taraf.kontrak")}
                      </span>
                    </div>
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{t("jawatanKosong.kekosongan")}:</span>
                      <span className="font-medium">{item.kekosongan ?? 1}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{t("jawatanKosong.tarikhLuput")}:</span>
                        <time dateTime={item.tarikhLuput}>
                          {new Date(item.tarikhLuput).toLocaleDateString(
                            language === "en" ? "en-MY" : "ms-MY",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                        </time>
                      </div>
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary"
                      >
                        <FileText className="h-3 w-3" />
                        {t("jawatanKosong.downloadPdf")}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
