"use client"

import type { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { LanguageProvider } from "@/lib/language-context"
import { DataStoreProvider } from "@/lib/data-store"
import { ThemeProvider } from "@/lib/theme-context"
import { AccessibilityProvider } from "@/lib/accessibility-context"
import { AccessibilityFilters } from "@/components/accessibility-filters"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AccessibilityMenu } from "@/components/accessibility-menu"
import { Toaster } from "@/components/ui/sonner"
import type { InitialData } from "@/lib/data-store"

export function ClientProviders({
  children,
  initialData,
}: {
  children: ReactNode
  initialData?: InitialData
}) {
  return (
    <SessionProvider>
      <AccessibilityFilters />
      <ThemeProvider>
        <AccessibilityProvider>
          <LanguageProvider>
            <DataStoreProvider initialData={initialData}>
              {/* Filter applied only to main content so accessibility menu stays visible and usable */}
              <div className="a11y-filtered-content">
                <Navbar />
                <main className="min-h-screen bg-primary-bg">
                  {children}
                </main>
                <Footer />
              </div>
              <AccessibilityMenu />
            </DataStoreProvider>
          </LanguageProvider>
        </AccessibilityProvider>
      </ThemeProvider>
      <Toaster />
    </SessionProvider>
  )
}
