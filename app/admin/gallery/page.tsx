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
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react"
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
        <DialogContent className="flex h-[min(90vh,640px)] max-h-[90vh] w-[min(95vw,520px)] max-w-[95vw] flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle>Create Gallery Event</DialogTitle>
            <DialogDescription className="sr-only">
              Add a new gallery event with title, date, and optional images.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div>
              <Label htmlFor="gallery-title">Event Title (required)</Label>
              <Input
                id="gallery-title"
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Annual Meeting 2026"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="gallery-date">Event Date (required)</Label>
              <Input
                id="gallery-date"
                type="date"
                value={createForm.date}
                onChange={(e) => setCreateForm((f) => ({ ...f, date: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="min-w-0">
              <Label>Images (optional, up to 20)</Label>
              <MultiImageUpload
                value={createForm.imageUrls}
                onChange={(urls) => setCreateForm((f) => ({ ...f, imageUrls: urls }))}
                uploadPath="/api/gallery/upload"
                maxFiles={20}
                className="mt-1 min-w-0"
              />
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
          <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                if (hasUnsavedCreate && !confirm("Discard changes?")) return
                setCreateOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createSaving}>
              {createSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
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
