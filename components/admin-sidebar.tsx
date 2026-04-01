"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useLanguage } from "@/lib/language-context"
import { canAccessModule } from "@/lib/permissions"
import {
  LayoutDashboard,
  Newspaper,
  Home,
  Palette,
  LogOut,
  Globe,
  ArrowLeft,
  Menu,
  X,
  Megaphone,
  FileText,
  Trophy,
  Activity,
  Wrench,
  Building2,
  Layers,
  Shield,
  ImageIcon,
  Archive,
  Music2,
  Youtube,
  Briefcase,
  Calendar,
  Users,
  BarChart3,
  MessageSquare,
  UserCog,
  History,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navItems: { href: string; labelKey: string; icon: typeof LayoutDashboard; module: string }[] = [
  { href: "/admin/dashboard", labelKey: "admin.dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/admin/banners", labelKey: "admin.manage.banners", icon: Home, module: "banners" },
  { href: "/admin/stats", labelKey: "admin.manage.stats", icon: BarChart3, module: "stats" },
  { href: "/admin/news", labelKey: "admin.manage.news", icon: Newspaper, module: "news" },
  { href: "/admin/announcements", labelKey: "admin.manage.announcements", icon: Megaphone, module: "announcements" },
  { href: "/admin/tenders", labelKey: "admin.manage.tenders", icon: FileText, module: "tenders" },
  { href: "/admin/feedback", labelKey: "admin.manage.feedback", icon: MessageSquare, module: "feedback" },
  { href: "/admin/kepuasan-pelanggan", labelKey: "admin.manage.kepuasanPelanggan", icon: MessageSquare, module: "kepuasan-pelanggan" },
  { href: "/admin/jawatan-kosong", labelKey: "admin.manage.jawatanKosong", icon: Briefcase, module: "jawatan-kosong" },
  { href: "/admin/akal", labelKey: "admin.manage.akal", icon: Trophy, module: "akal" },
  { href: "/admin/e-pekeliling", labelKey: "admin.manage.ePekeliling", icon: FileText, module: "e-pekeliling" },
  { href: "/admin/calendar", labelKey: "admin.manage.calendar", icon: Calendar, module: "calendar" },
  { href: "/admin/achievements", labelKey: "admin.manage.achievements", icon: Trophy, module: "achievements" },
  { href: "/admin/kelab-sukan", labelKey: "admin.manage.kelabSukan", icon: Activity, module: "kelab-sukan" },
  { href: "/admin/gallery", labelKey: "admin.manage.gallery", icon: ImageIcon, module: "gallery" },
  { href: "/admin/arkib", labelKey: "admin.manage.arkib", icon: Archive, module: "arkib" },
  { href: "/admin/penerbitan", labelKey: "admin.manage.penerbitan", icon: FileText, module: "penerbitan" },
  { href: "/admin/bahagian", labelKey: "admin.manage.bahagian", icon: Layers, module: "bahagian" },
  { href: "/admin/directory", labelKey: "admin.manage.directory", icon: Users, module: "directory" },
  { href: "/admin/integriti", labelKey: "admin.manage.integriti", icon: Shield, module: "integriti" },
  { href: "/admin/lagu-ligs", labelKey: "admin.manage.laguLigs", icon: Music2, module: "lagu-ligs" },
  { href: "/admin/media-sosial", labelKey: "admin.manage.mediaSosial", icon: Youtube, module: "media-sosial" },
  { href: "/admin/perkhidmatan", labelKey: "admin.manage.perkhidmatan", icon: Wrench, module: "perkhidmatan" },
  { href: "/admin/agensi-berkaitan", labelKey: "admin.manage.agensiBerkaitan", icon: Building2, module: "agensi-berkaitan" },
  { href: "/admin/theme", labelKey: "admin.manage.theme", icon: Palette, module: "theme" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { language, setLanguage, t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const user = session?.user as { role?: string; allowedModules?: string[] | null } | undefined
  const isAdmin = user?.role === "admin"
  const filteredNavItems = navItems.filter(
    (item) => canAccessModule(user?.role ?? "user", user?.allowedModules ?? null, item.module)
  )

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await signOut({ redirect: false })
      window.location.href = "/admin"
    } catch {
      setLoggingOut(false)
      window.location.href = "/admin"
    }
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="text-lg font-bold text-sidebar-foreground"
        >
<<<<<<< HEAD
          ligs Admin
=======
          LIGS Admin
>>>>>>> 91866b5ba89e98143037e30abed31cce5d1e3e33
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex flex-1 flex-col gap-1">
        {filteredNavItems.map((item) => {
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
                  : "text-sidebar-foreground/70 hover:bg-accent/20 hover:text-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          )
        })}
        {isAdmin && (
          <>
            <Link
              href="/admin/users"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === "/admin/users"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-accent/20 hover:text-accent"
              }`}
            >
              <UserCog className="h-4 w-4" />
              {t("admin.manage.users")}
            </Link>
            <Link
              href="/admin/activity-log"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === "/admin/activity-log"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-accent/20 hover:text-accent"
              }`}
            >
              <History className="h-4 w-4" />
              {t("admin.manage.activityLog")}
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-2 border-t border-sidebar-border pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === "en" ? "ms" : "en")}
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-accent hover:bg-accent/20"
        >
          <Globe className="h-4 w-4" />
          {language === "en" ? "Bahasa Malaysia" : "English"}
        </Button>
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-accent hover:bg-accent/20"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === "en" ? "Back to Site" : "Kembali ke Laman"}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-accent hover:bg-accent/20"
        >
          {loggingOut ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {loggingOut ? (language === "en" ? "Logging out..." : "Menglog keluar...") : t("admin.logout")}
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
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col overflow-y-auto bg-sidebar p-6 transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
