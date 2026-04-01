"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { useEffect, useState } from "react"

interface PerkhidmatanItem {
  id: string
  name: string
  logoPath: string
  url: string
  section?: string
  isActive: boolean
  sortOrder: number
}

const SECTIONS: { key: string; order: number }[] = [
  { key: "kakitangan", order: 0 },
  { key: "pekebun", order: 1 },
  { key: "orang_awam", order: 2 },
]

export default function PerkhidmatanPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<PerkhidmatanItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/perkhidmatan")
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const itemsBySection = SECTIONS.reduce(
    (acc, { key }) => {
      acc[key] = items.filter((i) => (i.section || "orang_awam") === key)
      return acc
    },
    {} as Record<string, PerkhidmatanItem[]>,
  )

  return (
    <>
      <PageHeader
        title={t("nav.perkhidmatan")}
        subtitle={t("perkhidmatan.subtitle")}
      />
      <section className="bg-primary-bg py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="grid min-h-[200px] place-items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg">{t("common.comingSoon")}</p>
            </div>
          ) : (
            <div className="space-y-16">
              {SECTIONS.map(({ key }) => {
                const sectionItems = itemsBySection[key] || []
                if (sectionItems.length === 0) return null

                return (
                  <div key={key} className="space-y-6">
                    {/* Section header with clear separation */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">
                        {t(`perkhidmatan.section.${key}`)}
                      </h2>
                      <div className="h-px flex-1 bg-border sm:mx-4" aria-hidden />
                    </div>

                    <div
                      className="grid gap-8"
                      style={{
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      }}
                    >
                      {sectionItems.map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:ring-2 hover:ring-primary/20"
                        >
                          <div className="flex h-20 w-full items-center justify-center">
                            {item.logoPath ? (
                              <img
                                src={item.logoPath}
                                alt={item.name}
                                className="max-h-20 w-full object-contain transition-all duration-300 group-hover:grayscale-0"
                                style={{ filter: "grayscale(0.2)" }}
                              />
                            ) : (
                              <div
                                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-xl font-semibold uppercase text-primary sm:h-20 sm:w-20"
                                aria-hidden
                              >
                                {item.name.trim().replace(/\s+/g, " ").slice(0, 2).toUpperCase() || "—"}
                              </div>
                            )}
                          </div>
                          {item.name && (
                            <p className="text-center text-sm font-medium text-card-foreground">
                              {item.name}
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
