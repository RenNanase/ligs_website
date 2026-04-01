"use client"

import React from "react"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { useEffect, useRef, useState } from "react"
import { User, Hexagon, UserCog } from "lucide-react"

const STAT_ICONS: Record<string, { Icon: React.ComponentType<{ className?: string; size?: number }>; iconClass: string }> = {
  "stats.pekebun": { Icon: User, iconClass: "text-blue-500" },
  "stats.keluasan": { Icon: Hexagon, iconClass: "text-green-700" },
  "stats.penoreh": { Icon: UserCog, iconClass: "text-amber-500" },
}

function AnimatedCounter({ target, suffix, isVisible }: { target: number; suffix: string; isVisible: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps
    const increment = target / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      if (currentStep >= steps) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(increment * currentStep))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [target, isVisible])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export function StatisticsSection() {
  const { t } = useLanguage()
  const { stats } = useDataStore()
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-primary py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12">
          {stats.map((stat, index) => {
            const config = STAT_ICONS[stat.labelKey] ?? { Icon: User, iconClass: "text-primary-foreground/80" }
            const { Icon, iconClass } = config
            return (
              <React.Fragment key={stat.id}>
                {index > 0 && (
                  <div className="hidden w-px self-stretch bg-primary-foreground/20 sm:block" aria-hidden />
                )}
                <div className="flex min-w-0 flex-1 basis-0 flex-col items-center text-center">
                  <div className={`mb-2 flex h-6 w-6 shrink-0 items-center justify-center ${iconClass}`} aria-hidden>
                    <Icon size={24} strokeWidth={stat.labelKey === "stats.keluasan" ? 1.5 : 2.5} />
                  </div>
                  <p className="font-heading text-xl font-bold text-primary-foreground sm:text-2xl md:text-3xl">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-primary-foreground/70 sm:text-xs">
                    {t(stat.labelKey)}
                  </p>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}
