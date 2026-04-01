import type {
  BannerSlide,
  StatItem,
  NewsArticle,
  Announcement,
  Tender,
  Achievement,
  LandingContent,
} from "./data-store"

const API_BASE = "/api"

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function mutate<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    const message = typeof errBody?.error === "string" ? errBody.error : `API error: ${res.status}`
    throw new Error(message)
  }
  return res.json()
}

export const api = {
  // Banners
  getBanners: () => fetcher<BannerSlide[]>("/banners"),
  saveBanners: (banners: BannerSlide[]) => mutate<BannerSlide[]>("/banners", "PUT", banners),

  // Stats
  getStats: () => fetcher<StatItem[]>("/stats"),
  saveStats: (stats: StatItem[]) => mutate<StatItem[]>("/stats", "PUT", stats),

  // News
  getNews: () => fetcher<NewsArticle[]>("/news"),
  createNews: (data: Omit<NewsArticle, "id">) => mutate<NewsArticle>("/news", "POST", data),
  updateNews: (id: string, data: Partial<NewsArticle>) => mutate<NewsArticle>(`/news/${id}`, "PUT", data),
  deleteNews: (id: string) => mutate<{ success: boolean }>(`/news/${id}`, "DELETE"),

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

  // Achievements
  getAchievements: () => fetcher<Achievement[]>("/achievements"),
  createAchievement: (data: Omit<Achievement, "id">) => mutate<Achievement>("/achievements", "POST", data),
  updateAchievement: (id: string, data: Partial<Achievement>) => mutate<Achievement>(`/achievements/${id}`, "PUT", data),
  deleteAchievement: (id: string) => mutate<{ success: boolean }>(`/achievements/${id}`, "DELETE"),

  // Landing
  getLanding: () => fetcher<LandingContent>("/landing"),
  saveLanding: (data: LandingContent) => mutate<LandingContent>("/landing", "PUT", data),

  // Feedback (admin only — requires auth)
  getFeedbackCount: () => fetcher<{ count: number }>("/feedback?count=1"),
  getFeedbackList: (page = 1, limit = 20) =>
    fetcher<{ items: FeedbackItem[]; total: number; page: number; limit: number }>(
      `/feedback?page=${page}&limit=${limit}`
    ),

  // Kelab Sukan (public + admin)
  getKelabSukan: () => fetcher<KelabSukanPublic>("/kelab-sukan"),
  getKelabSukanNews: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const sp = new URLSearchParams()
    if (params?.page) sp.set("page", String(params.page))
    if (params?.limit) sp.set("limit", String(params.limit))
    if (params?.search) sp.set("search", params.search)
    if (params?.status) sp.set("status", params.status)
    return fetcher<KelabSukanNewsList>(`/kelab-sukan/news?${sp}`)
  },
  createKelabSukanNews: (data: KelabSukanNewsInput) => mutate<KelabSukanNewsItem>("/kelab-sukan/news", "POST", data),
  updateKelabSukanNews: (id: string, data: Partial<KelabSukanNewsInput>) =>
    mutate<KelabSukanNewsItem>(`/kelab-sukan/news/${id}`, "PUT", data),
  deleteKelabSukanNews: (id: string) => mutate<{ success: boolean }>(`/kelab-sukan/news/${id}`, "DELETE"),

  getKelabSukanIntro: () => fetcher<{ intro: string; logo: string | null }>("/kelab-sukan/intro"),
  saveKelabSukanIntro: (data: { intro?: string; logo?: string | null }) =>
    mutate<{ intro: string; logo: string | null }>("/kelab-sukan/intro", "PUT", data),

  getKelabSukanPresidents: () => fetcher<KelabSukanPresidentItem[]>("/kelab-sukan/presidents"),
  createKelabSukanPresident: (data: KelabSukanPresidentInput) =>
    mutate<KelabSukanPresidentItem>("/kelab-sukan/presidents", "POST", data),
  updateKelabSukanPresident: (id: string, data: Partial<KelabSukanPresidentInput>) =>
    mutate<KelabSukanPresidentItem>(`/kelab-sukan/presidents/${id}`, "PUT", data),
  deleteKelabSukanPresident: (id: string) =>
    mutate<{ success: boolean }>(`/kelab-sukan/presidents/${id}`, "DELETE"),
  reorderKelabSukanPresidents: (ids: string[]) =>
    mutate<{ success: boolean }>("/kelab-sukan/presidents/reorder", "PUT", { ids }),
}

export interface KelabSukanPublic {
  news: { id: string; title: string; content: string; featuredImage: string | null; datePosted: string }[]
  logo: string | null
  intro: string
  presidents: { id: string; name: string; startDate: string; endDate: string | null; imageUrl: string; description: string | null }[]
}

export interface KelabSukanNewsItem {
  id: string
  title: string
  content: string
  featuredImage: string | null
  datePosted: string
  status: string
  sortOrder?: number
}

export interface KelabSukanNewsInput {
  title: string
  content: string
  featuredImage?: string | null
  datePosted: string
  status?: string
}

export interface KelabSukanNewsList {
  items: KelabSukanNewsItem[]
  total: number
  page: number
  limit: number
}

export interface KelabSukanPresidentItem {
  id: string
  name: string
  startDate: string
  endDate: string | null
  imageUrl: string
  description: string | null
  sortOrder: number
}

export interface KelabSukanPresidentInput {
  name: string
  startDate: string
  endDate?: string | null
  imageUrl: string
  description?: string | null
}

export interface FeedbackItem {
  id: string
  name: string
  phone: string
  email: string
  subject: string
  message: string
  createdAt: string
}
