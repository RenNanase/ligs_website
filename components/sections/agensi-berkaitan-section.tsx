"use client"

import { useLanguage } from "@/lib/language-context"
import { useEffect, useState, useCallback } from "react"

const ITEMS_PER_VIEW = 6
const AUTO_PLAY_INTERVAL_MS = 5000
const SLIDE_TRANSITION_MS = 650
const STAGGER_DELAY_MS = 300
const FADE_DURATION_MS = 400
const SLIDE_EASING = "cubic-bezier(0.25, 0.1, 0.25, 1)"

interface AgensiBerkaitanItem {
  id: string
  name: string
  logoPath: string
  url: string
  isActive: boolean
  sortOrder: number
}

export function AgensiBerkaitanSection() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AgensiBerkaitanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0)
  const [visitCount, setVisitCount] = useState<Record<number, number>>({})

  useEffect(() => {
    fetch("/api/agensi-berkaitan")
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const slides = items.reduce<AgensiBerkaitanItem[][]>((acc, item, i) => {
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
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold text-card-foreground md:text-4xl">
            {t("agensiBerkaitan.title")}
          </h2>
        </div>

        {loading ? (
          <div className="grid min-h-[180px] place-items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <style>{`
              @keyframes agensi-fade-in {
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
                  {slideItems.map((item, itemIdx) => {
                    const isActive = idx === slideIndex
                    const delayMs = itemIdx * STAGGER_DELAY_MS
                    return (
                      <a
                        key={`${item.id}-v${visitCount[idx] ?? 0}`}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:ring-2 hover:ring-primary/20 sm:p-5 sm:gap-3"
                        style={
                          isActive
                            ? {
                                opacity: 0,
                                animationName: "agensi-fade-in",
                                animationDuration: `${FADE_DURATION_MS}ms`,
                                animationTimingFunction: SLIDE_EASING,
                                animationFillMode: "forwards",
                                animationDelay: `${delayMs}ms`,
                              }
                            : { animation: "none" }
                        }
                      >
                        <img
                          src={item.logoPath}
                          alt={item.name}
                          className="h-16 w-auto max-w-[100px] object-contain sm:h-20 sm:max-w-[120px]"
                        />
                      </a>
                    )
                  })}
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
        )}
      </div>
    </section>
  )
}
