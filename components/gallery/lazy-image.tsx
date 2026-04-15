"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type LazyImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string
  /** Pixels to start loading before the image enters the viewport */
  rootMargin?: string
}

/**
 * Loads the image URL only when the element is near the viewport (IntersectionObserver).
 * Use for large grids so thousands of nodes do not fetch at once.
 */
export function LazyImage({
  src,
  alt = "",
  className,
  rootMargin = "280px",
  decoding = "async",
  ...rest
}: LazyImageProps) {
  const ref = React.useRef<HTMLImageElement>(null)
  const [active, setActive] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el || !src) return

    if (typeof IntersectionObserver === "undefined") {
      setActive(true)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setActive(true)
          obs.disconnect()
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [src, rootMargin])

  return (
    <img
      ref={ref}
      src={active ? src : undefined}
      data-src={src}
      alt={alt}
      decoding={decoding}
      loading={active ? "lazy" : undefined}
      className={cn(
        "bg-muted transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0",
        className
      )}
      {...rest}
    />
  )
}
