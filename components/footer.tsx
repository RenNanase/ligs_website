"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Mail, Phone, MapPin, Youtube, Facebook } from "lucide-react"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ms } from "date-fns/locale"

/** Simple TikTok-style icon */
function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { id: "youtube", name: "YouTube", icon: Youtube, url: "https://www.youtube.com/@lembagaindustrigetahsabaho4672" },
  { id: "facebook", name: "Facebook", icon: Facebook, url: "https://www.facebook.com/61586889106536" },
  { id: "tiktok", name: "TikTok", icon: TiktokIcon, url: "https://www.tiktok.com/@kentalansikarapsabah" },
] as const

/** Section heading with clear separation from content below */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 sm:mb-4">
      <h4 className="text-sm font-bold uppercase tracking-wider text-primary-foreground">
        {children}
      </h4>
      <div className="mt-1.5 h-0.5 w-12 bg-accent" aria-hidden />
    </div>
  )
}

export function Footer() {
  const { t, language } = useLanguage()
  const pathname = usePathname()
  const [lastUpdated, setLastUpdated] = useState<{ iso: string; formatted: string } | null>(null)

  useEffect(() => {
    let mounted = true
    fetch("/api/last-updated")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        try {
          const date = data?.lastUpdated ? new Date(data.lastUpdated) : new Date()
          if (!isNaN(date.getTime())) {
            const locale = language === "ms" ? ms : undefined
            setLastUpdated({
              iso: date.toISOString(),
              formatted: format(date, "d MMMM yyyy", { locale }),
            })
          }
        } catch {
          const now = new Date()
          const locale = language === "ms" ? ms : undefined
          setLastUpdated({
            iso: now.toISOString(),
            formatted: format(now, "d MMMM yyyy", { locale }),
          })
        }
      })
      .catch(() => {
        if (mounted) {
          const now = new Date()
          const locale = language === "ms" ? ms : undefined
          setLastUpdated({
            iso: now.toISOString(),
            formatted: format(now, "d MMMM yyyy", { locale }),
          })
        }
      })
    return () => { mounted = false }
  }, [language])

  const isAdmin = pathname.startsWith("/admin")
  if (isAdmin) return null

  const tentangKamiLinks = [
    { href: "/info-korporat/tentang-kami", label: t("footer.aboutLIGS") },
    { href: "/info-korporat/visi-misi", label: t("footer.visionMission") },
    { href: "/info-korporat/carta-organisasi", label: t("footer.orgChart") },
    { href: "/direktori", label: t("nav.corpinfo.direktori") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/feedback", label: t("nav.feedback") },
    // { href: "/kepuasan-pelanggan", label: t("nav.kepuasanPelanggan") },
    // { href: "/kepuasan-staf", label: t("nav.kepuasanStaf") },
  ]

  const pautanPantasLinks: { href: string; label: string; external?: boolean }[] = [
    { href: "/tenders", label: t("footer.procurement") },
    { href: "/peta-laman", label: t("nav.sitemap") },
    { href: "/kalender", label: t("footer.activityCalendar") },
    // { href: "/soalan-lazim", label: t("nav.faq") },
    { href: "/pencapaian", label: t("nav.pencapaian") },
  ]

  const dasarLinks = [
    { href: "/privasi", label: t("footer.privasi") },
    { href: "/dasar-keselamatan", label: t("footer.dasarKeselamatan") },
    { href: "/penafian", label: t("footer.penafian") },
    { href: "/notis-hak-cipta", label: t("footer.notisHakCipta") },
  ]

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:py-16">
        {/* Mobile: stack vertically, gap-8 between sections. sm+: 2-col links. lg: 4-column grid */}
        <div className="grid grid-cols-1 gap-8 sm:gap-8 lg:grid-cols-12 lg:gap-x-8 xl:gap-x-10 lg:items-start">
          {/* Col 1: Logo + Mission */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="mb-3 sm:mb-4 inline-block focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary rounded-lg transition-opacity hover:opacity-90"
              aria-label="LIGS - Lembaga Industri Getah Sabah"
            >
              <span className="relative block h-24 w-[320px] md:h-32 md:w-[400px] shrink-0">
                <Image
                  src="/uploads/logo.png"
                  alt="LIGS - Lembaga Industri Getah Sabah"
                  fill
                  className="object-contain object-left"
                  sizes="(max-width: 768px) 320px, 400px"
                />
              </span>
            </Link>
            <p className="max-w-sm text-sm italic leading-relaxed text-primary-foreground/95">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Col 2: Contact - gap-3 between items for touch-friendly spacing */}
          <div className="lg:col-span-3">
            <SectionHeading>{t("footer.contact")}</SectionHeading>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
                <span className="text-sm leading-relaxed text-primary-foreground/95">
                  Aras 3, Wisma Pertanian Sabah, Jalan Tasik, Luyang, 88999 Kota Kinabalu, Sabah
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                <a
                  href="tel:088212311"
                  className="text-sm text-primary-foreground/95 transition-colors hover:text-accent"
                >
                  088-212311
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                <a
                  href="mailto:gm.getah@sabah.gov.my"
                  className="text-sm text-primary-foreground/95 transition-colors hover:text-accent"
                >
                  gm.getah@sabah.gov.my
                </a>
              </div>
            </div>
          </div>

          {/* Col 3 & 4: TENTANG KAMI | PAUTAN PANTAS | DASAR & NOTIS, then IKUTI KAMI */}
          <div className="flex flex-col gap-8 sm:gap-8 lg:col-span-5">
            {/* Mobile: 2 cols (Tentang Kami | Pautan Pantas), Dasar full width. sm+: 3 columns */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-6 lg:grid-cols-6 lg:gap-x-6">
              <div className="lg:col-span-2">
                <SectionHeading>{t("footer.aboutUs")}</SectionHeading>
                <nav className="flex flex-col gap-3 max-sm:gap-0 max-sm:[&>a]:leading-none [&>a]:block" aria-label={t("footer.aboutUs")}>
                  {tentangKamiLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-1.5 text-sm text-primary-foreground/95 transition-colors hover:text-accent max-sm:py-0 sm:py-0"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="lg:col-span-2">
                <SectionHeading>{t("footer.quicklinks")}</SectionHeading>
                <nav className="flex flex-col gap-3 max-sm:gap-0 max-sm:[&>a]:leading-none [&>a]:block" aria-label={t("footer.quicklinks")}>
                  {pautanPantasLinks.map((item) =>
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block py-1.5 text-sm text-primary-foreground/95 transition-colors hover:text-accent max-sm:py-0 sm:py-0"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-1.5 text-sm text-primary-foreground/95 transition-colors hover:text-accent max-sm:py-0 sm:py-0"
                      >
                        {item.label}
                      </Link>
                    )
                  )}
                </nav>
              </div>
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <SectionHeading>{t("footer.policies")}</SectionHeading>
                <nav className="flex flex-col gap-3 max-sm:gap-0 max-sm:[&>a]:leading-none [&>a]:block" aria-label={t("footer.policies")}>
                  {dasarLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-1.5 text-sm text-primary-foreground/95 transition-colors hover:text-accent max-sm:py-0 sm:py-0"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            {/* Ikuti Kami */}
            <div>
              <SectionHeading>{t("footer.followUs")}</SectionHeading>
              <span className="mb-3 block w-full text-sm leading-relaxed text-primary-foreground/95 sm:mb-4">
                {t("footer.followUsDesc")}
              </span>
              <div className="flex gap-4">
                {SOCIAL_LINKS.map((platform) => {
                  const Icon = platform.icon
                  return (
                    <a
                      key={platform.id}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
                      aria-label={`${t("footer.followUs")} on ${platform.name}`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Partner logos */}
            <div>
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative h-10 w-auto shrink-0 sm:h-12">
                  <Image
                    src="/uploads/logo_v50.png"
                    alt=""
                    width={80}
                    height={48}
                    className="h-10 w-auto object-contain sm:h-12"
                  />
                </div>
                <div className="relative h-10 w-auto shrink-0 sm:h-12">
                  <Image
                    src="/uploads/logo_iso.png"
                    alt=""
                    width={48}
                    height={48}
                    className="h-10 w-auto object-contain sm:h-12"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright & Last Updated */}
        <div className="mt-8 sm:mt-12 border-t border-primary-foreground/20 pt-6 sm:pt-8 text-center text-sm text-primary-foreground/70">
          <p>
            © {new Date().getFullYear()} Lembaga Industri Getah Sabah. {t("footer.rights")}
          </p>
          {lastUpdated && (
            <p className="mt-1.5 sm:mt-2">
              {t("footer.lastUpdated")}:{" "}
              <time dateTime={lastUpdated.iso} className="font-medium">
                {lastUpdated.formatted}
              </time>
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
