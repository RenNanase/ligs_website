"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-primary py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="mb-4 font-heading text-3xl font-bold text-primary-foreground text-balance md:text-4xl">
          {t("cta.title")}
        </h2>
        <p className="mb-10 text-lg leading-relaxed text-primary-foreground/80 text-pretty">
          {t("cta.subtitle")}
        </p>
        <Link href="/contact">
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-8 text-base font-semibold"
          >
            {t("cta.button")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
