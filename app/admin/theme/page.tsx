"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Palette, Check } from "lucide-react"
import { useState, useEffect } from "react"

const themes = [
  {
    id: "default",
    name: "Forest Green",
    primary: "#40826D",
    accent: "#F0531C",
    bg: "#FFF5EE",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    primary: "#2563EB",
    accent: "#F97316",
    bg: "#F0F9FF",
  },
  {
    id: "royal",
    name: "Royal Navy",
    primary: "#1E3A5F",
    accent: "#E63946",
    bg: "#F8FAFC",
  },
  {
    id: "earth",
    name: "Earth Tone",
    primary: "#8B5E3C",
    accent: "#D4A574",
    bg: "#FDF6EC",
  },
  {
    id: "avocado",
    name: "Avocado Green",
    primary: "#558700",
    accent: "#f05010",
    bg: "#fffae1",
  },
  {
    id: "evergreen",
    name: "Evergreen",
    primary: "#003400",
    accent: "#fda400",
    bg: "#Fcfff1",
  }
]

function hexToHsl(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export default function AdminThemePage() {
  const { t } = useLanguage()
  const [activeTheme, setActiveTheme] = useState("default")

  const applyTheme = (theme: (typeof themes)[0]) => {
    setActiveTheme(theme.id)
    const root = document.documentElement
    root.style.setProperty("--primary", hexToHsl(theme.primary))
    root.style.setProperty("--accent", hexToHsl(theme.accent))
    root.style.setProperty("--background", hexToHsl(theme.bg))
    root.style.setProperty("--secondary", hexToHsl(theme.bg))
    root.style.setProperty("--ring", hexToHsl(theme.primary))
    root.style.setProperty("--sidebar-background", hexToHsl(theme.primary))
    root.style.setProperty("--sidebar-primary", hexToHsl(theme.accent))
  }

  useEffect(() => {
    // Reset to default on unmount
    return () => {
      if (activeTheme !== "default") {
        const root = document.documentElement
        root.style.removeProperty("--primary")
        root.style.removeProperty("--accent")
        root.style.removeProperty("--background")
        root.style.removeProperty("--secondary")
        root.style.removeProperty("--ring")
        root.style.removeProperty("--sidebar-background")
        root.style.removeProperty("--sidebar-primary")
      }
    }
  }, [activeTheme])

  return (
    <AdminLayout>
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
            onClick={() => applyTheme(theme)}
            className={`relative rounded-xl border-2 bg-card p-6 text-left transition-all ${
              activeTheme === theme.id
                ? "border-primary shadow-lg"
                : "border-border hover:border-primary/30"
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
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
    </AdminLayout>
  )
}
