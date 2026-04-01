"use client"

import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  className?: string
}

const GRID_SPACING = 64
const GRID_LINE = 1
const GRID_OPACITY = 0.065

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-primary",
        "py-16 sm:py-20 lg:py-24",
        "min-h-[12rem] sm:min-h-[14rem] flex flex-col justify-center",
        className
      )}
      aria-label="Page header"
    >
      {/* Depth: very soft gradient only */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/[0.04]"
        aria-hidden
      />

      {/* Grid accent: top-right, gradient-masked so it fades into background */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[55%] w-[70%] min-w-[200px] max-w-[480px] animate-in fade-in-0 duration-700 ease-out sm:w-[55%] lg:h-[60%] lg:w-[45%]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,${GRID_OPACITY}) ${GRID_LINE}px, transparent ${GRID_LINE}px),
            linear-gradient(90deg, rgba(255,255,255,${GRID_OPACITY}) ${GRID_LINE}px, transparent ${GRID_LINE}px)
          `,
          backgroundSize: `${GRID_SPACING}px ${GRID_SPACING}px`,
          maskImage: `
            linear-gradient(to left, black 0%, black 25%, transparent 75%),
            linear-gradient(to bottom, black 0%, black 30%, transparent 85%)
          `,
          WebkitMaskImage: `
            linear-gradient(to left, black 0%, black 25%, transparent 75%),
            linear-gradient(to bottom, black 0%, black 30%, transparent 85%)
          `,
          maskSize: "100% 100%",
          maskPosition: "top right",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          WebkitMaskPosition: "top right",
          WebkitMaskRepeat: "no-repeat",
        }}
      />

      {/* Grid accent: bottom-left, gradient-masked so it fades into background */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[50%] w-[65%] min-w-[180px] max-w-[420px] animate-in fade-in-0 duration-700 ease-out sm:w-[50%] lg:h-[55%] lg:w-[40%]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,${GRID_OPACITY}) ${GRID_LINE}px, transparent ${GRID_LINE}px),
            linear-gradient(90deg, rgba(255,255,255,${GRID_OPACITY}) ${GRID_LINE}px, transparent ${GRID_LINE}px)
          `,
          backgroundSize: `${GRID_SPACING}px ${GRID_SPACING}px`,
          maskImage: `
            linear-gradient(to right, black 0%, black 25%, transparent 75%),
            linear-gradient(to top, black 0%, black 30%, transparent 85%)
          `,
          WebkitMaskImage: `
            linear-gradient(to right, black 0%, black 25%, transparent 75%),
            linear-gradient(to top, black 0%, black 30%, transparent 85%)
          `,
          maskSize: "100% 100%",
          maskPosition: "bottom left",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          WebkitMaskPosition: "bottom left",
          WebkitMaskRepeat: "no-repeat",
        }}
      />

      {/* Soft radial highlight behind title (keeps center clean) */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(16rem,50vw)] w-[min(32rem,85vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.03] blur-3xl"
        aria-hidden
      />

      {/* Content — strong hierarchy, AA contrast */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 text-center">
        <h1 className="mb-4 font-heading text-4xl font-bold tracking-tight text-primary-foreground drop-shadow-sm sm:text-5xl lg:text-5xl">
          {title}
        </h1>
        {subtitle != null && (
          <p className="mx-auto max-w-2xl text-base text-primary-foreground/90 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
