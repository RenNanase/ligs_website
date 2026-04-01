"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { FeedbackForm } from "@/components/feedback-form"

export default function FeedbackPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader
        title={t("feedback.title")}
        subtitle={t("feedback.subtitle")}
      />
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <FeedbackForm />
          </div>
        </div>
      </section>
    </>
  )
}
