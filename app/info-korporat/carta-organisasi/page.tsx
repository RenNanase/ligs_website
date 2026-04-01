"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Bahagian {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  featuredImage: string | null
  orderIndex: number
}

export default function CartaOrganisasiPage() {
  const { t, language } = useLanguage()
  const [items, setItems] = useState<Bahagian[]>([])
  const [centerImage, setCenterImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/bahagian/public").then((res) => res.json()),
      fetch("/api/carta-organisasi").then((res) => res.json()),
    ])
      .then(([bahagianData, cartaData]) => {
        setItems(Array.isArray(bahagianData) ? bahagianData : [])
        setCenterImage(cartaData.centerImage || null)
      })
      .catch(() => {
        setItems([])
        setCenterImage(null)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title={t("nav.corpinfo.cartaOrganisasi")}
        subtitle={
          language === "ms"
            ? "Struktur organisasi LIGS"
            : "LIGS organisational structure"
        }
      />

      {/* Center organisational chart image */}
      {centerImage && (
        <section className="relative overflow-hidden bg-gradient-to-b from-muted/30 to-primary-bg px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl ring-1 ring-black/5">
              <img
                src={centerImage}
                alt={language === "ms" ? "Carta Organisasi LIGS" : "LIGS Organisation Chart"}
                className="w-full object-contain"
              />
            </div>
          </div>
        </section>
      )}

      {/* Bahagian cards grid */}
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground">
              <p className="text-lg">No divisions published yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/bahagian/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {item.featuredImage && (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <img
                        src={item.featuredImage}
                        alt={item.name}
                        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <h3 className="mb-2 font-heading text-lg font-semibold text-foreground group-hover:text-accent">
                    {item.name}
                  </h3>
                  {item.shortDescription && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {item.shortDescription}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {language === "ms" ? "Lihat Bahagian" : "View Division"}
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
