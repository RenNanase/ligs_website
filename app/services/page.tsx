"use client"

import { useLanguage } from "@/lib/language-context"
import { CtaSection } from "@/components/sections/cta-section"
import { PageHeader } from "@/components/sections/page-header"
import {
  Briefcase,
  Monitor,
  ClipboardList,
  GraduationCap,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: Briefcase,
    titleKey: "service.1.title",
    descKey: "service.1.desc",
  },
  {
    icon: Monitor,
    titleKey: "service.2.title",
    descKey: "service.2.desc",
  },
  {
    icon: ClipboardList,
    titleKey: "service.3.title",
    descKey: "service.3.desc",
  },
  {
    icon: GraduationCap,
    titleKey: "service.4.title",
    descKey: "service.4.desc",
  },
]

export default function ServicesPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader title={t("services.title")} subtitle={t("services.subtitle")} />

      {/* Services Grid */}
      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.titleKey}
                  className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-accent/50 hover:shadow-lg"
                >
                  <div className="mb-6 inline-flex rounded-lg bg-primary/10 p-4">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-4 font-heading text-2xl font-semibold text-card-foreground">
                    {t(service.titleKey)}
                  </h3>
                  <p className="mb-6 leading-relaxed text-muted-foreground">
                    {t(service.descKey)}
                  </p>
                  <Link href="/contact">
                    <Button
                      variant="ghost"
                      className="gap-2 px-0 text-accent hover:text-accent/80 hover:bg-transparent"
                    >
                      {t("hero.learn")}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-secondary py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-16 text-center font-heading text-3xl font-bold text-foreground md:text-4xl">
            {t("highlights.subtitle")}
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: { en: "Discovery", ms: "Penemuan" }, desc: { en: "We listen and understand your unique challenges and goals.", ms: "Kami mendengar dan memahami cabaran dan matlamat unik anda." } },
              { step: "02", title: { en: "Strategy", ms: "Strategi" }, desc: { en: "We develop a tailored plan to address your specific needs.", ms: "Kami membangunkan pelan khusus untuk menangani keperluan anda." } },
              { step: "03", title: { en: "Execution", ms: "Pelaksanaan" }, desc: { en: "Our team implements the plan with precision and expertise.", ms: "Pasukan kami melaksanakan pelan dengan ketepatan dan kepakaran." } },
              { step: "04", title: { en: "Results", ms: "Hasil" }, desc: { en: "We measure outcomes and continuously optimize for success.", ms: "Kami mengukur hasil dan mengoptimumkan secara berterusan." } },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">
                  {item.title.en}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.desc.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
