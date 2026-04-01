"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { api, type FeedbackItem } from "@/lib/api-client"
import { MessageSquare, Mail, Phone, User, Calendar } from "lucide-react"
import { useState, useEffect } from "react"

export default function AdminFeedbackPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await api.getFeedbackList(page, limit)
        setItems(res.items)
        setTotal(res.total)
      } catch (err) {
        console.error("Failed to load feedback:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [page])

  const totalPages = Math.ceil(total / limit)
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("admin.manage.feedback")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {total} {t("admin.feedback.submissions")}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <p>{t("admin.feedback.noSubmissions")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {f.subject}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(f.createdAt)}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-card-foreground">{f.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${f.phone}`} className="text-primary hover:underline">
                    {f.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm sm:col-span-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${f.email}`} className="text-primary hover:underline">
                    {f.email}
                  </a>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/50 p-3 text-sm text-card-foreground">
                {f.message}
              </p>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent disabled:opacity-50"
              >
                {t("admin.pagination.prev")}
              </button>
              <span className="text-sm text-muted-foreground">
                {t("admin.pagination.page")} {page} {t("admin.pagination.of")} {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground hover:bg-accent disabled:opacity-50"
              >
                {t("admin.pagination.next")}
              </button>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
