"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

const IMAGES_PER_VIEW = 8

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (!trimmed) return null
  let videoId: string | null = null
  const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) videoId = ytMatch[1]
  if (!videoId) return null
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`
}

interface IntegritiImage {
  id: string
  url: string
  sortOrder: number
}

export default function IntegritiPage() {
  const { t } = useLanguage()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [images, setImages] = useState<IntegritiImage[]>([])
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/integriti")
      .then((res) => res.json())
      .then((data) => {
        setVideoUrl(data.videoUrl || null)
        setImages(data.images || [])
      })
      .catch(() => {
        setVideoUrl(null)
        setImages([])
      })
  }, [])

  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null

  // Chunk images into groups of 8 for carousel slides
  const chunks: IntegritiImage[][] = []
  for (let i = 0; i < images.length; i += IMAGES_PER_VIEW) {
    chunks.push(images.slice(i, i + IMAGES_PER_VIEW))
  }

  const hasCarousel = images.length > IMAGES_PER_VIEW

  const ImageThumb = ({ img }: { img: IntegritiImage }) => (
    <button
      type="button"
      onClick={() => setLightboxImage(img.url)}
      className="group relative flex aspect-square w-full min-w-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted transition-all hover:border-accent/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <img
        src={img.url}
        alt=""
        width={512}
        height={512}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/10 group-hover:opacity-100" />
    </button>
  )

  return (
    <>
      {/* Image lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={(open) => !open && setLightboxImage(null)}>
        <DialogContent
          className="max-h-[95vh] w-[95vw] sm:w-fit border-0 bg-transparent p-0 shadow-none focus:ring-0 [&>button:last-of-type]:sr-only"
          onPointerDownOutside={() => setLightboxImage(null)}
        >
          <DialogTitle className="sr-only">
            {t("integriti.hebahan")} - {t("common.viewImage")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Full-size image view. Click outside or press Escape to close.
          </DialogDescription>
          <div
            className="relative flex min-h-[75vh] items-center justify-center p-2 sm:min-h-0 sm:p-4"
            onClick={() => setLightboxImage(null)}
          >
            {lightboxImage && (
              <img
                src={lightboxImage}
                alt=""
                className="h-[85vh] max-h-[85vh] w-full max-w-full rounded-xl object-contain shadow-2xl ring-1 ring-white/10 sm:h-auto sm:w-auto"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxImage(null)
              }}
              className="absolute right-2 top-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/95 text-foreground shadow-xl backdrop-blur-sm transition hover:scale-105 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary sm:right-6 sm:top-6 sm:h-11 sm:w-11"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <PageHeader
        title={t("nav.integriti")}
        subtitle={t("integriti.subtitle")}
      />
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-5xl px-6">
          {/* Intro */}
          <p className="mb-12 text-center text-lg leading-relaxed text-muted-foreground">
            {t("integriti.intro")}
          </p>

          {/* Video - Center */}
          {embedUrl && (
            <div className="mx-auto mb-12 max-w-3xl">
              <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted shadow-lg">
                <iframe
                  src={embedUrl}
                  title="Integriti Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            </div>
          )}

          {/* Partition line */}
          <div className="mx-auto mb-12 max-w-3xl border-t-2 border-border" />

          {/* Hebahan Integriti */}
          <h2 className="mb-8 text-center font-heading text-2xl font-bold text-foreground">
            {t("integriti.hebahan")}
          </h2>

          {images.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
              {t("common.comingSoon")}
            </p>
          ) : hasCarousel ? (
            <div className="relative px-12">
              <Carousel
                opts={{ align: "start", loop: true }}
                className="w-full"
              >
                <CarouselContent>
                  {chunks.map((chunk, idx) => (
                    <CarouselItem key={idx} className="pl-4">
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {chunk.map((img) => (
                          <ImageThumb key={img.id} img={img} />
                        ))}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-8" />
                <CarouselNext className="-right-8" />
              </Carousel>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => (
                <ImageThumb key={img.id} img={img} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
