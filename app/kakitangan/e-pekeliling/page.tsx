"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { EPekelilingSection } from "@/components/sections/e-pekeliling-section"

export default function EPekelilingPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader title={t("nav.kakitangan.ePekeliling")} />
      <EPekelilingSection />
    </>
  )
}

