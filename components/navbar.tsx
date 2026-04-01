"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { useScrollLock } from "@/hooks/use-scroll-lock"
import { Menu, X, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface BahagianNav {
  id: string
  name: string
  slug: string
  orderIndex: number
}

const LIGS_APPS_PK_SALES = "http://apps.ligs.gov.my/pk_sales"
const LIGS_BMT = "https://bmt.ligs.gov.my"
const SHOW_FAQ_MENU = false // Set to true to show Soalan Lazim in utility nav

function NavDropdownMenu({
  label,
  items,
  isActive,
}: {
  label: string
  items: { href: string; label: string; external?: boolean }[]
  isActive: boolean
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group flex items-center gap-1 text-sm font-medium outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive ? "text-primary" : "text-foreground"
        )}
        aria-haspopup="menu"
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        collisionPadding={16}
        className="min-w-[200px] rounded-lg border border-border bg-card py-2 shadow-xl"
      >
        {items.map((item) =>
          item.external ? (
            <DropdownMenuItem asChild key={item.href + item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer px-4 py-2.5 text-sm font-medium text-foreground transition-colors focus:outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none"
              >
                {item.label}
              </a>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2.5 text-sm font-medium text-foreground transition-colors focus:outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[highlighted]:outline-none"
              >
                {item.label}
              </Link>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCorpOpen, setMobileCorpOpen] = useState(false)
  const [mobilePekebunOpen, setMobilePekebunOpen] = useState(false)
  const [mobileKakitanganOpen, setMobileKakitanganOpen] = useState(false)
  const [mobileOrangAwamOpen, setMobileOrangAwamOpen] = useState(false)
  const [mobileMediaOpen, setMobileMediaOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()

  // Lock body scroll when mobile menu is open
  useScrollLock({ lock: mobileOpen })

  const [bahagianList, setBahagianList] = useState<BahagianNav[]>([])
  useEffect(() => {
    fetch("/api/bahagian/public")
      .then((res) => res.json())
      .then((data) => setBahagianList(Array.isArray(data) ? data : []))
      .catch(() => setBahagianList([]))
  }, [])

  const isAdmin = pathname.startsWith("/admin")
  if (isAdmin) return null

  const corpInfoItems = [
    { href: "/info-korporat/tentang-kami", label: t("nav.corpinfo.about") },
    { href: "/info-korporat/visi-misi", label: t("nav.corpinfo.vision") },
    { href: "/info-korporat/carta-organisasi", label: t("nav.corpinfo.cartaOrganisasi") },
    ...bahagianList
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((b) => ({ href: `/bahagian/${b.slug}`, label: b.name })),
    { href: "/info-korporat/direktori", label: t("nav.corpinfo.direktori") },
    { href: "/info-korporat/lagu-ligs", label: t("nav.corpinfo.laguLigs") },
  ]

  const mediaItems = [
    { href: "/news", label: t("nav.media.news") },
    { href: "/announcements", label: t("nav.media.announcements") },
    { href: "/gallery", label: t("nav.media.gallery") },
    { href: "/penerbitan", label: t("nav.media.penerbitan") },
    { href: "/arkib", label: t("nav.media.arkib") },
  ]

  const pekebunItems = [
    { href: LIGS_BMT, label: t("nav.pekebun.semakanBantuan"), external: true },
    { href: LIGS_APPS_PK_SALES, label: t("nav.pekebun.penyataPenjualan"), external: true },
  ]

  const kakitanganItems = [
    { href: "/kakitangan/e-pekeliling", label: t("nav.kakitangan.ePekeliling") },
  ]

  const orangAwamItems = [
    { href: "/tenders", label: t("nav.orangAwam.tender") },
    { href: "/jawatan-kosong", label: t("nav.orangAwam.jawatanKosong") },
    { href: "/akal", label: t("nav.akal.form") },
    { href: "/kalender", label: t("nav.orangAwam.kalender") },
  ]

  const isCorpActive =
    ["/about", "/services"].includes(pathname) ||
    pathname.startsWith("/info-korporat") ||
    pathname.startsWith("/bahagian")
  const isMediaActive = ["/news", "/announcements", "/gallery", "/penerbitan", "/arkib"].includes(pathname)
  const isPekebunActive = false
  const isKakitanganActive = pathname === "/kakitangan" || pathname.startsWith("/kakitangan/")
  const isKelabSukanActive = pathname === "/kelab-sukan"
  const isOrangAwamActive =
    pathname === "/orang-awam" ||
    pathname === "/tenders" ||
    pathname === "/jawatan-kosong" ||
    pathname === "/akal" ||
    pathname === "/kalender"

  return (
    <header className="sticky top-0 z-50 overflow-visible">
      {/* Tier 1: Utility Bar */}
      <div className="border-b border-primary-foreground/10 bg-foreground">
        <div className="flex w-full items-center justify-between px-6 py-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 text-sm font-semibold transition-colors ${
                language === "en"
                  ? "text-accent"
                  : "text-primary-foreground/70 hover:text-accent"
              }`}
            >
              EN
            </button>
            <span className="text-primary-foreground/40 text-sm">|</span>
            <button
              type="button"
              onClick={() => setLanguage("ms")}
              className={`px-2.5 py-1 text-sm font-semibold transition-colors ${
                language === "ms"
                  ? "text-accent"
                  : "text-primary-foreground/70 hover:text-accent"
              }`}
            >
              BM
            </button>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            {SHOW_FAQ_MENU && (
              <Link
                href="/soalan-lazim"
                className="text-sm font-medium text-primary-foreground/70 transition-colors hover:text-accent"
              >
                {t("nav.faq")}
              </Link>
            )}
            <Link
              href="/contact"
              className="text-sm font-medium text-primary-foreground/70 transition-colors hover:text-accent"
            >
              {t("nav.contact")}
            </Link>
            <Link
              href="/feedback"
              className="text-sm font-medium text-primary-foreground/70 transition-colors hover:text-accent"
            >
              {t("nav.feedback")}
            </Link>
            <Link
              href="/peta-laman"
              className="text-sm font-medium text-primary-foreground/70 transition-colors hover:text-accent"
            >
              {t("nav.sitemap")}
            </Link>
            <Link
              href="/admin"
              className="text-sm font-medium text-accent transition-colors hover:text-accent/90"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Navigation */}
      <nav className="h-fit overflow-visible border-b border-border bg-white shadow-sm">
        <div className="flex min-w-0 w-full items-center justify-between gap-4 pl-4 pr-4 py-0.5 sm:gap-6 sm:pl-4 sm:pr-8 md:gap-8">
          {/* Logo - min-w-0 + shrink-0 allows flex to work; min-w ensures visibility on mobile */}
          <Link
            href="/"
            className="flex min-w-[280px] shrink-0 items-center rounded-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-0 sm:min-w-[180px] md:min-w-[200px]"
            aria-label="LIGS - Lembaga Industri Getah Sabah"
          >
<<<<<<< HEAD
            <span className="relative block h-16 w-[280px] shrink-0 max-sm:h-16 max-sm:w-[280px] sm:h-11 sm:w-[200px] md:h-12 md:w-[280px]">
              <Image
                src="/uploads/logo_menu.png"
                alt="LIGS - Lembaga Industri Getah Sabah"
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 280px, (max-width: 768px) 200px, 280px"
                priority
                onError={(e) => {
                  const target = e.currentTarget
                  if (target.src.endsWith("logo_menu.png")) {
                    target.src = "/uploads/logo.png"
                  }
                }}
              />
            </span>
=======
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground text-sm font-black">
              LIGS
            </div>
            <span className="font-heading hidden sm:inline">LIGS</span>
>>>>>>> 91866b5ba89e98143037e30abed31cce5d1e3e33
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 overflow-visible lg:flex">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary" : "text-foreground"
              }`}
            >
              {t("nav.home")}
            </Link>
            <NavDropdownMenu
              label={t("nav.corpinfo")}
              items={corpInfoItems}
              isActive={isCorpActive}
            />
            <Link
              href="/perkhidmatan"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/perkhidmatan" ? "text-primary" : "text-foreground"
              }`}
            >
              {t("nav.perkhidmatan")}
            </Link>
            <NavDropdownMenu
              label={t("nav.pekebun")}
              items={pekebunItems}
              isActive={isPekebunActive}
            />
            <Link
              href="/pencapaian"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/pencapaian" ? "text-primary" : "text-foreground"
              }`}
            >
              {t("nav.pencapaian")}
            </Link>
            <Link
              href="/integriti"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/integriti" ? "text-primary" : "text-foreground"
              }`}
            >
              {t("nav.integriti")}
            </Link>
            <NavDropdownMenu
              label={t("nav.kakitangan")}
              items={kakitanganItems}
              isActive={isKakitanganActive}
            />
            <Link
              href="/kelab-sukan"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isKelabSukanActive ? "text-primary" : "text-foreground"
              }`}
            >
              {t("nav.kelabSukan")}
            </Link>
            <NavDropdownMenu
              label={t("nav.orangAwam")}
              items={orangAwamItems}
              isActive={isOrangAwamActive}
            />
            <NavDropdownMenu
              label={t("nav.media")}
              items={mediaItems}
              isActive={isMediaActive}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            
            {/* Menu Container */}
            <div className="relative h-full overflow-y-auto">
              <div className="absolute left-0 top-0 w-full bg-white shadow-xl border-t border-border">
                <div className="px-8 pb-8 pt-5 max-h-[calc(100vh-80px)] overflow-y-auto">
                  <div className="flex flex-col gap-1">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${
                      pathname === "/"
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                    }`}
                  >
                    {t("nav.home")}
                  </Link>

              {/* Corporate Info Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileCorpOpen(!mobileCorpOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${
                    isCorpActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                  }`}
                >
                  {t("nav.corpinfo")}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileCorpOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileCorpOpen && (
                  <div className="ml-4 flex flex-col gap-1 pt-1">
                    {corpInfoItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/perkhidmatan"
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === "/perkhidmatan"
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {t("nav.perkhidmatan")}
              </Link>
              {/* Pekebun Kecil Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobilePekebunOpen(!mobilePekebunOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isPekebunActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {t("nav.pekebun")}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobilePekebunOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobilePekebunOpen && (
                  <div className="ml-4 flex flex-col gap-1 pt-1">
                    {pekebunItems.map((item) =>
                      item.external ? (
                        <a
                          key={item.href + item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
              <Link
                href="/pencapaian"
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === "/pencapaian"
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {t("nav.pencapaian")}
              </Link>
              <Link
                href="/integriti"
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === "/integriti"
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {t("nav.integriti")}
              </Link>
              {/* Kakitangan Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileKakitanganOpen(!mobileKakitanganOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isKakitanganActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {t("nav.kakitangan")}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileKakitanganOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileKakitanganOpen && (
                  <div className="ml-4 flex flex-col gap-1 pt-1">
                    {kakitanganItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href="/kelab-sukan"
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isKelabSukanActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {t("nav.kelabSukan")}
              </Link>
              {/* Orang Awam Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileOrangAwamOpen(!mobileOrangAwamOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isOrangAwamActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {t("nav.orangAwam")}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileOrangAwamOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileOrangAwamOpen && (
                  <div className="ml-4 flex flex-col gap-1 pt-1">
                    {orangAwamItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Media Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileMediaOpen(!mobileMediaOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isMediaActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {t("nav.media")}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileMediaOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileMediaOpen && (
                  <div className="ml-4 flex flex-col gap-1 pt-1">
                    {mediaItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile utility links */}
              <div className="mt-4 flex flex-col gap-1 border-t border-border pt-4">
                {SHOW_FAQ_MENU && (
                  <Link
                    href="/soalan-lazim"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                  >
                    {t("nav.faq")}
                  </Link>
                )}
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                >
                  {t("nav.contact")}
                </Link>
                <Link
                  href="/feedback"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                >
                  {t("nav.feedback")}
                </Link>
                <Link
                  href="/peta-laman"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                >
                  {t("nav.sitemap")}
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-primary transition-all duration-200 ease-in-out transform hover:scale-[1.02] hover:bg-primary/10 hover:text-accent hover:shadow-sm"
                >
                  Admin
                </Link>
              </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
