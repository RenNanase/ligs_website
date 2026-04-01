"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { AkalForm } from "@/components/akal-form"

export default function AkalPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader
        title={t("akal.title")}
        subtitle={t("akal.subtitle")}
      />
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <AkalForm />
          </div>
        </div>
      </section>
    </>
  )
}
