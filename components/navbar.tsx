"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Menu, X, ChevronDown } from "lucide-react"

function DropdownMenu({
  label,
  items,
  isActive,
}: {
  label: string
  items: { href: string; label: string }[]
  isActive: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-accent ${
          isActive ? "text-accent" : "text-primary-foreground/90"
        }`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-lg border border-border bg-card py-2 shadow-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-card-foreground transition-colors hover:bg-muted hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCorpOpen, setMobileCorpOpen] = useState(false)
  const [mobileArchiveOpen, setMobileArchiveOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const pathname = usePathname()

  const isAdmin = pathname.startsWith("/admin")
  if (isAdmin) return null

  const corpInfoItems = [
    { href: "/about", label: t("nav.corpinfo.about") },
    { href: "/about#vision", label: t("nav.corpinfo.vision") },
    { href: "/team", label: t("nav.corpinfo.team") },
    { href: "/services", label: t("nav.corpinfo.services") },
  ]

  const archiveItems = [
    { href: "/news", label: t("nav.archive.news") },
  ]

  const isCorpActive = ["/about", "/team", "/services"].includes(pathname)
  const isArchiveActive = ["/news"].includes(pathname)

  return (
    <header className="sticky top-0 z-50">
      {/* Tier 1: Utility Bar */}
      <div className="bg-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 text-xs font-semibold transition-colors ${
                language === "en"
                  ? "text-accent"
                  : "text-background/70 hover:text-background"
              }`}
            >
              EN
            </button>
            <span className="text-background/40 text-xs">|</span>
            <button
              type="button"
              onClick={() => setLanguage("ms")}
              className={`px-2 py-0.5 text-xs font-semibold transition-colors ${
                language === "ms"
                  ? "text-accent"
                  : "text-background/70 hover:text-background"
              }`}
            >
              BM
            </button>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <Link
              href="/about#faq"
              className="text-xs font-medium text-background/70 transition-colors hover:text-background"
            >
              {t("nav.faq")}
            </Link>
            <Link
              href="/contact"
              className="text-xs font-medium text-background/70 transition-colors hover:text-background"
            >
              {t("nav.contact")}
            </Link>
            <Link
              href="/about#sitemap"
              className="text-xs font-medium text-background/70 transition-colors hover:text-background"
            >
              {t("nav.sitemap")}
            </Link>
            <Link
              href="/admin"
              className="text-xs font-medium text-accent transition-colors hover:text-accent/80"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Navigation */}
      <nav className="border-b border-primary-foreground/10 bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-primary/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-bold tracking-tight text-primary-foreground"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground text-sm font-black">
              CS
            </div>
            <span className="font-heading hidden sm:inline">CorpSite</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-accent ${
                pathname === "/" ? "text-accent" : "text-primary-foreground/90"
              }`}
            >
              {t("nav.home")}
            </Link>
            <DropdownMenu
              label={t("nav.corpinfo")}
              items={corpInfoItems}
              isActive={isCorpActive}
            />
            <DropdownMenu
              label={t("nav.archive")}
              items={archiveItems}
              isActive={isArchiveActive}
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden text-primary-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-primary-foreground/10 bg-primary px-6 pb-6 pt-4 lg:hidden">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "bg-primary-foreground/10 text-accent"
                    : "text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                }`}
              >
                {t("nav.home")}
              </Link>

              {/* Corporate Info Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileCorpOpen(!mobileCorpOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isCorpActive
                      ? "bg-primary-foreground/10 text-accent"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground"
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
                        className="rounded-lg px-3 py-2 text-sm text-primary-foreground/70 transition-colors hover:bg-primary-foreground/5 hover:text-primary-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Archive Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileArchiveOpen(!mobileArchiveOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isArchiveActive
                      ? "bg-primary-foreground/10 text-accent"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                  }`}
                >
                  {t("nav.archive")}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${mobileArchiveOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileArchiveOpen && (
                  <div className="ml-4 flex flex-col gap-1 pt-1">
                    {archiveItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-2 text-sm text-primary-foreground/70 transition-colors hover:bg-primary-foreground/5 hover:text-primary-foreground"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile utility links */}
              <div className="mt-4 flex flex-col gap-1 border-t border-primary-foreground/10 pt-4">
                <Link
                  href="/about#faq"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                >
                  {t("nav.faq")}
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-primary-foreground/60 transition-colors hover:text-primary-foreground"
                >
                  {t("nav.contact")}
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-accent transition-colors hover:text-accent/80"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
