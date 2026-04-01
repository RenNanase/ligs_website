"use client"

import { Suspense } from "react"
import { useLanguage } from "@/lib/language-context"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/sections/page-header"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"

interface GalleryEvent {
  id: string
  title: string
  date: string
  images: { id: string; url: string }[]
  _count?: { images: number }
}

const THUMB_SIZE = 300
const LIGHTBOX_SIZE = 600

function GalleryPageContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const eventIdFromUrl = searchParams.get("event")
  const [events, setEvents] = useState<GalleryEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("date_desc")
  const [selectedEvent, setSelectedEvent] = useState<GalleryEvent | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

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

  // Open archived event from URL (?event=id)
  useEffect(() => {
    if (!eventIdFromUrl) return
    fetch(`/api/gallery/events/${eventIdFromUrl}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSelectedEvent(data)
          setLightboxIndex(0)
        }
      })
      .catch(() => {})
  }, [eventIdFromUrl])

  const openEvent = async (ev: GalleryEvent) => {
    const full = await fetch(`/api/gallery/events/${ev.id}`).then((r) => r.json())
    setSelectedEvent(full)
    setLightboxIndex(0)
  }

  const eventImages = selectedEvent?.images || []
  const currentImage = eventImages[lightboxIndex]

  return (
    <>
      <PageHeader title={t("gallery.title")} subtitle={t("gallery.subtitle")} />

      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-7xl px-6">
          {/* Search & Filter */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder={t("gallery.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label={t("gallery.search")}
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Sort by"
              >
                <option value="date_desc">{t("gallery.sortNewest")}</option>
                <option value="date_asc">{t("gallery.sortOldest")}</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
              >
                Table
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-muted-foreground">{t("gallery.empty")}</p>
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev) => (
                    <TableRow
                      key={ev.id}
                      className="cursor-pointer hover:bg-accent/20"
                      onClick={() => openEvent(ev)}
                    >
                      <TableCell className="font-medium">{ev.title}</TableCell>
                      <TableCell>{format(new Date(ev.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {(ev.images || []).slice(0, 4).map((img) => (
                            <div
                              key={img.id}
                              className="h-12 w-12 shrink-0 overflow-hidden rounded border border-border bg-muted"
                            >
                              <img
                                src={img.url}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          {t("gallery.viewEvent")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => openEvent(ev)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {(ev.images || []).slice(0, 6).map((img) => (
                      <div
                        key={img.id}
                        className="aspect-square overflow-hidden rounded-lg bg-muted"
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                          width={THUMB_SIZE}
                          height={THUMB_SIZE}
                        />
                      </div>
                    ))}
                    {(ev.images || []).length === 0 && (
                      <div className="col-span-2 aspect-video flex items-center justify-center bg-muted text-muted-foreground">
                        {t("gallery.noImages")}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border p-4">
                    <h3 className="font-semibold text-foreground">{ev.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {format(new Date(ev.date), "MMM d, yyyy")} · {(ev._count?.images ?? ev.images?.length ?? 0)} {t("gallery.images")}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
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
        </div>
      </section>

      {/* Event Detail Modal with Lightbox */}
      <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        <DialogContent
          className="max-h-[95vh] max-w-4xl overflow-hidden border-0 bg-transparent p-0 shadow-none [&>button]:sr-only"
          onPointerDownOutside={() => setSelectedEvent(null)}
        >
          <DialogTitle className="sr-only">
            {selectedEvent?.title} - {selectedEvent?.date ? format(new Date(selectedEvent.date), "MMM d, yyyy") : ""}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {selectedEvent ? `View ${selectedEvent.images?.length ?? 0} images from this event` : ""}
          </DialogDescription>

          {selectedEvent && (
            <div className="rounded-xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="font-heading text-xl font-semibold text-foreground">{selectedEvent.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedEvent.date), "MMMM d, yyyy")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {eventImages.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">{t("gallery.noImages")}</div>
              ) : (
                <div className="relative p-6">
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={lightboxIndex <= 0}
                      onClick={() => setLightboxIndex((i) => i - 1)}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex max-h-[70vh] min-h-[300px] items-center justify-center">
                      <img
                        src={currentImage?.url}
                        alt=""
                        className="max-h-[70vh] max-w-full rounded-lg object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={lightboxIndex >= eventImages.length - 1}
                      onClick={() => setLightboxIndex((i) => i + 1)}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    {lightboxIndex + 1} / {eventImages.length}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {eventImages.map((img, i) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        className={`h-12 w-12 shrink-0 overflow-hidden rounded border-2 transition ${
                          i === lightboxIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-border px-6 py-4">
                <Button variant="outline" onClick={() => setSelectedEvent(null)} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t("gallery.back")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function GalleryPageFallback() {
  return (
    <section className="bg-primary-bg py-16">
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
      </div>
    </section>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<GalleryPageFallback />}>
      <GalleryPageContent />
    </Suspense>
  )
}
