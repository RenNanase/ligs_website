"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import Image from "next/image"

export default function TentangKamiPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader
        title={t("tentangKami.title")}
        subtitle={t("tentangKami.subtitle")}
      />

      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-3xl px-6">
          {/* Image at top center */}
          <div className="mb-10 flex flex-col items-center">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              <Image
                src="/uploads/ligs.png"
                alt={t("tentangKami.imageAlt")}
                width={400}
                height={300}
                className="h-auto w-full max-w-sm object-contain"
                priority
              />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {t("tentangKami.imageAlt")}
            </p>
          </div>

          {/* Content under image */}
          <div className="space-y-6">
            <p className="text-justify text-base leading-relaxed text-foreground">
              {t("tentangKami.para1")}
            </p>
            <p className="text-justify text-base leading-relaxed text-foreground">
              {t("tentangKami.para2")}
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
