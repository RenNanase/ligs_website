"use client"

import React from "react"

import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Users, Lightbulb, BarChart3 } from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  users: Users,
  lightbulb: Lightbulb,
  chart: BarChart3,
}

export function HighlightsSection() {
  const { language, t } = useLanguage()
  const { landing } = useDataStore()

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
            {t("highlights.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t("highlights.subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {landing.highlights.map((highlight) => {
            const Icon = iconMap[highlight.icon] || Users
            return (
              <div
                key={highlight.id}
                className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className="mb-6 inline-flex rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 font-heading text-xl font-semibold text-card-foreground">
                  {language === "en" ? highlight.title : highlight.titleMs}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {language === "en"
                    ? highlight.description
                    : highlight.descriptionMs}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
