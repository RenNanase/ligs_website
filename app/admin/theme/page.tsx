"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { themes, useTheme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button"
import { Palette, Check } from "lucide-react"

function ThemeContent() {
  const { t } = useLanguage()
  const { activeTheme, setTheme } = useTheme()

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("admin.manage.theme")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Switch the color theme of the website dynamically.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {themes.map((theme) => (
          <button
            type="button"
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            className={`relative rounded-xl border-2 bg-card p-6 text-left transition-all ${
              activeTheme === theme.id
                ? "border-primary shadow-lg"
                : "border-border hover:border-accent/50"
            }`}
          >
            {activeTheme === theme.id && (
              <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            <div className="mb-4 flex items-center gap-3">
              <Palette className="h-5 w-5 text-card-foreground" />
              <span className="font-heading text-lg font-semibold text-card-foreground">
                {theme.name}
              </span>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-10 w-10 rounded-lg border border-border"
                  style={{ backgroundColor: theme.primary }}
                />
                <span className="text-xs text-muted-foreground">Primary</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-10 w-10 rounded-lg border border-border"
                  style={{ backgroundColor: theme.accent }}
                />
                <span className="text-xs text-muted-foreground">Accent</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-10 w-10 rounded-lg border border-border"
                  style={{ backgroundColor: theme.bg }}
                />
                <span className="text-xs text-muted-foreground">Background</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-card-foreground">
          Preview
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
            Primary Button
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            Accent Button
          </Button>
          <Button variant="outline">Outline Button</Button>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
            <span className="text-sm font-medium text-primary">
              Primary text on light bg
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function AdminThemePage() {
  return (
    <AdminLayout>
      <ThemeContent />
    </AdminLayout>
  )
}
