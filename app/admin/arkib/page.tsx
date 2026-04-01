"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Archive, Newspaper, ImageIcon, Search, RotateCcw, Trash2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ArchiveItem {
  id: string
  type: "berita" | "galeri"
  title: string
  titleMs?: string
  originalDate: string
  archivedAt: string
}

export default function AdminArkibPage() {
  const { language, t } = useLanguage()
  const [items, setItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [archiving, setArchiving] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "berita" | "galeri">("all")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("year_desc")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null)
  const [restoreTarget, setRestoreTarget] = useState<ArchiveItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ArchiveItem | null>(null)
  const [actioning, setActioning] = useState(false)

  const fetchItems = () => {
    setLoading(true)
    const params = new URLSearchParams({ type: activeTab, search, sort, page: String(page) })
    fetch(`/api/archive/list?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || [])
        const pag = data.pagination || null
        setPagination(pag)
        if (pag && page > pag.totalPages) setPage(1)
      })
      .catch(() => {
        setItems([])
        setPagination(null)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setPage(1)
  }, [activeTab, search, sort])

  useEffect(() => {
    fetchItems()
  }, [activeTab, search, sort, page])

  const handleRunArchival = async () => {
    setArchiving(true)
    try {
      const res = await fetch("/api/archive", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success(`Archived ${(data.archived?.news ?? 0) + (data.archived?.gallery ?? 0)} items`)
      fetchItems()
    } catch {
      toast.error("Failed to run archival")
    } finally {
      setArchiving(false)
    }
  }

  const handleRestore = async () => {
    if (!restoreTarget) return
    setActioning(true)
    try {
      const res = await fetch("/api/archive/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: restoreTarget.id, type: restoreTarget.type }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Item restored")
      setRestoreTarget(null)
      fetchItems()
    } catch {
      toast.error("Failed to restore")
    } finally {
      setActioning(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActioning(true)
    try {
      const url =
        deleteTarget.type === "berita"
          ? `/api/news/${deleteTarget.id}`
          : `/api/gallery/events/${deleteTarget.id}`
      const res = await fetch(url, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Item deleted permanently")
      setDeleteTarget(null)
      fetchItems()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setActioning(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.arkib")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Archived news and gallery. Content older than 1 year is automatically eligible for archival.
          </p>
        </div>
        <Button
          onClick={handleRunArchival}
          disabled={archiving}
          className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {archiving ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          {t("arkib.runArchival")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="all" className="gap-2">
            {t("arkib.tab.all")}
          </TabsTrigger>
          <TabsTrigger value="berita" className="gap-2">
            <Newspaper className="h-4 w-4" />
            {t("arkib.tab.berita")}
          </TabsTrigger>
          <TabsTrigger value="galeri" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            {t("arkib.tab.galeri")}
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder={t("arkib.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="year_desc">Year (Newest first)</option>
            <option value="year_asc">Year (Oldest first)</option>
            <option value="archived_desc">Date Archived (Newest)</option>
            <option value="archived_asc">Date Archived (Oldest)</option>
            <option value="original_desc">Original Date (Newest)</option>
            <option value="original_asc">Original Date (Oldest)</option>
            <option value="title_asc">Title (A–Z)</option>
            <option value="title_desc">Title (Z–A)</option>
          </select>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {loading ? (
              <div className="flex justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                <Archive className="h-12 w-12 opacity-50" />
                <p>{t("arkib.empty")}</p>
                <p className="text-sm">Run archival to move content older than 1 year to the archive.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">{t("arkib.type")}</th>
                      <th className="min-w-[12rem] px-4 py-3 text-left text-sm font-medium text-foreground">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                        {t("arkib.originalDate")}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                        {t("arkib.archivedAt")}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const title = language === "en" ? item.title : (item.titleMs || item.title)
                      const viewHref =
                        item.type === "berita" ? `/news/${item.id}` : `/gallery?event=${item.id}`
                      return (
                        <tr key={`${item.type}-${item.id}`} className="border-b border-border last:border-0">
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                                item.type === "berita" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent"
                              )}
                            >
                              {item.type === "berita" ? (
                                <Newspaper className="h-3 w-3" />
                              ) : (
                                <ImageIcon className="h-3 w-3" />
                              )}
                              {t(`arkib.tab.${item.type}`)}
                            </span>
                          </td>
                          <td className="max-w-xs truncate px-4 py-3 font-medium text-foreground">
                            {title}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                            {new Date(item.originalDate).toLocaleDateString("en-MY", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                            {item.archivedAt
                              ? new Date(item.archivedAt).toLocaleDateString("en-MY", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Link href={viewHref} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" className="gap-1">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  View
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-primary"
                                onClick={() => setRestoreTarget(item)}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Restore
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(item)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {pagination && pagination.totalPages > 1 && !loading && (
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  {t("admin.pagination.page")} {page} {t("admin.pagination.of")} {pagination.totalPages}
                  {pagination.total > 0 && ` · ${pagination.total} total`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("admin.pagination.prev")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  >
                    {t("admin.pagination.next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Tabs>

      <AlertDialog open={!!restoreTarget} onOpenChange={(o) => !o && setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("arkib.restoreConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the item back to {restoreTarget?.type === "berita" ? "News" : "Gallery"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={actioning}>
              {actioning ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("arkib.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The item will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actioning}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actioning}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actioning ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
