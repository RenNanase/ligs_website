"use client"

import React from "react"
import dynamic from "next/dynamic"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"

const ContactMap = dynamic(() => import("@/components/contact-map").then((m) => m.ContactMap), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="flex h-[300px] w-full items-center justify-center rounded-xl border border-border bg-muted/30 sm:h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    </div>
  ),
})

export default function ContactPage() {
  const { t } = useLanguage()

  return (
    <>
      <PageHeader title={t("contact.title")} />

      <section className="bg-primary-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          {/* Map and LIGS address side by side */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 lg:items-center">
            <p className="sr-only" id="contact-map-alt">
              {t("contact.addressText")}
            </p>
            <ContactMap />

            <div className="flex flex-col items-center justify-center text-center">
              <address className="not-italic text-base leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground">LEMBAGA INDUSTRI GETAH SABAH</p>
                <p className="mt-4">Aras 3, Wisma Pertanian Sabah</p>
                <p>Jalan Tasik, Luyang (Off Jalan Maktab Gaya)</p>
                <p>Beg Berkunci 2016</p>
                <p>88999 Kota Kinabalu, Sabah</p>
                <div className="mt-6 space-y-2">
                  <p>Tel: 088-212311, 210531, 210472</p>
                  <p>Faks: 088-234940, 268586</p>
                  <p>
                    Emel:{" "}
                    <a
                      href="mailto:gm.getah@sabah.gov.my"
                      className="text-primary transition-colors hover:text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                    >
                      gm.getah@sabah.gov.my
                    </a>
                  </p>
                </div>
              </address>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-16 border-t border-border" />

          {/* Anak Syarikat LIGS — subsidiary addresses */}
          <div className="mt-20">
            <h2 className="mb-10 text-center font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              {t("contact.anakSyarikat")}
            </h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <address className="not-italic text-sm leading-relaxed text-muted-foreground rounded-lg border border-border/50 bg-muted/20 p-6 transition-colors hover:bg-accent/20">
                <p className="font-semibold text-foreground">KILANG GETAH SMR TUARAN</p>
                <p className="mt-2">Peti Surat 33,</p>
                <p>89207 Tuaran, Sabah</p>
                <div className="mt-3 space-y-1">
                  <p>Tel: 088-788766 / 788767</p>
                  <p>Faks: 087-788729</p>
                </div>
              </address>
              <address className="not-italic text-sm leading-relaxed text-muted-foreground rounded-lg border border-border/50 bg-muted/20 p-6 transition-colors hover:bg-accent/20">
                <p className="font-semibold text-foreground">KILANG GETAH SMR TENOM</p>
                <p className="mt-2">Peti Surat 13,</p>
                <p>89907 Tenom, Sabah</p>
                <div className="mt-3 space-y-1">
                  <p>Tel: 087-735542</p>
                  <p>Faks: 087-736057</p>
                </div>
              </address>
              <address className="not-italic text-sm leading-relaxed text-muted-foreground sm:col-span-2 lg:col-span-1 rounded-lg border border-border/50 bg-muted/20 p-6 transition-colors hover:bg-accent/20">
                <p className="font-semibold text-foreground">BEAUFORT LATEX SDN. BHD.</p>
                <p className="mt-2">KM6, Jln Gadong, Kg. Kelabu,</p>
                <p>Peti Surat 718,</p>
                <p>89808 Beaufort, Sabah</p>
                <div className="mt-3 space-y-1">
                  <p>Tel: 087-735542</p>
                  <p>Faks: 087-7366057</p>
                </div>
              </address>
              <address className="not-italic text-sm leading-relaxed text-muted-foreground rounded-lg border border-border/50 bg-muted/20 p-6 transition-colors hover:bg-accent/20">
                <p className="font-semibold text-foreground">LIGS SOLUTION SDN BHD</p>
                <p className="mt-2">G25, Jln Tun Razak,</p>
                <p>88000 Kota Kinabalu, Sabah</p>
                <div className="mt-3 space-y-1">
                  <p>Tel: TBA</p>
                  <p>Faks: TBA</p>
                </div>
              </address>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
