"use client"

import type { ReactNode } from "react"
import { LanguageProvider } from "@/lib/language-context"
import { DataStoreProvider } from "@/lib/data-store"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <DataStoreProvider>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </DataStoreProvider>
    </LanguageProvider>
  )
}
