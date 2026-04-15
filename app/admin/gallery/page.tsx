"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MultiImageUpload } from "@/components/admin/multi-image-upload"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Loader2, Search, Images, CalendarDays, Type } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { format } from "date-fns"

interface GalleryEvent {
  id: string
  title: string
  date: string
  images: { id: string; url: string }[]
  _count?: { images: number }
}

export default function AdminGalleryPage() {
  const [events, setEvents] = useState<GalleryEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("date_desc")
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GalleryEvent | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [createForm, setCreateForm] = useState({ title: "", date: format(new Date(), "yyyy-MM-dd"), imageUrls: [] as string[] })
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState("")

  const loadEvents = () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      search,
      sort,
    })
    fetch(`/api/gallery/events?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || [])
        setTotalPages(data.pagination?.totalPages || 1)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadEvents() }, [page, search, sort])

  const handleCreate = async () => {
    setCreateError("")
    if (!createForm.title.trim()) {
      setCreateError("Title is required")
      return
    }
    setCreateSaving(true)
    try {
      const res = await fetch("/api/gallery/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createForm.title.trim(),
          date: createForm.date,
          imageUrls: createForm.imageUrls,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create")
      toast.success("Event created")
      setCreateOpen(false)
      setCreateForm({ title: "", date: format(new Date(), "yyyy-MM-dd"), imageUrls: [] })
      loadEvents()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create")
    } finally {
      setCreateSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/gallery/events/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Event deleted")
      setDeleteTarget(null)
      loadEvents()
    } catch {
      toast.error("Failed to delete")
    } finally {
      setDeleting(false)
    }
  }

  const hasUnsavedCreate = createForm.title.trim() || createForm.imageUrls.length > 0

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">Gallery (Galeri)</h1>
        <p className="mt-1 text-muted-foreground">
          Manage event-based image galleries. Create events, upload images, and reorder as needed.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No events yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
            Create your first event
          </Button>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium">{ev.title}</TableCell>
                    <TableCell>{format(new Date(ev.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{ev._count?.images ?? ev.images?.length ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/gallery/${ev.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(ev)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open && hasUnsavedCreate && !confirm("Discard unsaved changes?")) return
          setCreateOpen(open)
          if (!open) {
            setCreateForm({ title: "", date: format(new Date(), "yyyy-MM-dd"), imageUrls: [] })
            setCreateError("")
          }
        }}
      >
        <DialogContent className="flex h-[min(92vh,680px)] max-h-[92vh] w-[min(95vw,560px)] max-w-[95vw] flex-col gap-0 overflow-hidden border border-neutral-200/90 bg-white p-0 shadow-2xl ring-1 ring-black/5 sm:rounded-2xl [&>button]:right-5 [&>button]:top-5 [&>button]:rounded-full [&>button]:text-neutral-500 [&>button]:hover:bg-neutral-100 [&>button]:hover:text-neutral-900">
          <DialogHeader className="shrink-0 space-y-0 border-b border-neutral-100 bg-white px-6 pb-5 pt-6 text-left sm:px-8 sm:pt-7">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary shadow-inner">
                <Images className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
                <DialogTitle className="text-xl font-semibold tracking-tight text-neutral-900">
                  New gallery event
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-neutral-500">
                  Add a title and date, then optionally attach images. There is no limit; large batches upload in chunks.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-6 sm:px-8">
            <div className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label
                    htmlFor="gallery-title"
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500"
                  >
                    <Type className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Event title
                    <span className="font-normal normal-case text-destructive">*</span>
                  </Label>
                  <Input
                    id="gallery-title"
                    value={createForm.title}
                    onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Annual Meeting 2026"
                    className="h-11 border-neutral-200 bg-white text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus-visible:border-primary focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2 sm:max-w-xs">
                  <Label
                    htmlFor="gallery-date"
                    className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500"
                  >
                    <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />
                    Event date
                    <span className="font-normal normal-case text-destructive">*</span>
                  </Label>
                  <Input
                    id="gallery-date"
                    type="date"
                    value={createForm.date}
                    onChange={(e) => setCreateForm((f) => ({ ...f, date: e.target.value }))}
                    className="h-11 border-neutral-200 bg-white text-neutral-900 shadow-sm focus-visible:border-primary focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="min-w-0 rounded-xl border border-neutral-200/90 bg-neutral-50/40 p-4 sm:p-5">
                <Label className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <Images className="h-3.5 w-3.5 text-primary" aria-hidden />
                  Images
                  <span className="font-normal normal-case text-neutral-400"></span>
                </Label>
                
                <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-1 sm:p-2">
                  <MultiImageUpload
                    value={createForm.imageUrls}
                    onChange={(urls) =>
                      setCreateForm((f) => ({
                        ...f,
                        imageUrls: typeof urls === "function" ? urls(f.imageUrls) : urls,
                      }))
                    }
                    uploadPath="/api/gallery/upload"
                    uploadSearchParams={
                      createForm.title.trim() ? { eventTitle: createForm.title.trim() } : undefined
                    }
                    disabled={!createForm.title.trim()}
                    className="min-w-0"
                  />
                </div>
              </div>

              {createError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                  {createError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="shrink-0 gap-2 border-t border-neutral-100 bg-white px-6 py-4 sm:flex-row sm:justify-end sm:px-8 sm:py-5">
            <Button
              type="button"
              variant="ghost"
              className="text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
              onClick={() => {
                if (hasUnsavedCreate && !confirm("Discard changes?")) return
                setCreateOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={createSaving}
              className="min-w-[120px] gap-2 rounded-lg font-semibold shadow-sm"
            >
              {createSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create event"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This will permanently remove the event
              and all its images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
