"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { THEME_STORAGE_KEY } from "@/lib/theme-init-script"

export const themes = [
  {
    id: "default",
    name: "Forest Green",
    primary: "#40826D",
    accent: "#F0531C",
    bg: "#FFF5EE",
    bgPrimary: "#E8F3EF",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    primary: "#2563EB",
    accent: "#F97316",
    bg: "#F0F9FF",
    bgPrimary: "#EFF6FF",
  },
  {
    id: "royal",
    name: "Royal Navy",
    primary: "#213745",
    accent: "#ff5b8e",
    bg: "#ead9c9",
    bgPrimary: "#E8EEF2",
  },
  {
    id: "forest",
    name: "Forest Tone",
    primary: "#014421",
    accent: "#e4af2b",
    bg: "#f6e9d9",
    bgPrimary: "#E6F0EA",
  },
  {
    id: "avocado",
    name: "Avocado Green",
    primary: "#558700",
    accent: "#f05010",
    bg: "#fffae1",
    bgPrimary: "#F0F7E6",
  },
  {
    id: "evergreen",
    name: "Evergreen",
    primary: "#05503c",
    accent: "#fdca00",
    bg: "#Fcfff1",
    bgPrimary: "#fffff",
  },
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

function applyCssVariables(theme: (typeof themes)[0]) {
  const root = document.documentElement
  if (theme.id === "default") {
    root.style.removeProperty("--primary")
    root.style.removeProperty("--accent")
    root.style.removeProperty("--background")
    root.style.removeProperty("--secondary")
    root.style.removeProperty("--ring")
    root.style.removeProperty("--sidebar-background")
    root.style.removeProperty("--sidebar-primary")
    root.style.removeProperty("--bg-primary")
  } else {
    root.style.setProperty("--primary", hexToHsl(theme.primary))
    root.style.setProperty("--accent", hexToHsl(theme.accent))
    root.style.setProperty("--background", hexToHsl(theme.bg))
    root.style.setProperty("--secondary", hexToHsl(theme.bg))
    root.style.setProperty("--ring", hexToHsl(theme.primary))
    root.style.setProperty("--sidebar-background", hexToHsl(theme.primary))
    root.style.setProperty("--sidebar-primary", hexToHsl(theme.accent))
    root.style.setProperty("--bg-primary", hexToHsl(theme.bgPrimary))
  }
}

interface ThemeContextValue {
  activeTheme: string
  setTheme: (themeId: string) => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue>({
  activeTheme: "default",
  setTheme: async () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [activeTheme, setActiveTheme] = useState("default")

  // Load saved theme from database on mount; localStorage already applied by inline script
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.themeId) {
          const theme = themes.find((t) => t.id === data.themeId)
          if (theme) {
            setActiveTheme(theme.id)
            applyCssVariables(theme)
            try {
              localStorage.setItem(THEME_STORAGE_KEY, theme.id)
            } catch {
              /* ignore */
            }
          }
        }
      })
      .catch(() => {})
  }, [])

  const setTheme = async (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId)
    if (!theme) return

    // Apply immediately for instant feedback
    setActiveTheme(theme.id)
    applyCssVariables(theme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme.id)
    } catch {
      /* ignore */
    }

    // Persist to database
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId }),
      })
      if (!res.ok) {
        console.error("Failed to save theme:", res.status, await res.text())
      }
    } catch (err) {
      console.error("Failed to save theme:", err)
    }
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** @deprecated Use ThemeProvider instead */
export const AdminThemeProvider = ThemeProvider
