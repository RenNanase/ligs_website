"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

export function HeroSection() {
  const { language } = useLanguage()
  const { banners } = useDataStore()
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const total = banners.length

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 600)
    },
    [isTransitioning]
  )

  const goNext = useCallback(() => {
    goTo((current + 1) % total)
  }, [current, total, goTo])

  const goPrev = useCallback(() => {
    goTo((current - 1 + total) % total)
  }, [current, total, goTo])

  // Auto-slide every 10 seconds
  useEffect(() => {
    const interval = setInterval(goNext, 10000)
    return () => clearInterval(interval)
  }, [goNext])

  if (total === 0) return null

  const slide = banners[current]
  const title = language === "en" ? slide.title : slide.titleMs
  const caption = language === "en" ? slide.caption : slide.captionMs
  const ctaText = language === "en" ? slide.ctaText : slide.ctaTextMs

  // Generate gradient backgrounds for slides without images
  const gradients = [
    "from-primary via-primary/90 to-primary/80",
    "from-primary/90 via-primary to-primary/85",
    "from-primary/85 via-primary/95 to-primary",
  ]

  return (
    <section className="relative w-full overflow-hidden" aria-roledescription="carousel" aria-label="Banner carousel">
      {/* Slides */}
      <div className="relative h-[70vh] min-h-[480px] max-h-[720px] w-full">
        {banners.map((banner, index) => {
          const slideTitle = language === "en" ? banner.title : banner.titleMs
          const slideCaption = language === "en" ? banner.caption : banner.captionMs
          const slideCta = language === "en" ? banner.ctaText : banner.ctaTextMs
          const isActive = index === current

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${total}`}
              aria-hidden={!isActive}
            >
              {/* Background */}
              {banner.image ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.image})` }}
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
                  {/* Decorative elements */}
                  <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/10" />
                  <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary-foreground/5" />
                  <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-accent/5" />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 flex h-full items-center">
                <div className="mx-auto w-full max-w-7xl px-6">
                  <div className="max-w-2xl">
                    <h2 className="mb-4 font-heading text-3xl font-bold leading-tight text-primary-foreground text-balance sm:text-4xl md:text-5xl lg:text-6xl">
                      {slideTitle}
                    </h2>
                    <p className="mb-8 max-w-xl text-base leading-relaxed text-primary-foreground/80 text-pretty sm:text-lg">
                      {slideCaption}
                    </p>
                    {slideCta && banner.ctaLink && (
                      <Link href={banner.ctaLink}>
                        <Button
                          size="lg"
                          className="bg-accent text-accent-foreground hover:bg-accent/90 px-8 text-base font-semibold"
                        >
                          {slideCta}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={goPrev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground backdrop-blur-sm transition-all hover:bg-primary-foreground/25"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={goNext}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground backdrop-blur-sm transition-all hover:bg-primary-foreground/25"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => goTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === current
                ? "w-8 bg-accent"
                : "w-2.5 bg-primary-foreground/40 hover:bg-primary-foreground/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === current ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  )
}
