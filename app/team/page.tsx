"use client"

import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { CtaSection } from "@/components/sections/cta-section"
import { User } from "lucide-react"

export default function TeamPage() {
  const { language, t } = useLanguage()
  const { team } = useDataStore()

  return (
    <>
      {/* Page Header */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 font-heading text-4xl font-bold text-primary-foreground md:text-5xl">
            {t("team.title")}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            {t("team.subtitle")}
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="bg-background py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
              >
                {/* Avatar */}
                <div className="flex aspect-square items-center justify-center bg-muted">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-1 font-heading text-lg font-semibold text-card-foreground">
                    {member.name}
                  </h3>
                  <p className="mb-3 text-sm font-medium text-accent">
                    {language === "en" ? member.role : member.roleMs}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {language === "en" ? member.bio : member.bioMs}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
