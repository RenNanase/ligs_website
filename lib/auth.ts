import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return {
      authenticated: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }
  return { authenticated: true as const, session }
}
