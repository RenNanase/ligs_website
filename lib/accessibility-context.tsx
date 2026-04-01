"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

const STORAGE_KEY = "ligs-accessibility"
const FONT_MIN = 0.8
const FONT_MAX = 2
const FONT_STEP = 0.1
const FONT_DEFAULT = 1

export type ColorVision =
  | "normal"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia"

interface AccessibilityState {
  fontSize: number
  colorVision: ColorVision
  highContrast: boolean
}

const defaultState: AccessibilityState = {
  fontSize: FONT_DEFAULT,
  colorVision: "normal",
  highContrast: false,
}

interface AccessibilityContextType {
  fontSize: number
  colorVision: ColorVision
  highContrast: boolean
  setFontSize: (size: number) => void
  increaseFontSize: () => void
  decreaseFontSize: () => void
  resetFontSize: () => void
  setColorVision: (mode: ColorVision) => void
  setHighContrast: (on: boolean) => void
  resetAll: () => void
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

function loadState(): AccessibilityState {
  if (typeof window === "undefined") return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<AccessibilityState>
    return {
      fontSize: clampFont(parsed.fontSize ?? FONT_DEFAULT),
      colorVision: validColorVision(parsed.colorVision) ?? "normal",
      highContrast: Boolean(parsed.highContrast),
    }
  } catch {
    return defaultState
  }
}

function clampFont(n: number): number {
  return Math.max(FONT_MIN, Math.min(FONT_MAX, n))
}

function validColorVision(v: unknown): ColorVision | null {
  if (
    v === "normal" ||
    v === "protanopia" ||
    v === "deuteranopia" ||
    v === "tritanopia" ||
    v === "achromatopsia"
  ) {
    return v
  }
  return null
}

function saveState(state: AccessibilityState) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(defaultState)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setState(loadState())
    setMounted(true)
  }, [])

  const persist = useCallback((next: Partial<AccessibilityState>) => {
    setState((prev) => {
      const merged = { ...prev, ...next }
      if (typeof window !== "undefined") saveState(merged)
      return merged
    })
  }, [])

  const setFontSize = useCallback(
    (size: number) => {
      persist({ fontSize: clampFont(size) })
    },
    [persist]
  )

  const increaseFontSize = useCallback(() => {
    setState((prev) => {
      const next = clampFont(prev.fontSize + FONT_STEP)
      const merged = { ...prev, fontSize: next }
      if (typeof window !== "undefined") saveState(merged)
      return merged
    })
  }, [])

  const decreaseFontSize = useCallback(() => {
    setState((prev) => {
      const next = clampFont(prev.fontSize - FONT_STEP)
      const merged = { ...prev, fontSize: next }
      if (typeof window !== "undefined") saveState(merged)
      return merged
    })
  }, [])

  const resetFontSize = useCallback(() => {
    persist({ fontSize: FONT_DEFAULT })
  }, [persist])

  const setColorVision = useCallback(
    (mode: ColorVision) => persist({ colorVision: mode }),
    [persist]
  )

  const setHighContrast = useCallback(
    (on: boolean) => persist({ highContrast: on }),
    [persist]
  )

  const resetAll = useCallback(() => {
    const reset = defaultState
    setState(reset)
    if (typeof window !== "undefined") saveState(reset)
  }, [])

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize: state.fontSize,
        colorVision: state.colorVision,
        highContrast: state.highContrast,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        setColorVision,
        setHighContrast,
        resetAll,
      }}
    >
      {children}
      {mounted && (
        <AccessibilityStyleInjector
          fontSize={state.fontSize}
          colorVision={state.colorVision}
          highContrast={state.highContrast}
        />
      )}
    </AccessibilityContext.Provider>
  )
}

function AccessibilityStyleInjector({
  fontSize,
  colorVision,
  highContrast,
}: {
  fontSize: number
  colorVision: ColorVision
  highContrast: boolean
}) {
  useEffect(() => {
    const root = document.documentElement

    root.style.setProperty("--a11y-font-scale", String(fontSize))

    const filterMap: Record<ColorVision, string> = {
      normal: "none",
      protanopia: "url(#protanopia)",
      deuteranopia: "url(#deuteranopia)",
      tritanopia: "url(#tritanopia)",
      achromatopsia: "grayscale(1)",
    }
    root.style.setProperty("--a11y-color-filter", filterMap[colorVision])

    root.dataset.highContrast = highContrast ? "true" : "false"
  }, [fontSize, colorVision, highContrast])

  return null
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) {
    throw new Error("useAccessibility must be used within AccessibilityProvider")
  }
  return ctx
}
