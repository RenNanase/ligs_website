"use client"

import React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { useLanguage } from "@/lib/language-context"
import { getFirstAllowedModule } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Lock, Mail } from "lucide-react"

export default function AdminLoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const user = session?.user as { role?: string; allowedModules?: string[] | null } | undefined

  // Redirect if already authenticated to first allowed module
  useEffect(() => {
    if (status === "authenticated" && user) {
      const first = getFirstAllowedModule(user.role ?? "admin", user.allowedModules ?? null)
      if (first) router.push(`/admin/${first}`)
    }
  }, [status, router, user?.role, user?.allowedModules])

  // Authenticated with no modules: show message (no redirect loop)
  if (status === "authenticated" && user) {
    const first = getFirstAllowedModule(user.role ?? "admin", user.allowedModules ?? null)
    if (!first) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white px-6">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg text-center">
            <p className="text-muted-foreground mb-4">No modules assigned. Contact administrator.</p>
            <Link href="/api/auth/signout">
              <Button variant="outline">Sign out</Button>
            </Link>
          </div>
        </div>
      )
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid credentials. Please try again.")
    }
    setLoading(false)
    // Success: session updates async; useEffect will redirect to first allowed module
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-card-foreground">
            {t("admin.login")}
          </h1>
<<<<<<< HEAD
          
=======
          <p className="mt-2 text-sm text-muted-foreground">
            Lembaga Industri Getah Sabah
          </p>
>>>>>>> 91866b5ba89e98143037e30abed31cce5d1e3e33
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
                placeholder="admin@ligs.com"
                className="bg-background pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="mb-2 block text-sm font-medium text-card-foreground">
              {t("admin.password")}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <PasswordInput
                id="password"
                name="password"
                required
                placeholder="********"
                className="bg-background pl-10"
              />
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground font-semibold"
          >
            {loading ? "Signing in..." : t("admin.signin")}
          </Button>
        </form>

<<<<<<< HEAD
        
        <p className="mt-5 text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground transition-colors hover:text-accent underline underline-offset-2"
          >
            {t("admin.backToWebsite")}
          </Link>
=======
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo: admin@ligs.com / admin123
>>>>>>> 91866b5ba89e98143037e30abed31cce5d1e3e33
        </p>
      </div>
    </div>
  )
}
