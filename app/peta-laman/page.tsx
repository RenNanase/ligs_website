"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { buildSitemapCategories } from "@/lib/sitemap-structure"
import type { SitemapCategory, SitemapLink } from "@/lib/sitemap-structure"
import { Input } from "@/components/ui/input"
import { Search, ChevronRight } from "lucide-react"

function filterByKeyword(categories: SitemapCategory[], query: string, t: (k: string) => string): SitemapCategory[] {
  const q = query.trim().toLowerCase()
  if (!q) return categories

  return categories
    .map((cat) => {
      const categoryLabel = t(cat.categoryKey)
      const matchesCategory = categoryLabel.toLowerCase().includes(q)

      const filteredItems = cat.items.filter((item) => {
        const label = item.label ?? (item.labelKey ? t(item.labelKey) : "")
        const matchLabel = label.toLowerCase().includes(q)
        const matchKeywords = item.keywords?.some((k) => k.includes(q))
        return matchLabel || matchKeywords || matchesCategory
      })

      return { ...cat, items: filteredItems }
    })
    .filter((cat) => cat.items.length > 0)
}

function SitemapLinkItem({ item, t }: { item: SitemapLink; t: (k: string) => string }) {
  const label = item.label ?? (item.labelKey ? t(item.labelKey) : item.href)

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 rounded-lg border border-transparent py-2.5 px-4 transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
      >
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        <span>{label}</span>
        <span className="text-xs text-muted-foreground">↗</span>
      </a>
    )
  }

  return (
    <Link
      href={item.href}
      className="group flex items-center gap-2 rounded-lg border border-transparent py-2.5 px-4 transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
    >
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      <span>{label}</span>
    </Link>
  )
}

export default function PetaLamanPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [bahagian, setBahagian] = useState<{ slug: string; name: string }[]>([])

  useEffect(() => {
    fetch("/api/bahagian/public")
      .then((res) => res.json())
      .then((data) => setBahagian(Array.isArray(data) ? data : []))
      .catch(() => setBahagian([]))
  }, [])

  const categories = useMemo(() => buildSitemapCategories(bahagian), [bahagian])
  const filteredCategories = useMemo(
    () => filterByKeyword(categories, searchQuery, t),
    [categories, searchQuery, t]
  )
  const hasResults = filteredCategories.some((c) => c.items.length > 0)

  return (
    <>
      <PageHeader
        title={t("sitemap.title")}
        subtitle={t("sitemap.subtitle")}
      />

      <section className="bg-primary-bg py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-primary">
                  {t("sitemap.home")}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="h-4 w-4" />
              </li>
              <li className="font-medium text-foreground" aria-current="page">
                {t("sitemap.title")}
              </li>
            </ol>
          </nav>

          {/* Search */}
          <div className="relative mb-10">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("sitemap.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 rounded-xl border-gray-200 bg-white pl-11 pr-4 text-base shadow-sm"
              aria-label={t("sitemap.searchPlaceholder")}
            />
          </div>

          {/* Results */}
          {hasResults ? (
            <div className="space-y-8">
              {filteredCategories.map((category) => (
                <div
                  key={category.categoryKey}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <h2 className="mb-4 font-heading text-lg font-semibold text-foreground border-b border-gray-100 pb-2">
                    {t(category.categoryKey)}
                  </h2>
                  <ul className="space-y-1" role="list">
                    {category.items.map((item) => (
                      <li key={item.href + (item.label ?? item.labelKey ?? "")}>
                        <SitemapLinkItem item={item} t={t} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <p className="text-muted-foreground">{t("sitemap.noResults")}</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
