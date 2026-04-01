"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { format } from "date-fns"

const TAGS = ["Program", "Majlis", "Mesyuarat", "Public Holiday", "Lain-lain"] as const
const PER_PAGE = 10

interface CalendarEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  location: string
  tag: string
  imageUrl: string | null
}

export default function AdminCalendarPage() {
  const { t } = useLanguage()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [editing, setEditing] = useState<CalendarEvent | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PER_PAGE),
      })
      if (search) params.set("search", search)
      if (tagFilter && tagFilter !== "all") params.set("tag", tagFilter)
      const res = await fetch(`/api/calendar/events?${params}`)
      const data = await res.json()
      if (data.events) {
        setEvents(data.events)
        setTotal(data.total ?? data.events.length)
      } else {
        setEvents([])
      }
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [page, search, tagFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleAdd = () => {
    if (hasUnsavedChanges && !confirm("You have unsaved changes. Discard?")) return
    setIsNew(true)
    const today = format(new Date(), "yyyy-MM-dd")
    setEditing({
      id: "",
      title: "",
      startDate: today,
      endDate: today,
      location: "",
      tag: "Program",
      imageUrl: null,
    })
    setHasUnsavedChanges(false)
  }

  const handleEdit = (event: CalendarEvent) => {
    if (hasUnsavedChanges && !confirm("You have unsaved changes. Discard?")) return
    setIsNew(false)
    setEditing({
      ...event,
      startDate: event.startDate.split("T")[0],
      endDate: event.endDate.split("T")[0],
    })
    setHasUnsavedChanges(false)
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!editing.location.trim()) {
      toast.error("Location is required")
      return
    }

    setSaving(true)
    try {
      const body = {
        title: editing.title.trim(),
        startDate: editing.startDate,
        endDate: editing.endDate,
        location: editing.location.trim(),
        tag: editing.tag,
        imageUrl: editing.imageUrl || null,
      }
      if (isNew) {
        const res = await fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to create")
        }
        toast.success("Event created")
      } else {
        const res = await fetch(`/api/calendar/events/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to update")
        }
        toast.success("Event updated")
      }
      setEditing(null)
      setIsNew(false)
      setHasUnsavedChanges(false)
      fetchEvents()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return
    try {
      const res = await fetch(`/api/calendar/events/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Event deleted")
      setEditing(null)
      setIsNew(false)
      fetchEvents()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.calendar")}
          </h1>
          <p className="mt-1 text-muted-foreground">{total} events total</p>
        </div>
        <Button
          onClick={handleAdd}
          className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Plus className="h-4 w-4" />
          {t("admin.add")}
        </Button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              {isNew ? "New Event" : "Edit Event"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (hasUnsavedChanges && !confirm("Discard unsaved changes?")) return
                setEditing(null)
                setIsNew(false)
                setHasUnsavedChanges(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Event Title *</Label>
              <Input
                value={editing.title}
                onChange={(e) => {
                  setEditing({ ...editing, title: e.target.value })
                  setHasUnsavedChanges(true)
                }}
                placeholder="e.g. Annual General Meeting"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={editing.startDate}
                onChange={(e) => {
                  setEditing({ ...editing, startDate: e.target.value })
                  setHasUnsavedChanges(true)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input
                type="date"
                value={editing.endDate}
                onChange={(e) => {
                  setEditing({ ...editing, endDate: e.target.value })
                  setHasUnsavedChanges(true)
                }}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Location *</Label>
              <Input
                value={editing.location}
                onChange={(e) => {
                  setEditing({ ...editing, location: e.target.value })
                  setHasUnsavedChanges(true)
                }}
                placeholder="e.g. Dewan Besar LIGS"
              />
            </div>
            <div className="space-y-2">
              <Label>Tag *</Label>
              <Select
                value={editing.tag}
                onValueChange={(v) => {
                  setEditing({ ...editing, tag: v })
                  setHasUnsavedChanges(true)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TAGS.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {t(`calendar.tag.${tag}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUpload
                label="Image (optional)"
                value={editing.imageUrl || ""}
                onChange={(url) => {
                  setEditing({ ...editing, imageUrl: url || null })
                  setHasUnsavedChanges(true)
                }}
                uploadPath="/api/calendar/upload"
                aspectRatio="video"
                accept="image/jpeg,image/png,image/webp"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {saving ? "Saving..." : t("admin.save")}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (hasUnsavedChanges && !confirm("Discard unsaved changes?")) return
                setEditing(null)
                setIsNew(false)
                setHasUnsavedChanges(false)
              }}
            >
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* Filters & Table */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="max-w-[200px]"
          />
          <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {t(`calendar.tag.${tag}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : events.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No events found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Title
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Dates
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Location
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tag
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Image
                      </th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {events.map((event) => (
                      <tr key={event.id} className="hover:bg-accent/20">
                        <td className="px-5 py-4 font-medium text-foreground">{event.title}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {format(new Date(event.startDate), "PP")}
                          {event.startDate !== event.endDate && (
                            <> – {format(new Date(event.endDate), "PP")}</>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{event.location}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                            {t(`calendar.tag.${event.tag}`)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {event.imageUrl ? (
                            <img
                              src={event.imageUrl}
                              alt=""
                              className="h-12 w-16 rounded object-cover"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(event)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
