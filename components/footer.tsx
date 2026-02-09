"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const { t } = useLanguage()
  const pathname = usePathname()

  const isAdmin = pathname.startsWith("/admin")
  if (isAdmin) return null

  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="mb-4 text-lg font-bold">CorpSite</h3>
            <p className="text-sm leading-relaxed opacity-80">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-70">
              {t("footer.quicklinks")}
            </h4>
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-sm opacity-80 transition-opacity hover:opacity-100">
                {t("nav.home")}
              </Link>
              <Link href="/about" className="text-sm opacity-80 transition-opacity hover:opacity-100">
                {t("nav.corpinfo.about")}
              </Link>
              <Link href="/services" className="text-sm opacity-80 transition-opacity hover:opacity-100">
                {t("nav.corpinfo.services")}
              </Link>
              <Link href="/news" className="text-sm opacity-80 transition-opacity hover:opacity-100">
                {t("nav.archive.news")}
              </Link>
              <Link href="/team" className="text-sm opacity-80 transition-opacity hover:opacity-100">
                {t("nav.corpinfo.team")}
              </Link>
              <Link href="/contact" className="text-sm opacity-80 transition-opacity hover:opacity-100">
                {t("nav.contact")}
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-70">
              {t("footer.contact")}
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                <span className="text-sm opacity-80">
                  Level 12, Menara Corporate, Jalan Sultan Ismail, 50250 Kuala Lumpur, Malaysia
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 opacity-70" />
                <span className="text-sm opacity-80">+60 3-1234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 opacity-70" />
                <span className="text-sm opacity-80">info@corpsite.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-60">
          2026 CorpSite. {t("footer.rights")}
        </div>
      </div>
    </footer>
  )
}
