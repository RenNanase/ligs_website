"use client"

import { Suspense } from "react"
import { useLanguage } from "@/lib/language-context"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/sections/page-header"
import { LazyImage } from "@/components/gallery/lazy-image"
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
import { Search, ArrowLeft, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { format } from "date-fns"

const THUMB_SIZE = 300
const PAGE_SIZE = 48
const THUMB_WINDOW = 21

interface GalleryEventRow {
  id: string
  title: string
  date: string
  images: { id: string; url: string }[]
  _count?: { images: number }
}

interface GalleryEventMeta {
  id: string
  title: string
  date: string
  imageCount: number
}

interface GalleryImageRow {
  id: string
  url: string
  sortOrder?: number
}

function GalleryPageContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const eventIdFromUrl = searchParams.get("event")
  const [events, setEvents] = useState<GalleryEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("date_desc")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const [selectedMeta, setSelectedMeta] = useState<GalleryEventMeta | null>(null)
  const [loadedImages, setLoadedImages] = useState<GalleryImageRow[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [loadingModal, setLoadingModal] = useState(false)
  const [loadingMoreImages, setLoadingMoreImages] = useState(false)
  const [totalImageCount, setTotalImageCount] = useState(0)
  const [hasMoreImages, setHasMoreImages] = useState(false)
  const nextPageRef = useRef(2)

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

  useEffect(() => {
    loadEvents()
  }, [page, search, sort])

  const openEventFromMeta = useCallback(async (meta: GalleryEventMeta) => {
    setLoadingModal(true)
    setSelectedMeta(meta)
    setLightboxIndex(0)
    setLoadedImages([])
    nextPageRef.current = 2
    setTotalImageCount(meta.imageCount)
    setHasMoreImages(false)

    try {
      const res = await fetch(
        `/api/gallery/events/${meta.id}/images?page=1&limit=${PAGE_SIZE}`
      )
      const data = await res.json()
      setLoadedImages(data.images || [])
      setHasMoreImages(Boolean(data.hasMore))
      setTotalImageCount(typeof data.total === "number" ? data.total : meta.imageCount)
    } catch {
      setLoadedImages([])
    } finally {
      setLoadingModal(false)
    }
  }, [])

  const loadMoreImages = useCallback(async () => {
    if (!selectedMeta || !hasMoreImages || loadingMoreImages) return
    setLoadingMoreImages(true)
    try {
      const p = nextPageRef.current
      const res = await fetch(
        `/api/gallery/events/${selectedMeta.id}/images?page=${p}&limit=${PAGE_SIZE}`
      )
      const data = await res.json()
      setLoadedImages((prev) => [...prev, ...(data.images || [])])
      setHasMoreImages(Boolean(data.hasMore))
      nextPageRef.current = p + 1
    } catch {
      /* ignore */
    } finally {
      setLoadingMoreImages(false)
    }
  }, [selectedMeta, hasMoreImages, loadingMoreImages])

  useEffect(() => {
    if (!eventIdFromUrl) return
    fetch(`/api/gallery/events/${eventIdFromUrl}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GalleryEventMeta | null) => {
        if (data?.id) openEventFromMeta(data)
      })
      .catch(() => {})
  }, [eventIdFromUrl, openEventFromMeta])

  const openEvent = async (ev: GalleryEventRow) => {
    const meta = await fetch(`/api/gallery/events/${ev.id}`).then((r) => r.json())
    await openEventFromMeta(meta)
  }

  const closeModal = () => {
    setSelectedMeta(null)
    setLoadedImages([])
    setLightboxIndex(0)
    setTotalImageCount(0)
    setHasMoreImages(false)
    nextPageRef.current = 2
  }

  const totalImages = totalImageCount || selectedMeta?.imageCount || loadedImages.length
  const currentImage = loadedImages[lightboxIndex]
  const canGoPrev = lightboxIndex > 0
  const canGoNext = lightboxIndex < totalImages - 1

  const handlePrev = () => {
    if (canGoPrev) setLightboxIndex((i) => i - 1)
  }

  const handleNext = async () => {
    if (lightboxIndex < loadedImages.length - 1) {
      setLightboxIndex((i) => i + 1)
      return
    }
    if (hasMoreImages) {
      await loadMoreImages()
      setLightboxIndex((i) => i + 1)
    }
  }

  const thumbStart = Math.max(0, lightboxIndex - Math.floor(THUMB_WINDOW / 2))
  const thumbEnd = Math.min(loadedImages.length, thumbStart + THUMB_WINDOW)
  const thumbSlice = loadedImages.slice(thumbStart, thumbEnd)

  return (
    <>
      <PageHeader title={t("gallery.title")} subtitle={t("gallery.subtitle")} />

      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-7xl px-6">
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
                              <LazyImage
                                src={img.url}
                                alt=""
                                className="h-full w-full object-cover"
                                rootMargin="80px"
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
                        <LazyImage
                          src={img.url}
                          alt=""
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          rootMargin="120px"
                          width={THUMB_SIZE}
                          height={THUMB_SIZE}
                        />
                      </div>
                    ))}
                    {(ev.images || []).length === 0 && (
                      <div className="col-span-2 flex aspect-video items-center justify-center bg-muted text-muted-foreground">
                        {t("gallery.noImages")}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border p-4">
                    <h3 className="font-semibold text-foreground">{ev.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {format(new Date(ev.date), "MMM d, yyyy")} ·{" "}
                      {ev._count?.images ?? ev.images?.length ?? 0} {t("gallery.images")}
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

      <Dialog open={!!selectedMeta} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent
          className="flex max-h-[95vh] min-h-0 w-[min(100vw-2rem,56rem)] max-w-4xl flex-col gap-0 overflow-x-hidden overflow-y-auto border-0 bg-transparent p-0 shadow-none [&>button]:sr-only"
          onPointerDownOutside={closeModal}
        >
          <DialogTitle className="sr-only">
            {selectedMeta?.title} -{" "}
            {selectedMeta?.date ? format(new Date(selectedMeta.date), "MMM d, yyyy") : ""}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {selectedMeta ? `View images from this event (${totalImageCount} total)` : ""}
          </DialogDescription>

          {selectedMeta && (
            <div className="min-w-0 rounded-xl border border-border bg-card shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading break-words text-xl font-semibold leading-snug text-foreground">
                    {selectedMeta.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {format(new Date(selectedMeta.date), "MMMM d, yyyy")} · {totalImages}{" "}
                    {t("gallery.images")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                  aria-label="Close"
                  className="shrink-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {loadingModal ? (
                <div className="flex justify-center py-24">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : loadedImages.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">{t("gallery.noImages")}</div>
              ) : (
                <div className="relative min-w-0 p-6">
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!canGoPrev}
                      onClick={handlePrev}
                      aria-label="Previous image"
                      className="shrink-0"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex min-h-[200px] min-w-0 flex-1 items-center justify-center bg-muted/20">
                      {currentImage ? (
                        <img
                          src={currentImage.url}
                          alt=""
                          className="mx-auto block max-h-[min(70vh,calc(95vh-16rem))] w-auto max-w-full rounded-lg object-contain object-center"
                          decoding="async"
                        />
                      ) : (
                        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={!canGoNext || (lightboxIndex >= loadedImages.length - 1 && loadingMoreImages)}
                      onClick={handleNext}
                      aria-label="Next image"
                      className="shrink-0"
                    >
                      {lightboxIndex >= loadedImages.length - 1 && loadingMoreImages ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    {lightboxIndex + 1} / {totalImages}
                  </p>

                  <div className="mt-4 flex max-w-full gap-1.5 overflow-x-auto overflow-y-hidden pb-2 pt-1 scrollbar-thin">
                    {thumbStart > 0 && (
                      <span className="flex shrink-0 items-center px-1 text-xs text-muted-foreground">…</span>
                    )}
                    {thumbSlice.map((img, i) => {
                      const globalIdx = thumbStart + i
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setLightboxIndex(globalIdx)}
                          className={`h-12 w-12 shrink-0 overflow-hidden rounded border-2 transition ${
                            globalIdx === lightboxIndex
                              ? "border-primary"
                              : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                        >
                          <LazyImage
                            src={img.url}
                            alt=""
                            className="h-full w-full object-cover"
                            rootMargin="400px"
                          />
                        </button>
                      )
                    })}
                    {thumbEnd < loadedImages.length && (
                      <span className="flex shrink-0 items-center px-1 text-xs text-muted-foreground">…</span>
                    )}
                  </div>
                  {loadingMoreImages && (
                    <p className="mt-2 text-center text-xs text-muted-foreground">Loading more images…</p>
                  )}
                </div>
              )}

              <div className="border-t border-border px-6 py-4">
                <Button variant="outline" onClick={closeModal} className="gap-2">
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
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden="true"
        />
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
