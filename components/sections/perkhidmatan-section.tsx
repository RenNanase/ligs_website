"use client"

import { useLanguage } from "@/lib/language-context"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const ITEMS_PER_VIEW = 6
const AUTO_PLAY_INTERVAL_MS = 5000
const SLIDE_TRANSITION_MS = 650
const STAGGER_DELAY_MS = 300
const FADE_DURATION_MS = 400

const SLIDE_EASING = "cubic-bezier(0.25, 0.1, 0.25, 1)"

interface PerkhidmatanItem {
  id: string
  name: string
  logoPath: string
  url: string
  section: string
  isActive: boolean
  sortOrder: number
}

function getInitials(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, 2).toUpperCase() || "—"
}

function LogoCard({
  item,
  itemIndex,
  isActive,
}: {
  item: PerkhidmatanItem
  itemIndex: number
  isActive: boolean
}) {
  const isExternal = item.url.startsWith("http")
  const delayMs = itemIndex * STAGGER_DELAY_MS

  const content = (
    <div
      className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:ring-2 hover:ring-primary/20 sm:p-5 sm:gap-3"
      style={
        isActive
          ? {
              opacity: 0,
              animationName: "perkhidmatan-fade-in",
              animationDuration: `${FADE_DURATION_MS}ms`,
              animationTimingFunction: SLIDE_EASING,
              animationFillMode: "forwards",
              animationDelay: `${delayMs}ms`,
            }
          : { animation: "none" }
      }
    >
      {item.logoPath ? (
        <img
          src={item.logoPath}
          alt={item.name}
          className="h-16 w-auto max-w-[100px] object-contain sm:h-20 sm:max-w-[120px]"
        />
      ) : (
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-xl font-semibold uppercase text-primary sm:h-20 sm:w-20"
          aria-hidden
        >
          {getInitials(item.name)}
        </div>
      )}
    </div>
  )

  const trigger = isExternal ? (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      {content}
    </a>
  ) : (
    <Link href={item.url}>{content}</Link>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        {item.name}
      </TooltipContent>
    </Tooltip>
  )
}

export function PerkhidmatanSection() {
  const { t } = useLanguage()
  const [items, setItems] = useState<PerkhidmatanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0)
  const [visitCount, setVisitCount] = useState<Record<number, number>>({})

  useEffect(() => {
    fetch("/api/perkhidmatan")
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const slides = items.reduce<PerkhidmatanItem[][]>((acc, item, i) => {
    const chunkIdx = Math.floor(i / ITEMS_PER_VIEW)
    if (!acc[chunkIdx]) acc[chunkIdx] = []
    acc[chunkIdx].push(item)
    return acc
  }, [])
  const totalSlides = Math.max(1, slides.length)

  const goToSlide = useCallback((idx: number) => {
    setSlideIndex(idx)
    setVisitCount((vc) => ({ ...vc, [idx]: (vc[idx] ?? 0) + 1 }))
  }, [])

  useEffect(() => {
    setVisitCount((vc) => ({ ...vc, [slideIndex]: (vc[slideIndex] ?? 0) + 1 }))
  }, [slideIndex])

  useEffect(() => {
    if (totalSlides <= 1) return
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % totalSlides)
    }, AUTO_PLAY_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [totalSlides])

  if (items.length === 0 && !loading) return null

  return (
    <section className="bg-primary-bg py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold text-card-foreground md:text-4xl">
            {t("perkhidmatan.homeTitle")}
          </h2>
        </div>

        {loading ? (
          <div className="grid min-h-[180px] place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <TooltipProvider delayDuration={300}>
            <div className="relative overflow-hidden">
              <style>{`
              @keyframes perkhidmatan-fade-in {
                from { opacity: 0; transform: scale(0.96); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
            <div
              className="flex"
              style={{
                transform: `translateX(-${slideIndex * 100}%)`,
                transition: `transform ${SLIDE_TRANSITION_MS}ms ${SLIDE_EASING}`,
              }}
            >
              {slides.map((slideItems, idx) => (
                <div
                  key={idx}
                  className="grid w-full min-w-full shrink-0 grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
                >
                  {slideItems.map((item, itemIdx) => (
                    <LogoCard
                      key={`${item.id}-${itemIdx}-v${visitCount[idx] ?? 0}`}
                      item={item}
                      itemIndex={itemIdx}
                      isActive={idx === slideIndex}
                    />
                  ))}
                </div>
              ))}
            </div>

            {totalSlides > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === slideIndex
                        ? "w-6 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            )}
            </div>
          </TooltipProvider>
        )}
      </div>
    </section>
  )
}
