"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { Target, Compass, FileText } from "lucide-react"

export default function VisiMisiPage() {
  const { t } = useLanguage()

  const dasarItems = [
    "visiMisi.dasar1",
    "visiMisi.dasar2",
    "visiMisi.dasar3",
    "visiMisi.dasar4",
    "visiMisi.dasar5",
    "visiMisi.dasar6",
  ]

  return (
    <>
      <PageHeader
        title={t("visiMisi.title")}
        subtitle={t("visiMisi.subtitle")}
      />

      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-3xl px-6">
          {/* Visi */}
          <div
            id="vision"
            className="scroll-mt-24 rounded-2xl border border-border bg-card p-8 shadow-sm md:p-10"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                {t("visiMisi.visiHeading")}
              </h2>
            </div>
            <p className="text-justify text-base leading-relaxed text-foreground">
              {t("visiMisi.visiText")}
            </p>
          </div>

          {/* Misi */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-sm md:p-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Compass className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                {t("visiMisi.misiHeading")}
              </h2>
            </div>
            <p className="text-justify text-base leading-relaxed text-foreground">
              {t("visiMisi.misiText")}
            </p>
          </div>

          {/* Dasar */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-sm md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                {t("visiMisi.dasarHeading")}
              </h2>
            </div>
            <ol className="space-y-4">
              {dasarItems.map((key, index) => (
                <li key={key} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-justify text-base leading-relaxed text-foreground">
                    {t(key)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  )
}
