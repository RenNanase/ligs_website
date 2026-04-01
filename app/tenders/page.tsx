"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { TendersSection } from "@/components/sections/tenders-section"

export default function TendersPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader title={t("tenders.title")}  />
      <TendersSection />
    </>
  )
}