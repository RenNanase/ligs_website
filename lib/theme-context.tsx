"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export const themes = [
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
  },
]

const THEME_STORAGE_KEY = "ligs_admin_theme"

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

function applyCssVariables(theme: (typeof themes)[0]) {
  const root = document.documentElement
  if (theme.id === "default") {
    // Remove overrides so the CSS defaults in globals.css take effect
    root.style.removeProperty("--primary")
    root.style.removeProperty("--accent")
    root.style.removeProperty("--background")
    root.style.removeProperty("--secondary")
    root.style.removeProperty("--ring")
    root.style.removeProperty("--sidebar-background")
    root.style.removeProperty("--sidebar-primary")
  } else {
    root.style.setProperty("--primary", hexToHsl(theme.primary))
    root.style.setProperty("--accent", hexToHsl(theme.accent))
    root.style.setProperty("--background", hexToHsl(theme.bg))
    root.style.setProperty("--secondary", hexToHsl(theme.bg))
    root.style.setProperty("--ring", hexToHsl(theme.primary))
    root.style.setProperty("--sidebar-background", hexToHsl(theme.primary))
    root.style.setProperty("--sidebar-primary", hexToHsl(theme.accent))
  }
}

interface ThemeContextValue {
  activeTheme: string
  setTheme: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  activeTheme: "default",
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveTheme] = useState("default")

  // Load saved theme from localStorage on mount and apply it
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved) {
      const theme = themes.find((t) => t.id === saved)
      if (theme) {
        setActiveTheme(theme.id)
        applyCssVariables(theme)
      }
    }
  }, [])

  const setTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId)
    if (!theme) return
    setActiveTheme(theme.id)
    localStorage.setItem(THEME_STORAGE_KEY, theme.id)
    applyCssVariables(theme)
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
