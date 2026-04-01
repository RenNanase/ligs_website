import { prisma } from "@/lib/prisma"
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

async function fetchInitialDataFromDb(): Promise<InitialData> {
    const [banners, stats, news, announcements, tenders, achievements, landing, settings] =
      await Promise.all([
        prisma.bannerSlide.findMany({ orderBy: { sortOrder: "asc" } }),
        prisma.statItem.findMany({ orderBy: { sortOrder: "asc" } }),
        prisma.newsArticle.findMany({
          where: { isArchived: false },
          orderBy: { date: "desc" },
          include: { images: { orderBy: { sortOrder: "asc" } } },
        }),
        prisma.announcement.findMany({
          orderBy: [{ pinned: "desc" }, { date: "desc" }],
        }),
        prisma.tender.findMany({
          orderBy: [{ status: "asc" }, { closingDate: "desc" }],
        }),
        prisma.achievement.findMany({
          orderBy: { achievementDate: "desc" },
        }),
        prisma.landingContent.findFirst({
          include: { highlights: { orderBy: { sortOrder: "asc" } } },
        }),
        prisma.siteSettings.findUnique({ where: { id: SINGLETON_ID } }),
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
