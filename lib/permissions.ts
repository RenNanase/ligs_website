/**
 * Multi-level access control and activity logging.
 * Admin: full access. User: access only to assigned modules.
 */

/** Module keys matching admin sidebar routes (path segment after /admin/) */
export const CMS_MODULES = [
  "dashboard",
  "banners",
  "stats",
  "news",
  "announcements",
  "tenders",
  "feedback",
  "kepuasan-pelanggan",
  "jawatan-kosong",
  "e-pekeliling",
  "calendar",
  "achievements",
  "kelab-sukan",
  "gallery",
  "arkib",
  "penerbitan",
  "bahagian",
  "directory",
  "integriti",
  "lagu-ligs",
  "media-sosial",
  "perkhidmatan",
  "agensi-berkaitan",
  "theme",
  "akal",
] as const

export type CmsModule = (typeof CMS_MODULES)[number]

export const MODULE_LABELS: Record<CmsModule, string> = {
  dashboard: "Dashboard",
  banners: "Banners",
  stats: "Stats",
  news: "News",
  announcements: "Announcements",
  tenders: "Tenders",
  feedback: "Feedback",
  "kepuasan-pelanggan": "Kepuasan Pelanggan",
  "jawatan-kosong": "Jawatan Kosong",
  "e-pekeliling": "E-Pekeliling",
  calendar: "Calendar",
  achievements: "Achievements",
  "kelab-sukan": "Kelab Sukan",
  gallery: "Galeri",
  arkib: "Arkib",
  penerbitan: "Penerbitan",
  bahagian: "Bahagian",
  directory: "Directory",
  integriti: "Integriti",
  "lagu-ligs": "Lagu LIGS",
  "media-sosial": "Media Sosial",
  perkhidmatan: "Perkhidmatan",
  "agensi-berkaitan": "Agensi Berkaitan",
  theme: "Theme",
  akal: "AKAL (Anugerah Kecemerlangan Akademik)",
}

/** Admin-only modules (not assignable to regular users) */
export const ADMIN_ONLY_MODULES = ["users", "activity-log"] as const

/** Extract module from path like /admin/tenders or /admin/gallery/123 */
export function getModuleFromPath(pathname: string): CmsModule | "users" | "activity-log" | null {
  const match = pathname.match(/^\/admin\/([^/]+)/)
  if (!match) return null
  const segment = match[1]
  if (CMS_MODULES.includes(segment as CmsModule)) return segment as CmsModule
  if (segment === "users") return "users"
  if (segment === "activity-log") return "activity-log"
  return null
}

/** Check if user can access module. Admin has full access. Author/publisher get news access. */
export function canAccessModule(
  role: string,
  allowedModules: string[] | null,
  module: string
): boolean {
  if (role === "admin") return true
  if (ADMIN_ONLY_MODULES.includes(module as "users" | "activity-log")) return false
  // Author and publisher roles get news (berita) access by default
  if (module === "news" && (role === "author" || role === "publisher")) return true
  return Array.isArray(allowedModules) && allowedModules.includes(module)
}

/** Check if user can publish news. Only admin and publisher can publish. */
export function canPublishNews(role: string): boolean {
  return role === "admin" || role === "publisher"
}

/** First module the user can access. Admin: dashboard. Author/publisher: news. User: first in allowedModules. null if none. */
export function getFirstAllowedModule(
  role: string,
  allowedModules: string[] | null
): string | null {
  if (role === "admin") return "dashboard"
  if (role === "author" || role === "publisher") return "news"
  if (Array.isArray(allowedModules) && allowedModules.length > 0) {
    return allowedModules[0]
  }
  return null
}
