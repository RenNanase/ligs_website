"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { KepuasanStafForm } from "@/components/kepuasan-staf-form"
import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"

export default function KepuasanStafPage() {
  const { t } = useLanguage()
  const [formOpen, setFormOpen] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/survey-settings")
      .then((res) => res.json())
      .then((data) => setFormOpen(data.stafOpen ?? true))
      .catch(() => setFormOpen(true))
  }, [])

  return (
    <>
      <PageHeader
        title={t("kepuasanStaf.title")}
        subtitle={t("kepuasanStaf.subtitle")}
      />
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-6 space-y-2 text-sm text-muted-foreground">
            <p>{t("kepuasanStaf.intro1")}</p>
            <p>{t("kepuasanStaf.intro2")}</p>
            <p>{t("kepuasan.intro3")}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {formOpen === null ? (
              <div className="flex justify-center py-8">
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : !formOpen ? (
              <div
                className="flex flex-col items-center gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-6 text-center"
                role="alert"
              >
                <AlertCircle className="h-12 w-12 text-amber-600 dark:text-amber-400" aria-hidden />
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  {t("kepuasan.formClosedTitle")}
                </h3>
                <p className="text-amber-700 dark:text-amber-400">
                  {t("kepuasan.formClosedMessage")}
                </p>
              </div>
            ) : (
              <KepuasanStafForm />
            )}
          </div>
        </div>
      </section>
    </>
  )
}
