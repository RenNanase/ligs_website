"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import { Link2 } from "lucide-react"

export default function PautanKakitanganPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader title={t("nav.kakitangan.pautan")} />
      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Link2 className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">{t("common.comingSoon")}</p>
        </div>
      </section>
    </>
  )
}

