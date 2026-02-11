"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useLanguage } from "@/lib/language-context"
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Home,
  Palette,
  LogOut,
  Globe,
  ArrowLeft,
  Menu,
  X,
  Megaphone,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navItems = [
  {
    href: "/admin/dashboard",
    labelKey: "admin.dashboard",
    icon: LayoutDashboard,
  },
  { href: "/admin/banners", labelKey: "admin.manage.banners", icon: Home },
  { href: "/admin/news", labelKey: "admin.manage.news", icon: Newspaper },
  { href: "/admin/announcements", labelKey: "admin.manage.announcements", icon: Megaphone },
  { href: "/admin/tenders", labelKey: "admin.manage.tenders", icon: FileText },
  { href: "/admin/team", labelKey: "admin.manage.team", icon: Users },
  { href: "/admin/landing", labelKey: "admin.manage.landing", icon: Palette },
  { href: "/admin/theme", labelKey: "admin.manage.theme", icon: Palette },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    signOut({ callbackUrl: "/admin" })
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="text-lg font-bold text-sidebar-foreground"
        >
          LIGS Admin
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-2 border-t border-sidebar-border pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "ms" : "en")}
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <Globe className="h-4 w-4" />
          {language === "en" ? "Bahasa Malaysia" : "English"}
        </Button>
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === "en" ? "Back to Site" : "Kembali ke Laman"}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-4 w-4" />
          {t("admin.logout")}
        </Button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="bg-card"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-sidebar p-6 transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
