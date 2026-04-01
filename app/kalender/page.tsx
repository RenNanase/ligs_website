"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar as CalendarIcon,
  X,
  Download,
  Loader2,
} from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns"
import { enUS, ms } from "date-fns/locale"
import type { Locale } from "date-fns"

const TAGS = ["Program", "Majlis", "Mesyuarat", "Public Holiday", "Lain-lain"] as const
const TAG_COLORS: Record<string, string> = {
  Program: "bg-blue-500",
  Majlis: "bg-emerald-500",
  Mesyuarat: "bg-amber-500",
  "Public Holiday": "bg-rose-500",
  "Lain-lain": "bg-slate-500",
}

interface CalendarEvent {
  id: string
  title: string
  startDate: string
  endDate: string
  location: string
  tag: string
  imageUrl: string | null
}

function UpcomingEventCard({
  ev,
  locale,
  onClick,
  tagColors,
}: {
  ev: CalendarEvent
  locale: Locale
  onClick: () => void
  tagColors: Record<string, string>
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-h-[72px] items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-accent/50 hover:shadow-sm active:bg-muted/30 sm:gap-4 sm:min-h-0"
    >
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-semibold sm:h-14 sm:w-14">
        {format(parseISO(ev.startDate), "d")}
        <span className="text-[10px] font-normal text-muted-foreground sm:text-xs">
          {format(parseISO(ev.startDate), "MMM")}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground line-clamp-2 sm:truncate sm:line-clamp-none">{ev.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 sm:mt-0 sm:truncate sm:line-clamp-none">{ev.location}</p>
      </div>
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${tagColors[ev.tag] ?? "bg-muted"}`}
        aria-hidden
      />
    </button>
  )
}

function generateICalUrl(event: CalendarEvent): string {
  const start = format(parseISO(event.startDate), "yyyyMMdd")
  const end = format(parseISO(event.endDate), "yyyyMMdd")
  const title = encodeURIComponent(event.title)
  const location = encodeURIComponent(event.location)
  return `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART;VALUE=DATE:${start}%0ADTEND;VALUE=DATE:${end}%0ASUMMARY:${title}%0ALOCATION:${location}%0AEND:VEVENT%0AEND:VCALENDAR`
}

function EventModal({
  event,
  onClose,
  t,
  language,
}: {
  event: CalendarEvent
  onClose: () => void
  t: (k: string) => string
  language: string
}) {
  const [imageZoom, setImageZoom] = useState(false)
  const locale = language === "ms" ? ms : enUS

  const dateRange =
    event.startDate === event.endDate
      ? format(parseISO(event.startDate), "PPP", { locale })
      : `${format(parseISO(event.startDate), "PPP", { locale })} – ${format(parseISO(event.endDate), "PPP", { locale })}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-lg animate-in fade-in-0 zoom-in-95 duration-200 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-foreground hover:bg-accent/20 hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {event.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <img
                src={event.imageUrl}
                alt=""
                className="h-full w-full object-cover cursor-zoom-in"
                onClick={() => setImageZoom(true)}
              />
            </div>
          )}
          <div className="p-6">
            <div className="mb-4 pr-10">
              <h2 id="event-modal-title" className="text-xl font-semibold text-foreground">
                {event.title}
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="h-4 w-4 shrink-0" />
                <time dateTime={event.startDate}>{dateRange}</time>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{event.location}</span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    TAG_COLORS[event.tag] ?? "bg-muted"
                  } text-white`}
                >
                  {t(`calendar.tag.${event.tag}`)}
                </span>
              </div>
            </div>
            <a
              href={generateICalUrl(event)}
              download={`${event.title.replace(/\s+/g, "-")}.ics`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent/20 transition-colors"
            >
              <Download className="h-4 w-4" />
              {t("calendar.addToCalendar")}
            </a>
          </div>
        </div>
      </div>
      {imageZoom && event.imageUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setImageZoom(false)}
        >
          <img
            src={event.imageUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default function KalenderPage() {
  const { language, t } = useLanguage()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [tagFilter, setTagFilter] = useState<string>("")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const locale = language === "ms" ? ms : enUS

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        year: String(currentMonth.getFullYear()),
        month: String(currentMonth.getMonth() + 1),
        limit: "50",
      })
      if (tagFilter) params.set("tag", tagFilter)

      const fromToday = format(new Date(), "yyyy-MM-dd")
      const upcomingParams = new URLSearchParams({
        limit: "10",
        from: fromToday,
      })
      if (tagFilter) upcomingParams.set("tag", tagFilter)

      const [monthRes, upcomingRes] = await Promise.all([
        fetch(`/api/calendar/events?${params}`),
        fetch(`/api/calendar/events?${upcomingParams}`),
      ])
      const monthData = await monthRes.json()
      const upcomingData = await upcomingRes.json()

      setEvents(monthData.events || [])
      setUpcomingEvents(upcomingData.events || [])
    } catch {
      setEvents([])
      setUpcomingEvents([])
    } finally {
      setLoading(false)
    }
  }, [currentMonth, tagFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const weeks: Date[][] = []
  let day = calStart
  while (day <= calEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    weeks.push(week)
  }

  const getEventsForDate = (d: Date) => {
    const dayStr = format(d, "yyyy-MM-dd")
    return events.filter((e) => {
      const startStr = String(e.startDate).slice(0, 10)
      const endStr = String(e.endDate).slice(0, 10)
      return dayStr >= startStr && dayStr <= endStr
    })
  }

  const handlePrevMonth = () => setCurrentMonth((m) => subMonths(m, 1))
  const handleNextMonth = () => setCurrentMonth((m) => addMonths(m, 1))
  const handleToday = () => setCurrentMonth(new Date())

  const minSwipeDistance = 50
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const onTouchEnd = () => {
    if (!touchStart || touchEnd === null) return
    const diff = touchStart - touchEnd
    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) handleNextMonth()
      else handlePrevMonth()
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  const dayNames = language === "ms" ? ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <>
      <PageHeader
        title={t("calendar.title")}
        subtitle={t("calendar.subtitle")}
      />
      <section className="bg-primary-bg py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Controls */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="rounded-full p-2 text-muted-foreground hover:bg-accent/20 hover:text-foreground transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="min-w-[180px] text-center text-lg font-semibold text-foreground">
                {format(currentMonth, "MMMM yyyy", { locale })}
              </h2>
              <button
                type="button"
                onClick={handleNextMonth}
                className="rounded-full p-2 text-muted-foreground hover:bg-accent/20 hover:text-foreground transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToday}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent/20 transition-colors"
              >
                {t("calendar.today")}
              </button>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm"
              >
                <option value="">{t("calendar.filterByTag")}</option>
                {TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {t(`calendar.tag.${tag}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar Grid */}
          <div
            ref={containerRef}
            className="touch-pan-y overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {dayNames.map((name) => (
                <div
                  key={name}
                  className="py-2 md:py-3 text-center text-[10px] md:text-xs font-semibold uppercase text-muted-foreground"
                >
                  {name}
                </div>
              ))}
            </div>
            {loading ? (
              <div className="flex min-h-[280px] md:min-h-[320px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {weeks.flatMap((week) =>
                  week.map((day) => {
                    const dayEvents = getEventsForDate(day)
                    const inMonth = isSameMonth(day, currentMonth)
                    const hasEvents = dayEvents.length > 0
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[3.5rem] md:min-h-[4.5rem] border-b border-r border-border p-0.5 md:p-1 last:border-r-0 ${
                          !inMonth ? "bg-muted/20" : hasEvents ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full min-h-[3rem] md:min-h-[4rem]">
                          <span
                            className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full text-xs md:text-sm ${
                              isToday(day)
                                ? "bg-primary text-primary-foreground font-semibold"
                                : inMonth
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                          {/* Event indicator dots inside the calendar */}
                          <div className="mt-1 flex flex-wrap justify-center gap-1 max-w-full px-0.5">
                            {dayEvents.length > 0 ? (
                              <>
                                {dayEvents.slice(0, 4).map((ev) => (
                                  <button
                                    key={ev.id}
                                    type="button"
                                    onClick={() => setSelectedEvent(ev)}
                                    className={`h-2.5 w-2.5 md:h-3 md:w-3 rounded-full shrink-0 shadow-sm ${TAG_COLORS[ev.tag] ?? "bg-muted"} hover:scale-125 hover:ring-2 hover:ring-offset-1 hover:ring-accent transition-all duration-200`}
                                    title={ev.title}
                                    aria-label={ev.title}
                                  />
                                ))}
                                {dayEvents.length > 4 && (
                                  <span className="text-[9px] md:text-[10px] text-muted-foreground shrink-0 font-medium">
                                    +{dayEvents.length - 4}
                                  </span>
                                )}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium">{t("calendar.legend")}:</span>
            {TAGS.map((tag) => (
              <span key={tag} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${TAG_COLORS[tag] ?? "bg-muted"}`} />
                {t(`calendar.tag.${tag}`)}
              </span>
            ))}
          </div>

          {/* Mobile: Event list for current month */}
          <div className="mt-6 md:hidden">
            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-border bg-card">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-16 text-center text-muted-foreground">
                {t("calendar.empty")}
              </div>
            ) : (
              <div className="space-y-2">
                {events.slice(0, 20).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedEvent(ev)}
                    className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-accent/50 hover:shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{ev.title}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {format(parseISO(ev.startDate), "PP", { locale })}
                          {ev.startDate !== ev.endDate &&
                            ` – ${format(parseISO(ev.endDate), "PP", { locale })}`}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 h-2 w-2 rounded-full mt-1.5 ${TAG_COLORS[ev.tag] ?? "bg-muted"}`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events - 4 displayed, carousel when more than 4 */}
          <div className="mt-10 sm:mt-12">
            <h3 className="mb-4 font-heading text-lg font-semibold text-foreground sm:text-xl">
              {t("calendar.upcoming")}
            </h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t("calendar.empty")}</p>
            ) : upcomingEvents.length <= 4 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {upcomingEvents.map((ev) => (
                  <UpcomingEventCard
                    key={ev.id}
                    ev={ev}
                    locale={locale}
                    onClick={() => setSelectedEvent(ev)}
                    tagColors={TAG_COLORS}
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Mobile: 2 events per slide for easier browsing */}
                <div className="relative px-4 sm:hidden">
                  <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent>
                      {(() => {
                        const mobileChunks: CalendarEvent[][] = []
                        for (let i = 0; i < upcomingEvents.length; i += 2) {
                          mobileChunks.push(upcomingEvents.slice(i, i + 2))
                        }
                        return mobileChunks.map((chunk, idx) => (
                          <CarouselItem key={idx} className="pl-4">
                            <div className="flex flex-col gap-3">
                              {chunk.map((ev) => (
                                <UpcomingEventCard
                                  key={ev.id}
                                  ev={ev}
                                  locale={locale}
                                  onClick={() => setSelectedEvent(ev)}
                                  tagColors={TAG_COLORS}
                                />
                              ))}
                            </div>
                          </CarouselItem>
                        ))
                      })()}
                    </CarouselContent>
                    <CarouselPrevious className="-left-1 h-9 w-9" />
                    <CarouselNext className="-right-1 h-9 w-9" />
                  </Carousel>
                </div>
                {/* Desktop: 4 events per slide */}
                <div className="relative hidden px-12 sm:block">
                  <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent>
                      {(() => {
                        const chunks: CalendarEvent[][] = []
                        for (let i = 0; i < upcomingEvents.length; i += 4) {
                          chunks.push(upcomingEvents.slice(i, i + 4))
                        }
                        return chunks.map((chunk, idx) => (
                          <CarouselItem key={idx} className="pl-4">
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {chunk.map((ev) => (
                                <UpcomingEventCard
                                  key={ev.id}
                                  ev={ev}
                                  locale={locale}
                                  onClick={() => setSelectedEvent(ev)}
                                  tagColors={TAG_COLORS}
                                />
                              ))}
                            </div>
                          </CarouselItem>
                        ))
                      })()}
                    </CarouselContent>
                    <CarouselPrevious className="-left-8" />
                    <CarouselNext className="-right-8" />
                  </Carousel>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          t={t}
          language={language}
        />
      )}
    </>
  )
}
