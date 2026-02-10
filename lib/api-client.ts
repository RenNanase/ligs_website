import type {
  BannerSlide,
  StatItem,
  NewsArticle,
  TeamMember,
  Announcement,
  Tender,
  LandingContent,
} from "./data-store"

const API_BASE = "/api"

async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function mutate<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const api = {
  // Banners
  getBanners: () => fetcher<BannerSlide[]>("/banners"),
  saveBanners: (banners: BannerSlide[]) => mutate<BannerSlide[]>("/banners", "PUT", banners),

  // Stats
  getStats: () => fetcher<StatItem[]>("/stats"),

  // News
  getNews: () => fetcher<NewsArticle[]>("/news"),
  createNews: (data: Omit<NewsArticle, "id">) => mutate<NewsArticle>("/news", "POST", data),
  updateNews: (id: string, data: Partial<NewsArticle>) => mutate<NewsArticle>(`/news/${id}`, "PUT", data),
  deleteNews: (id: string) => mutate<{ success: boolean }>(`/news/${id}`, "DELETE"),

  // Team
  getTeam: () => fetcher<TeamMember[]>("/team"),
  createTeamMember: (data: Omit<TeamMember, "id">) => mutate<TeamMember>("/team", "POST", data),
  updateTeamMember: (id: string, data: Partial<TeamMember>) => mutate<TeamMember>(`/team/${id}`, "PUT", data),
  deleteTeamMember: (id: string) => mutate<{ success: boolean }>(`/team/${id}`, "DELETE"),

  // Announcements
  getAnnouncements: () => fetcher<Announcement[]>("/announcements"),
  createAnnouncement: (data: Omit<Announcement, "id">) => mutate<Announcement>("/announcements", "POST", data),
  updateAnnouncement: (id: string, data: Partial<Announcement>) => mutate<Announcement>(`/announcements/${id}`, "PUT", data),
  deleteAnnouncement: (id: string) => mutate<{ success: boolean }>(`/announcements/${id}`, "DELETE"),

  // Tenders
  getTenders: () => fetcher<Tender[]>("/tenders"),
  createTender: (data: Omit<Tender, "id">) => mutate<Tender>("/tenders", "POST", data),
  updateTender: (id: string, data: Partial<Tender>) => mutate<Tender>(`/tenders/${id}`, "PUT", data),
  deleteTender: (id: string) => mutate<{ success: boolean }>(`/tenders/${id}`, "DELETE"),

  // Landing
  getLanding: () => fetcher<LandingContent>("/landing"),
  saveLanding: (data: LandingContent) => mutate<LandingContent>("/landing", "PUT", data),
}
