"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Mail } from "lucide-react"

export default function AdminLoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Simple demo auth
    if (email === "admin@corpsite.com" && password === "admin123") {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_auth", "true")
      }
      router.push("/admin/dashboard")
    } else {
      setError(
        "Invalid credentials. Use admin@corpsite.com / admin123"
      )
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-card-foreground">
            {t("admin.login")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            CorpSite Administration
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <Label htmlFor="email" className="mb-2 block text-sm font-medium text-card-foreground">
              {t("admin.email")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@corpsite.com"
                className="bg-background pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="mb-2 block text-sm font-medium text-card-foreground">
              {t("admin.password")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="********"
                className="bg-background pl-10"
              />
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {t("admin.signin")}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo: admin@corpsite.com / admin123
        </p>
      </div>
    </div>
  )
}
