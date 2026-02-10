"use client"

import { type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminThemeProvider } from "@/lib/theme-context"

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { status } = useSession()

  if (status === "loading") return null

  if (status === "unauthenticated") {
    router.push("/admin")
    return null
  }

  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-secondary">
        <AdminSidebar />
        <div className="lg:pl-64">
          <div className="mx-auto max-w-6xl px-6 py-8 pt-16 lg:pt-8">
            {children}
          </div>
        </div>
      </div>
    </AdminThemeProvider>
  )
}
