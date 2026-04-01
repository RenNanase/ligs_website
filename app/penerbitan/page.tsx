"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { BookOpen, FileText, Calendar, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"

interface PenerbitanItem {
  id: string
  title: string
  date: string
  pdfUrl: string
}

export default function PenerbitanPage() {
  const { language, t } = useLanguage()
  const [items, setItems] = useState<PenerbitanItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/penerbitan")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title={t("penerbitan.title")}
        subtitle={t("penerbitan.subtitle")}
      />
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-4xl px-6">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-24 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>              
              <p className="mt-2 text-sm text-muted-foreground">
                {language === "en"
                  ? "Publications will be added here soon."
                  : "Penerbitan akan ditambah tidak lama lagi."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(item.date).toLocaleDateString(
                        language === "en" ? "en-US" : "ms-MY",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </p>
                  </div>
                  <ExternalLink className="h-5 w-5 shrink-0 text-primary" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
