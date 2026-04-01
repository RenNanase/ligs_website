"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"

const FALLBACK_BANNER = {
  id: "fallback",
  image: "",
  title: "Empowering Smallholders Nationwide",
  titleMs: "Memperkasakan Pekebun Kecil Seluruh Negara",
  caption: "Supporting rubber industry growth through innovation and sustainable practices.",
  captionMs: "Menyokong pertumbuhan industri getah melalui inovasi dan amalan mampan.",
  ctaText: "Learn More",
  ctaTextMs: "Ketahui Lebih",
  ctaLink: "/about",
}

export function HeroSection() {
  const { language } = useLanguage()
  const { banners } = useDataStore()
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const slides = useMemo(
    () => (banners.length > 0 ? banners : [FALLBACK_BANNER]),
    [banners]
  )
  const total = slides.length

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

  // Generate gradient backgrounds for slides without images
  const gradients = [
    "from-primary via-primary/90 to-primary/80",
    "from-primary/90 via-primary to-primary/85",
    "from-primary/85 via-primary/95 to-primary",
  ]

  return (
    <section className="relative w-full overflow-hidden" aria-roledescription="carousel" aria-label="Banner carousel">
      {/* Aspect-ratio container: landscape on mobile, taller on desktop */}
      <div className="relative w-full aspect-[16/7] md:aspect-[16/6] lg:aspect-auto lg:h-[70vh] lg:min-h-[480px] lg:max-h-[720px]">
        {slides.map((banner, index) => {
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
                <img
                  key={`${banner.id}-${banner.image}`}
                  src={`${banner.image}${banner.image.includes("?") ? "&" : "?"}v=${banner.id}`}
                  alt=""
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]}`}>
                  <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/10" />
                  <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary-foreground/5" />
                  <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-accent/5" />
                </div>
              )}

              {/* Dark overlay for readability */}
              {banner.image && (
                <div className="absolute inset-0 bg-black/30" />
              )}

              {/* Content */}
              <div className="relative z-10 flex h-full items-center">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
                  <div className="max-w-2xl">
                    <h2 className="mb-2 font-heading text-lg font-bold leading-tight text-primary-foreground text-balance sm:text-2xl sm:mb-3 md:text-4xl md:mb-4 lg:text-5xl xl:text-6xl">
                      {slideTitle}
                    </h2>
                    <p className="mb-3 max-w-xl text-xs leading-relaxed text-primary-foreground/80 text-pretty sm:text-sm sm:mb-5 md:text-base md:mb-8 lg:text-lg line-clamp-2 sm:line-clamp-none">
                      {slideCaption}
                    </p>
                    {slideCta && banner.ctaLink && (
                      <Link href={banner.ctaLink}>
                        <Button
                          size="sm"
                          className="bg-accent text-accent-foreground hover:bg-accent/90 text-xs font-semibold px-4 sm:px-6 sm:text-sm md:px-8 md:text-base md:h-11"
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

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-primary-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-4 sm:h-11 sm:w-11"
              aria-label={language === "en" ? "Previous banner" : "Banner sebelumnya"}
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/35 text-primary-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4 sm:h-11 sm:w-11"
              aria-label={language === "en" ? "Next banner" : "Banner seterusnya"}
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden />
            </button>
          </>
        )}
      </div>

    </section>
  )
}
