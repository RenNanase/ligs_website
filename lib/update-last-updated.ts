import { prisma } from "@/lib/prisma"

const SINGLETON_ID = "singleton"

/**
 * Updates the site's lastUpdated timestamp in SiteSettings.
 * Call this whenever CMS content is created, updated, or deleted.
 */
export async function updateLastUpdated(): Promise<void> {
  try {
    await prisma.siteSettings.upsert({
      where: { id: SINGLETON_ID },
      update: { lastUpdated: new Date() },
      create: { id: SINGLETON_ID, themeId: "default", lastUpdated: new Date() },
    })
  } catch (err) {
    console.error("updateLastUpdated error:", err)
  }
}
