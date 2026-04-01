"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"

export default function PenafianPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader title={t("legal.penafian")} subtitle={t("legal.penafianSubtitle")} />
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-3xl px-6">
          <article className="prose prose-primary max-w-none">
            <div className="space-y-6 text-foreground">
              <p className="leading-relaxed">{t("legal.penafianContent1")}</p>
              <p className="leading-relaxed">{t("legal.penafianContent2")}</p>
              <p className="leading-relaxed">{t("legal.penafianContent3")}</p>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}
