import { prisma } from "@/lib/prisma"

let ensurePromise: Promise<void> | null = null

/**
 * Ensures `NewsArticle.galleryEventId` exists when the DB predates the berita↔gallery migration.
 * Without this column, every Prisma read on NewsArticle throws P2022 and berita disappears site-wide.
 */
export function ensureNewsGalleryColumn(): Promise<void> {
  if (!ensurePromise) {
    ensurePromise = runEnsure().catch((err) => {
      ensurePromise = null
      throw err
    })
  }
  return ensurePromise
}

async function resolveNewsArticleTableName(): Promise<string> {
  const rows = await prisma.$queryRaw<{ name: string }[]>`
    SELECT TABLE_NAME AS name FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND LOWER(TABLE_NAME) = 'newsarticle'
    LIMIT 1
  `
  return rows[0]?.name ?? "NewsArticle"
}

async function runEnsure() {
  const tableName = await resolveNewsArticleTableName()

  const col = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*) AS c FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ${tableName}
      AND COLUMN_NAME = 'galleryEventId'
  `
  if (Number(col[0]?.c ?? 0) > 0) return

  console.warn(
    "[ensure-news-gallery-column] NewsArticle.galleryEventId missing — applying column (berita↔gallery link)."
  )

  const q = (sql: string) => prisma.$executeRawUnsafe(sql)
  const t = `\`${tableName}\``

  await q(`ALTER TABLE ${t} ADD COLUMN \`galleryEventId\` VARCHAR(191) NULL`)

  try {
    await q(`CREATE INDEX \`NewsArticle_galleryEventId_idx\` ON ${t}(\`galleryEventId\`)`)
  } catch {
    /* index may already exist */
  }

  try {
    await q(
      `ALTER TABLE ${t} ADD CONSTRAINT \`NewsArticle_galleryEventId_fkey\` FOREIGN KEY (\`galleryEventId\`) REFERENCES \`GalleryEvent\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`
    )
  } catch {
    console.warn("[ensure-news-gallery-column] FK not added (may already exist or GalleryEvent table differs).")
  }
}
