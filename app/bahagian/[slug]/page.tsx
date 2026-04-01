"use client"

import { useParams } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"

interface Bahagian {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  content: string
  featuredImage: string | null
  membersImage: string | null
}

export default function BahagianPage() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : ""
  const { t } = useLanguage()
  const [item, setItem] = useState<Bahagian | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    fetch(`/api/bahagian/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <>
        <PageHeader title="" />
        <section className="bg-primary-bg py-24">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </section>
      </>
    )
  }

  if (!item) {
    return (
      <>
        <PageHeader title={t("nav.corpinfo")} />
        <section className="bg-primary-bg py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <p className="text-lg text-muted-foreground">Page not found.</p>
            <Link href="/info-korporat/carta-organisasi" className="mt-4 inline-block text-primary hover:underline">
              Back to Carta Organisasi
            </Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={item.name}
        subtitle={item.shortDescription || undefined}
        className={item.featuredImage ? "min-h-[280px]" : ""}
      />
      {item.featuredImage && (
        <div className="relative -mt-24 h-48 overflow-hidden px-6">
          <div className="mx-auto max-w-7xl">
            <div className="overflow-hidden rounded-xl shadow-lg">
              <img
                src={item.featuredImage}
                alt=""
                className="h-48 w-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-4xl px-6">
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/info-korporat/carta-organisasi" className="hover:text-foreground">
              Carta Organisasi
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{item.name}</span>
          </nav>

          {item.membersImage && (
            <div className="mb-16">
              <h2 className="mb-6 font-heading text-2xl font-semibold text-foreground">
                Struktur Organisasi
              </h2>
              <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                <img
                  src={item.membersImage}
                  alt="Struktur Organisasi"
                  className="w-full object-contain"
                />
              </div>
            </div>
          )}

          <div
            className="prose prose-lg prose-preserve-spaces max-w-none prose-headings:font-heading prose-headings:font-semibold prose-p:text-muted-foreground prose-img:rounded-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>
      </section>
    </>
  )
}
