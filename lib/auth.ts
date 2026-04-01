import { decode } from "next-auth/jwt"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { canAccessModule, canPublishNews } from "./permissions"

export type AuthUser = {
  id: string
  email?: string
  name?: string | null
  role: string
  allowedModules: string[] | null
}

export async function requireAuth() {
  const cookieStore = await cookies()
  const sessionToken =
    cookieStore.get("next-auth.session-token")?.value ||
    cookieStore.get("__Secure-next-auth.session-token")?.value

  if (!sessionToken) {
    return {
      authenticated: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const token = await decode({
    token: sessionToken,
    secret: process.env.NEXTAUTH_SECRET!,
  })

  if (!token) {
    return {
      authenticated: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  const user: AuthUser = {
    id: token.id as string,
    email: token.email as string,
    name: token.name as string | null,
    role: (token.role as string) ?? "admin",
    allowedModules: (token.allowedModules as string[] | null) ?? null,
  }

  return { authenticated: true as const, session: { user } }
}

/** Require auth AND permission to access module. Use for API routes. */
export async function requirePermission(module: string) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth

  const allowed = canAccessModule(auth.session.user.role, auth.session.user.allowedModules, module)
  if (!allowed) {
    return {
      authenticated: false as const,
      response: NextResponse.json(
        { error: "Only authorised user is allowed" },
        { status: 403 }
      ),
    }
  }

  return auth
}

/** Require news module access. Optionally require publish ability (for changing status to published). */
export async function requireNewsPermission(requirePublish = false) {
  const auth = await requirePermission("news")
  if (!auth.authenticated) return auth
  if (requirePublish && !canPublishNews(auth.session.user.role)) {
    return {
      authenticated: false as const,
      response: NextResponse.json(
        { error: "Only publisher or admin can publish news" },
        { status: 403 }
      ),
    }
  }
  return auth
}

/** Require admin role. Use for users management and activity log. */
export async function requireAdmin() {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth
  if (auth.session.user.role !== "admin") {
    return {
      authenticated: false as const,
      response: NextResponse.json({ error: "Admin only" }, { status: 403 }),
    }
  }
  return auth
}
