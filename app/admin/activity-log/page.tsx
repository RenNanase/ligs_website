"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface LogEntry {
  id: string
  userId: string
  userName: string
  activity: string
  createdAt: string
}

export default function AdminActivityLogPage() {
  const { t } = useLanguage()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/activity-log?page=${page}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs ?? [])
        setTotalPages(data.pagination?.totalPages ?? 1)
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false))
  }, [page])

  const formatDate = (s: string) => {
    try {
      const d = new Date(s)
      return d.toLocaleString()
    } catch {
      return s
    }
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-foreground">{t("admin.manage.activityLog")}</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center text-muted-foreground">
            No activity logs yet
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Activity</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 font-medium">{log.userName}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{log.activity}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-sm text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
