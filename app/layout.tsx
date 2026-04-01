import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, DM_Sans } from "next/font/google"

import "./globals.css"
import { ClientProviders } from "@/components/client-providers"
import { getThemeInitStyle } from "@/lib/theme-init-script"
import { fetchInitialData } from "@/lib/fetch-initial-data"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "Portal Rasmi Lembaga Industri Getah Sabah",
  description:
    "Industri Getah Yang Moden Berdaya Maju Dan Dinamik",
}

export const viewport: Viewport = {
  themeColor: "#40826D",
}

// Always fetch fresh data from DB on each request (no static pre-render)
export const dynamic = "force-dynamic"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialData = await fetchInitialData()
  const themeCss = getThemeInitStyle(initialData.themeId)

  return (
    <html
      lang="en"
      className={`${_inter.variable} ${_dmSans.variable}`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        {themeCss ? (
          <style
            id="theme-init"
            dangerouslySetInnerHTML={{ __html: themeCss }}
            suppressHydrationWarning
          />
        ) : null}
      </head>
      <body className="font-sans antialiased">
        <ClientProviders initialData={initialData}>{children}</ClientProviders>
      </body>
    </html>
  )
}

