"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import {
  useAccessibility,
  type ColorVision,
} from "@/lib/accessibility-context"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Accessibility, Type, Palette, RotateCcw, Minus, Plus } from "lucide-react"
import { usePathname } from "next/navigation"

const COLOR_VISION_OPTIONS: { value: ColorVision; labelKey: string }[] = [
  { value: "normal", labelKey: "a11y.colorVision.normal" },
  { value: "protanopia", labelKey: "a11y.colorVision.protanopia" },
  { value: "deuteranopia", labelKey: "a11y.colorVision.deuteranopia" },
  { value: "tritanopia", labelKey: "a11y.colorVision.tritanopia" },
  { value: "achromatopsia", labelKey: "a11y.colorVision.achromatopsia" },
]

export function AccessibilityMenu() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  const {
    fontSize,
    colorVision,
    highContrast,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setColorVision,
    setHighContrast,
    resetAll,
  } = useAccessibility()

  const isAdmin = pathname?.startsWith("/admin")
  if (isAdmin) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full border-2 border-primary bg-card shadow-lg transition-all hover:scale-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={t("a11y.menuLabel")}
            aria-haspopup="dialog"
          >
            <Accessibility className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          sideOffset={12}
          onKeyDown={handleKeyDown}
          className="w-80 rounded-xl border-2 border-border bg-card p-5 shadow-xl"
          aria-label={t("a11y.panelTitle")}
        >
          <div className="space-y-5">
            <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
              <Accessibility className="h-5 w-5 text-primary" aria-hidden />
              {t("a11y.panelTitle")}
            </h3>

            {/* Font size */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Type className="h-4 w-4" aria-hidden />
                {t("a11y.fontSize")}
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={decreaseFontSize}
                  disabled={fontSize <= 0.8}
                  aria-label={t("a11y.decreaseFont")}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[3rem] text-center text-sm font-medium tabular-nums text-foreground">
                  {Math.round(fontSize * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={increaseFontSize}
                  disabled={fontSize >= 2}
                  aria-label={t("a11y.increaseFont")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Color vision */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Palette className="h-4 w-4" aria-hidden />
                {t("a11y.colorVision")}
              </Label>
              <select
                value={colorVision}
                onChange={(e) => setColorVision(e.target.value as ColorVision)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={t("a11y.colorVision")}
              >
                {COLOR_VISION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
            </div>

            {/* High contrast */}
            <div className="flex items-center justify-between gap-4">
              <Label
                htmlFor="a11y-high-contrast"
                className="flex-1 text-sm font-medium text-foreground"
              >
                {t("a11y.highContrast")}
              </Label>
              <button
                id="a11y-high-contrast"
                type="button"
                role="switch"
                aria-checked={highContrast}
                onClick={() => setHighContrast(!highContrast)}
                className={`relative h-6 w-11 shrink-0 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  highContrast
                    ? "border-primary bg-primary"
                    : "border-input bg-input"
                }`}
              >
                <span
                  className={`absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    highContrast ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Reset */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                resetAll()
                setOpen(false)
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              {t("a11y.reset")}
            </Button>
          </div>
        </PopoverContent>
    </Popover>
  )
}
