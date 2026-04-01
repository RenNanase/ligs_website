"use client"

import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { type ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getModuleFromPath, canAccessModule, getFirstAllowedModule } from "@/lib/permissions"

export function AdminPermissionGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  if (status !== "authenticated") return <>{children}</>

  const module = getModuleFromPath(pathname)
  if (!module) return <>{children}</> // e.g. /admin

  const user = session?.user as { role?: string; allowedModules?: string[] | null } | undefined
  const allowed = canAccessModule(
    user?.role ?? "user",
    user?.allowedModules ?? null,
    module
  )

  if (allowed) return <>{children}</>

  const firstModule = getFirstAllowedModule(user?.role ?? "user", user?.allowedModules ?? null)
  const targetPath = firstModule ? `/admin/${firstModule}` : "/admin"

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-destructive">Access Denied</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">
          ONLY Authorised USER is allowed
        </p>
        <Button
          onClick={() => router.push(targetPath)}
          className="w-full"
        >
          {firstModule ? "Go to allowed area" : "Sign out"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
