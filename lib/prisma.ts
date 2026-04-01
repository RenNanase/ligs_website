import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

<<<<<<< HEAD
function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL!)
  // Use 127.0.0.1 instead of localhost to force IPv4 (avoids IPv6 issues on Windows)
  const host = url.hostname === "localhost" ? "127.0.0.1" : url.hostname
  const database = url.pathname.slice(1).split("?")[0] || "ligs_website"
  const adapter = new PrismaMariaDb({
    host,
    port: Number(url.port) || 3306,
    user: url.username || "root",
    password: decodeURIComponent(url.password),
    database,
    allowPublicKeyRetrieval: true,
  })
  return new PrismaClient({ adapter })
}

function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma
  const hasFeedback = cached && typeof (cached as { feedback?: { create: unknown } }).feedback?.create === "function"
  const hasKelabSukan = cached && typeof (cached as { kelabSukanNews?: { findMany: unknown } }).kelabSukanNews?.findMany === "function"
  const hasPasswordResetToken = cached && typeof (cached as { passwordResetToken?: { deleteMany: unknown } }).passwordResetToken?.deleteMany === "function"
  if (hasFeedback && hasKelabSukan && hasPasswordResetToken) return cached

  const client = createPrismaClient()
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client
  return client
}

export const prisma = getPrisma()
=======
const dbUrl = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: dbUrl.username,
  password: dbUrl.password || undefined,
  database: dbUrl.pathname.slice(1),
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
>>>>>>> 91866b5ba89e98143037e30abed31cce5d1e3e33
