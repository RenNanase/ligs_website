import path from "node:path"
import { config } from "dotenv"
import { defineConfig, env } from "prisma/config"

// Load .env from same directory as this config (ligs_website folder)
config({ path: path.resolve(__dirname, ".env") })

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
})
