import { prisma } from "@/lib/prisma"
import { ensureNewsGalleryColumn } from "@/lib/ensure-news-gallery-column"
import type {
  BannerSlide,
  StatItem,
  NewsArticle,
  Announcement,
  Tender,
  Achievement,
  LandingContent,
  InitialData,
} from "./data-store"

export type { InitialData }

const SINGLETON_ID = "singleton"

const EMPTY_INITIAL_DATA: InitialData = {
  banners: [],
  stats: [],
  news: [],
  announcements: [],
  tenders: [],
  achievements: [],
  landing: null,
  themeId: "default",
}

async function fetchInitialDataUncached(): Promise<InitialData> {
  const timeoutMs = 15000
  const fetchWithTimeout = () =>
    Promise.race([
      fetchInitialDataFromDb(),
      new Promise<InitialData>((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timeout during build")), timeoutMs)
      ),
    ])

  try {
    return await fetchWithTimeout()
  } catch (error) {
    console.error("Failed to fetch initial data:", error)
    return EMPTY_INITIAL_DATA
  }
}

/** Isolates failures so one broken query does not clear the entire site (empty arrays are returned instead). */
async function safeQuery<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    console.error(`[fetchInitialData] ${label} failed:`, error)
    return fallback
  }
}

async function fetchNewsForInitialData() {
  const base = {
    where: { isArchived: false },
    orderBy: { date: "desc" as const },
    include: {
      images: { orderBy: { sortOrder: "asc" as const } },
    },
  }
  try {
    return await prisma.newsArticle.findMany({
      ...base,
      include: {
        ...base.include,
        galleryEvent: { select: { title: true } },
      },
    })
  } catch (error) {
    // e.g. migration not applied yet — `galleryEventId` / relation missing
    console.warn("[fetchInitialData] news with gallery relation failed, loading without link:", error)
    return prisma.newsArticle.findMany(base)
  }
}

async function fetchInitialDataFromDb(): Promise<InitialData> {
  await ensureNewsGalleryColumn()

  const [banners, stats, news, announcements, tenders, achievements, landing, settings] =
    await Promise.all([
      safeQuery("banners", () => prisma.bannerSlide.findMany({ orderBy: { sortOrder: "asc" } }), []),
      safeQuery("stats", () => prisma.statItem.findMany({ orderBy: { sortOrder: "asc" } }), []),
      safeQuery("news", fetchNewsForInitialData, []),
      safeQuery("announcements", () =>
        prisma.announcement.findMany({
          orderBy: [{ pinned: "desc" }, { date: "desc" }],
        }), []),
      safeQuery("tenders", () =>
        prisma.tender.findMany({
          orderBy: [{ status: "asc" }, { closingDate: "desc" }],
        }), []),
      safeQuery("achievements", () =>
        prisma.achievement.findMany({
          orderBy: { achievementDate: "desc" },
        }), []),
      safeQuery("landing", () =>
        prisma.landingContent.findFirst({
          include: { highlights: { orderBy: { sortOrder: "asc" } } },
        }), null),
      safeQuery("settings", () => prisma.siteSettings.findUnique({ where: { id: SINGLETON_ID } }), null),
    ])

    const newsTransformed: NewsArticle[] = news.map((a) => ({
      id: a.id,
      title: a.title,
      titleMs: a.titleMs,
      content: a.content,
      contentMs: a.contentMs,
      date: a.date,
      category: a.category,
      images: a.images.map((img) => img.url),
      galleryEventId: a.galleryEventId ?? null,
      galleryEventTitle: a.galleryEvent?.title ?? null,
    }))

    const tendersTransformed: Tender[] = tenders.map((t) => ({
      id: t.id,
      title: t.title,
      titleMs: t.titleMs,
      openingDate: t.openingDate,
      closingDate: t.closingDate,
      pdfUrl: t.pdfUrl,
      status: (t.status === "closed" ? "closed" : "open") as "open" | "closed",
    }))

    const achievementsTransformed: Achievement[] = achievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      imageUrl: a.imageUrl,
      achievementDate:
        typeof a.achievementDate === "string"
          ? a.achievementDate
          : a.achievementDate.toISOString().slice(0, 10),
    }))

    const landingTransformed: LandingContent | null = landing
      ? {
          heroTitle: landing.heroTitle,
          heroTitleMs: landing.heroTitleMs,
          heroSubtitle: landing.heroSubtitle,
          heroSubtitleMs: landing.heroSubtitleMs,
          highlights: landing.highlights.map((h) => ({
            id: h.id,
            title: h.title,
            titleMs: h.titleMs,
            description: h.description,
            descriptionMs: h.descriptionMs,
            icon: h.icon,
          })),
        }
      : null

    return {
      banners: banners as unknown as BannerSlide[],
      stats: stats as unknown as StatItem[],
      news: newsTransformed,
      announcements: announcements as unknown as Announcement[],
      tenders: tendersTransformed,
      achievements: achievementsTransformed,
      landing: landingTransformed,
      themeId: settings?.themeId ?? "default",
    }
}

// Always fetch fresh from DB - no caching. Ensures banner images and other CMS
// updates display immediately without requiring pm2 restart.
export const fetchInitialData = fetchInitialDataUncached
