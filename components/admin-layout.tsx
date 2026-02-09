"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"

export function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("admin_auth")
      if (auth !== "true") {
        router.push("/admin")
      } else {
        setIsAuth(true)
      }
    }
  }, [router])

  if (!isAuth) return null

  return (
    <div className="min-h-screen bg-secondary">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-6 py-8 pt-16 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  )
}
