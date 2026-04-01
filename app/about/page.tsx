"use client"

import { useLanguage } from "@/lib/language-context"
import { CtaSection } from "@/components/sections/cta-section"
import { PageHeader } from "@/components/sections/page-header"
import { Target, Compass, Heart } from "lucide-react"

export default function AboutPage() {
  const { t } = useLanguage()

  const values = [
    {
      icon: Target,
      titleKey: "about.vision.title",
      descKey: "about.vision.desc",
    },
    {
      icon: Compass,
      titleKey: "about.mission.title",
      descKey: "about.mission.desc",
    },
    {
      icon: Heart,
      titleKey: "about.values.title",
      descKey: "about.values.desc",
    },
  ]

  return (
    <>
      <PageHeader title={t("about.title")} subtitle={t("about.subtitle")} />

      {/* About Content */}
      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Image placeholder */}
            <div className="overflow-hidden rounded-2xl bg-muted">
              <div className="flex aspect-[4/3] items-center justify-center bg-primary/5">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    <Compass className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("about.subtitle")}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-6 font-heading text-3xl font-bold text-foreground">
                {t("about.subtitle")}
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t("about.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision, Mission, Values */}
      <section className="bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {values.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.titleKey}
                  className="rounded-xl border border-border bg-card p-8"
                >
                  <div className="mb-6 inline-flex rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 font-heading text-xl font-semibold text-card-foreground">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(item.descKey)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 text-center md:grid-cols-4">
            {[
              { number: "15+", label: { en: "Years Experience", ms: "Tahun Pengalaman" } },
              { number: "200+", label: { en: "Projects Completed", ms: "Projek Selesai" } },
              { number: "50+", label: { en: "Team Members", ms: "Ahli Pasukan" } },
              { number: "98%", label: { en: "Client Satisfaction", ms: "Kepuasan Pelanggan" } },
            ].map((stat) => (
              <div key={stat.number}>
                <div className="mb-2 font-heading text-4xl font-bold text-primary">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                  {stat.label.en}
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
