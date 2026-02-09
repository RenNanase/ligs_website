"use client"

import React from "react"

import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { useEffect, useRef, useState } from "react"
import { Users, Droplets, TreePine } from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  "stats.pekebun": Users,
  "stats.penoreh": Droplets,
  "stats.keluasan": TreePine,
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
    <section ref={sectionRef} className="bg-card py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="mb-3 font-heading text-3xl font-bold text-card-foreground md:text-4xl">
            {t("stats.title")}
          </h2>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground">
            {t("stats.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = iconMap[stat.labelKey] || Users
            return (
              <div
                key={stat.id}
                className="group flex flex-col items-center rounded-2xl border border-border bg-background p-10 text-center transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <p className="mb-2 font-heading text-4xl font-bold text-foreground md:text-5xl">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                </p>
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {t(stat.labelKey)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
