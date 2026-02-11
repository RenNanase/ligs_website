import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, DM_Sans } from "next/font/google"

import "./globals.css"
import { ClientProviders } from "@/components/client-providers"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "LIGS - Building the Future Together",
  description:
    "We deliver innovative solutions that transform businesses and drive sustainable growth across industries.",
}

export const viewport: Viewport = {
  themeColor: "#40826D",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_dmSans.variable}`}>
      <body className="font-sans antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
