/**
 * One-time script: Set existing users to admin role.
 * Run after adding role/allowedModules columns.
 * Usage: npx dotenv -e .env -- tsx scripts/set-admin-users.ts
 *    or: npm run dev (loads .env) then run in another terminal with env set
 */
import "dotenv/config"
import { prisma } from "../lib/prisma"

async function main() {
  const result = await prisma.user.updateMany({
    where: { role: "user" },
    data: { role: "admin" },
  })
  console.log(`Updated ${result.count} user(s) to admin role`)
}

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect())
