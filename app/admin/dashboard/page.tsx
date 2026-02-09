"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Newspaper, Users, Eye, ImageIcon, Megaphone, FileText } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const { t } = useLanguage()
  const { news, team, banners, announcements, tenders } = useDataStore()

  const stats = [
    {
      label: t("admin.manage.banners"),
      value: banners.length,
      icon: ImageIcon,
      href: "/admin/banners",
    },
    {
      label: t("admin.manage.news"),
      value: news.length,
      icon: Newspaper,
      href: "/admin/news",
    },
    {
      label: t("admin.manage.announcements"),
      value: announcements.length,
      icon: Megaphone,
      href: "/admin/announcements",
    },
    {
      label: t("admin.manage.tenders"),
      value: tenders.length,
      icon: FileText,
      href: "/admin/tenders",
    },
    {
      label: t("admin.manage.team"),
      value: team.length,
      icon: Users,
      href: "/admin/team",
    },
    {
      label: "Site Views",
      value: "1,245",
      icon: Eye,
      href: "#",
    },
  ]

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("admin.dashboard")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to the CorpSite administration panel.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href}>
              <div className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-card-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent News */}
      <div className="mt-10">
        <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
          Recent News Articles
        </h2>
        <div className="rounded-xl border border-border bg-card">
          {news.slice(0, 5).map((article, index) => (
            <div
              key={article.id}
              className={`flex items-center justify-between p-4 ${
                index < news.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div>
                <p className="font-medium text-card-foreground">{article.title}</p>
                <p className="text-sm text-muted-foreground">{article.date}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {article.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
