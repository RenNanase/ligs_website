"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQ_ITEMS = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
] as const

export default function SoalanLazimPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader
        title={t("nav.faq")}
        subtitle={t("faq.subtitle")}
      />
      <section className="bg-primary-bg py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="overflow-hidden rounded-xl border border-border shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem
                  key={item.qKey}
                  value={`item-${index}`}
                  className="border-b border-border bg-white px-6 last:border-b-0"
                >
                <AccordionTrigger className="py-5 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <span className="pr-4 text-left font-semibold text-foreground">
                    {t(item.qKey)}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pt-0">
                  <p className="leading-relaxed text-muted-foreground">
                    {t(item.aKey)}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  )
}
