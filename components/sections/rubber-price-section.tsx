"use client"

import { useLanguage } from "@/lib/language-context"
import { useEffect, useState } from "react"
import { RefreshCw, Loader2 } from "lucide-react"

interface RubberPriceData {
  tarikh: string
  lateks: string
  kepingan1: string
  kepingan2: string
  kentalan1: string
  kentalan2: string
  sekerap: string
  // BKN (Bantuan Kerajaan Negeri Sabah) - optional for backward compatibility
  bknlatex?: string
  bknuss1?: string
  bknuss2?: string
  bkncl1?: string
  bkncl2?: string
  bknscr?: string
  // LIGS contribution
  ligslatex?: string
  ligsuss1?: string
  ligsuss2?: string
  ligscl1?: string
  ligscl2?: string
  ligsscr?: string
  // Total
  totallatex?: string
  totaluss1?: string
  totaluss2?: string
  totalcl1?: string
  totalcl2?: string
  totalscr?: string
}

interface PriceRow {
  gradeKey: string
  harga: string
  bkn: string
  ligs: string
  jumlah: string
}

function toNum(val: string | undefined, fallback = 0): string {
  const n = parseFloat(val ?? String(fallback))
  return isNaN(n) ? fallback.toFixed(2) : n.toFixed(2)
}

function mapApiToRows(data: RubberPriceData): PriceRow[] {
  const rows: [string, string, string?, string?, string?][] = [
    [data.lateks, "rubber.latex", data.bknlatex, data.ligslatex, data.totallatex],
    [data.kepingan1, "rubber.kepingan1", data.bknuss1, data.ligsuss1, data.totaluss1],
    [data.kepingan2, "rubber.kepingan2", data.bknuss2, data.ligsuss2, data.totaluss2],
    [data.kentalan1, "rubber.kentalan1", data.bkncl1, data.ligscl1, data.totalcl1],
    [data.kentalan2, "rubber.kentalan2", data.bkncl2, data.ligscl2, data.totalcl2],
    [data.sekerap, "rubber.scrap", data.bknscr, data.ligsscr, data.totalscr],
  ]
  return rows.map(([harga, gradeKey, bkn, ligs, jumlah]) => {
    const h = parseFloat(harga ?? "0")
    const b = parseFloat(bkn ?? "0")
    const l = parseFloat(ligs ?? "0")
    const j = jumlah ? parseFloat(jumlah) : h + b + l
    return {
      gradeKey,
      harga: toNum(harga),
      bkn: toNum(bkn, 0),
      ligs: toNum(ligs, 0),
      jumlah: j.toFixed(2),
    }
  })
}

function formatDateShort(dateStr: string): string {
  return dateStr // Already in DD/MM/YYYY format from API
}

interface SesData {
  getah_mentah?: string
  period?: string
}


export function RubberPriceSection() {
  const { t } = useLanguage()
  const [data, setData] = useState<RubberPriceData | null>(null)
  const [sesData, setSesData] = useState<SesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sesLoading, setSesLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = () => {
    setLoading(true)
    setError(false)
    fetch("/api/rubber-price")
      .then((res) => {
        if (!res.ok) throw new Error("API error")
        return res.json()
      })
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }

  const fetchSesData = () => {
    setSesLoading(true)
    fetch("/api/ses")
      .then((res) => {
        if (!res.ok) throw new Error("API error")
        return res.json()
      })
      .then((json) => {
        setSesData(json)
        setSesLoading(false)
      })
      .catch(() => setSesLoading(false))
  }

  useEffect(() => {
    fetchData()
    fetchSesData()
  }, [])

  const rows = data ? mapApiToRows(data) : []

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="mb-3 font-heading text-3xl font-bold text-foreground md:text-4xl">
            {t("rubber.title")}
          </h2>
         
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/80 py-20 shadow-sm backdrop-blur">
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t("rubber.loading")}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card/80 py-20 shadow-sm backdrop-blur">
            <p className="mb-4 text-sm text-muted-foreground">{t("rubber.error")}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <RefreshCw className="h-4 w-4" />
              {t("rubber.retry")}
            </button>
          </div>
        )}

        {/* Price Table - fixed, compact, no horizontal scroll */}
        {data && !loading && (
          <>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {/* Title bar */}
              <div className="bg-primary px-3 py-2 text-center sm:px-4 sm:py-2.5 md:px-6 md:py-4">
                <h3 className="text-xs font-bold text-primary-foreground sm:text-sm md:text-base">
                  {t("rubber.officialTitle")}
                </h3>
                <p className="mt-0.5 text-[10px] text-primary-foreground/90 sm:text-xs md:text-sm">
                  {formatDateShort(data.tarikh)}
                </p>
              </div>

              {/* Fixed table - fits viewport, no scroll */}
              <div className="w-full">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[28%]" />
                    <col className="w-[18%]" />
                    <col className="w-[18%]" />
                    <col className="w-[18%]" />
                    <col className="w-[18%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-primary/20 bg-primary/10">
                      <th className="px-1.5 py-2 text-left text-[9px] font-semibold uppercase leading-tight text-primary sm:px-2 sm:py-2.5 sm:text-[10px] md:px-4 md:py-3 md:text-xs">
                        {t("rubber.grade")}
                      </th>
                      <th className="px-1 py-2 text-center text-[9px] font-semibold uppercase leading-tight text-primary sm:px-2 sm:py-2.5 sm:text-[10px] md:px-4 md:py-3 md:text-xs">
                        {t("rubber.harga")}
                      </th>
                      <th className="px-1 py-2 text-center text-[9px] font-semibold uppercase leading-tight text-primary sm:px-2 sm:py-2.5 sm:text-[10px] md:px-4 md:py-3 md:text-xs">
                        {t("rubber.bkn")}
                      </th>
                      <th className="px-1 py-2 text-center text-[9px] font-semibold uppercase leading-tight text-primary sm:px-2 sm:py-2.5 sm:text-[10px] md:px-4 md:py-3 md:text-xs">
                        {t("rubber.ligs")}
                      </th>
                      <th className="px-1 py-2 text-center text-[9px] font-semibold uppercase leading-tight text-primary sm:px-2 sm:py-2.5 sm:text-[10px] md:px-4 md:py-3 md:text-xs">
                        {t("rubber.jumlah")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((row, idx) => (
                      <tr
                        key={row.gradeKey}
                        className={`transition-colors hover:bg-accent/20 ${idx % 2 === 1 ? "bg-muted/20" : ""}`}
                      >
                        <td className="break-words px-1.5 py-2.5 text-[10px] font-medium leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                          {t(row.gradeKey)}
                        </td>
                        <td className="px-1 py-2.5 text-center text-[10px] tabular-nums leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                          {row.harga}
                        </td>
                        <td className="px-1 py-2.5 text-center text-[10px] tabular-nums leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                          {row.bkn}
                        </td>
                        <td className="px-1 py-2.5 text-center text-[10px] tabular-nums leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                          {row.ligs}
                        </td>
                        <td className="px-1 py-2.5 text-center text-[10px] font-semibold tabular-nums leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                          {row.jumlah}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer note */}
              <div className="border-t border-border bg-muted/30 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5">
                <p className="text-center text-[9px] text-muted-foreground sm:text-[10px] md:text-xs">
                  {t("rubber.bknNote")}
                </p>
              </div>
            </div>

            {/* Source footer */}
            <p className="mt-3 text-center text-[10px] text-muted-foreground md:text-xs">
              {t("rubber.source")}
            </p>

            {/* SES Table - Harga Ses Getah Sabah */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="bg-primary px-3 py-2 text-center sm:px-4 sm:py-2.5 md:px-6 md:py-4">
                <h3 className="text-xs font-bold text-primary-foreground sm:text-sm md:text-base">
                  {t("rubber.sesTitle")}
                </h3>
                {sesData?.period && !sesLoading && (
                  <p className="mt-0.5 text-[10px] text-primary-foreground/90 sm:text-xs md:text-sm">
                    {sesData.period}
                  </p>
                )}
              </div>

              <div className="w-full">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[60%]" />
                    <col className="w-[40%]" />
                  </colgroup>
                  <tbody className="divide-y divide-border">
                    <tr className="transition-colors hover:bg-accent/20 bg-muted/20">
                      <td className="break-words px-1.5 py-2.5 text-[10px] font-medium leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                        {t("rubber.sesGetah")}
                      </td>
                      <td className="px-1 py-2.5 text-right text-[10px] tabular-nums leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                        RM 22.00
                      </td>
                    </tr>
                    <tr className="transition-colors hover:bg-accent/20">
                      <td className="break-words px-1.5 py-2.5 text-[10px] font-medium leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                        {t("rubber.sesTanamSemula")}
                      </td>
                      <td className="px-1 py-2.5 text-right text-[10px] tabular-nums leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                        RM 100.00
                      </td>
                    </tr>
                    {sesData?.getah_mentah && (
                      <tr className="transition-colors hover:bg-accent/20 bg-muted/20">
                        <td className="break-words px-1.5 py-2.5 text-[10px] font-medium leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                          {t("rubber.sesGetahMentah")}
                        </td>
                        <td className="break-words px-1 py-2.5 text-right text-[10px] leading-snug text-foreground sm:px-2 sm:py-3 sm:text-[11px] md:px-4 md:py-3.5 md:text-sm">
                          {sesData.getah_mentah}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-border bg-muted/30 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5">
                <p className="text-center text-[9px] text-muted-foreground sm:text-[10px] md:text-xs">
                  {sesData?.period ?? t("rubber.source")}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
