"use client"

import { type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminPermissionGuard } from "@/components/admin-permission-guard"

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin")
  }, [status, router])

  if (status === "loading") return null
  if (status === "unauthenticated") return null

  return (
    <div className="min-h-screen bg-primary-bg">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-6 py-8 pt-16 lg:pt-8">
          <AdminPermissionGuard>{children}</AdminPermissionGuard>
        </div>
      </div>
    </div>
  )
}
