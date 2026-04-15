"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { api } from "./api-client"

export interface InitialData {
  banners: BannerSlide[]
  stats: StatItem[]
  news: NewsArticle[]
  announcements: Announcement[]
  tenders: Tender[]
  achievements: Achievement[]
  landing: LandingContent | null
  themeId: string
}

export interface BannerSlide {
  id: string
  image: string
  title: string
  titleMs: string
  caption: string
  captionMs: string
  ctaText: string
  ctaTextMs: string
  ctaLink: string
}

export interface StatItem {
  id: string
  labelKey: string
  value: number
  suffix: string
}

export interface NewsArticle {
  id: string
  title: string
  titleMs: string
  content: string
  contentMs: string
  date: string
  images: string[]
  category: string
  status?: "draft" | "published"
  /** Optional related public gallery event (CMS picker). */
  galleryEventId?: string | null
  galleryEventTitle?: string | null
}

export type AnnouncementLink = { url: string; text: string }

export interface Announcement {
  id: string
  title: string
  titleMs: string
  summary: string
  summaryMs: string
  date: string
  pinned: boolean
  active?: boolean
  category: string
  imageUrl?: string | null
  linkUrl?: string | null
  linkText?: string | null
  links?: AnnouncementLink[] | null
}

export interface Tender {
  id: string
  title: string
  titleMs: string
  openingDate: string
  closingDate: string
  pdfUrl: string
  status: "open" | "closed"
}

export interface Achievement {
  id: string
  title: string
  description: string
  imageUrl: string
  achievementDate: string
}

export interface LandingContent {
  heroTitle: string
  heroTitleMs: string
  heroSubtitle: string
  heroSubtitleMs: string
  highlights: {
    id: string
    title: string
    titleMs: string
    description: string
    descriptionMs: string
    icon: string
  }[]
}

// --- Default data (fallback during initial load) ---

const defaultBanners: BannerSlide[] = [
  {
    id: "1",
    image: "",
    title: "Empowering Smallholders Nationwide",
    titleMs: "Memperkasakan Pekebun Kecil Seluruh Negara",
    caption: "Supporting rubber industry growth through innovation and sustainable practices for a better tomorrow.",
    captionMs: "Menyokong pertumbuhan industri getah melalui inovasi dan amalan mampan untuk hari esok yang lebih baik.",
    ctaText: "Learn More",
    ctaTextMs: "Ketahui Lebih",
    ctaLink: "/about",
  },
  {
    id: "2",
    image: "",
    title: "Driving Sustainable Growth",
    titleMs: "Memacu Pertumbuhan Mampan",
    caption: "Our commitment to environmental stewardship and community development continues to shape the future.",
    captionMs: "Komitmen kami terhadap kelestarian alam sekitar dan pembangunan komuniti terus membentuk masa depan.",
    ctaText: "Our Services",
    ctaTextMs: "Perkhidmatan Kami",
    ctaLink: "/services",
  },
  {
    id: "3",
    image: "",
    title: "Building Partnerships That Last",
    titleMs: "Membina Perkongsian Berkekalan",
    caption: "Collaborating with global and local stakeholders to create opportunities and drive meaningful impact.",
    captionMs: "Bekerjasama dengan pihak berkepentingan global dan tempatan untuk mencipta peluang dan kesan bermakna.",
    ctaText: "Contact Us",
    ctaTextMs: "Hubungi Kami",
    ctaLink: "/contact",
  },
]

const defaultStats: StatItem[] = [
  { id: "1", labelKey: "stats.pekebun", value: 700, suffix: "" },
  { id: "2", labelKey: "stats.penoreh", value: 895, suffix: "" },
  { id: "3", labelKey: "stats.keluasan", value: 93201, suffix: "" },
]

const defaultNews: NewsArticle[] = [
  {
    id: "1",
    title: "Company Expands Operations to Southeast Asia",
    status: "published",
    titleMs: "Syarikat Meluaskan Operasi ke Asia Tenggara",
    content: "We are thrilled to announce our expansion into Southeast Asia, bringing our innovative solutions to new markets. This strategic move reflects our commitment to serving clients across the region with the same excellence they have come to expect. Our team is already on the ground, establishing partnerships and building the infrastructure needed to deliver world-class services.",
    contentMs: "Kami teruja mengumumkan pengembangan kami ke Asia Tenggara, membawa penyelesaian inovatif kami ke pasaran baharu. Langkah strategik ini mencerminkan komitmen kami untuk melayani pelanggan di seluruh rantau ini dengan kecemerlangan yang mereka harapkan.",
    date: "2026-01-15",
    images: [],
    category: "Expansion",
    status: "published",
  },
  {
    id: "2",
    title: "Awarded Best Consulting Firm 2025",
    titleMs: "Dianugerahkan Firma Perundingan Terbaik 2025",
    content: "We are honored to receive the prestigious Best Consulting Firm award for 2025. This recognition underscores our team's dedication to delivering exceptional results and our commitment to innovation. We want to thank our incredible clients and partners who have been instrumental in this journey. This award motivates us to continue pushing boundaries.",
    contentMs: "Kami berbesar hati menerima anugerah berprestij Firma Perundingan Terbaik untuk 2025. Pengiktirafan ini menekankan dedikasi pasukan kami untuk menyampaikan hasil yang luar biasa dan komitmen kami terhadap inovasi.",
    date: "2025-12-20",
    images: [],
    category: "Awards",
    status: "published",
  },
  {
    id: "3",
    title: "New Partnership with Global Tech Leaders",
    titleMs: "Perkongsian Baharu dengan Pemimpin Teknologi Global",
    content: "We have formed a strategic partnership with leading global technology firms to bring cutting-edge digital solutions to our clients. This collaboration will enable us to offer enhanced services in AI, cloud computing, and data analytics. Together, we aim to accelerate digital transformation across industries.",
    contentMs: "Kami telah membentuk perkongsian strategik dengan firma teknologi global terkemuka untuk membawa penyelesaian digital canggih kepada pelanggan kami.",
    date: "2025-11-10",
    images: [],
    category: "Partnership",
    status: "published",
  },
]

const defaultAnnouncements: Announcement[] = [
  { id: "1", title: "Registration for Rubber Replanting Subsidy 2026 Now Open", titleMs: "Pendaftaran Subsidi Tanam Semula Getah 2026 Kini Dibuka", summary: "Smallholders are invited to apply for the rubber replanting subsidy programme. Applications close on 30 April 2026.", summaryMs: "Pekebun kecil dijemput untuk memohon program subsidi tanam semula getah. Permohonan ditutup pada 30 April 2026.", date: "2026-02-01", pinned: true, active: true, category: "Subsidy" },
  { id: "2", title: "Office Closure During Hari Raya Aidilfitri", titleMs: "Penutupan Pejabat Sempena Hari Raya Aidilfitri", summary: "Our offices will be closed from 29 March to 2 April 2026. Online services remain available.", summaryMs: "Pejabat kami akan ditutup dari 29 Mac hingga 2 April 2026. Perkhidmatan dalam talian kekal tersedia.", date: "2026-01-28", pinned: false, active: true, category: "Notice" },
  { id: "3", title: "New Rubber Pricing Mechanism Effective March 2026", titleMs: "Mekanisme Harga Getah Baharu Berkuat Kuasa Mac 2026", summary: "A revised pricing structure for natural rubber will take effect starting 1 March 2026 to better reflect market conditions.", summaryMs: "Struktur harga semakan untuk getah asli akan berkuat kuasa mulai 1 Mac 2026 bagi mencerminkan keadaan pasaran dengan lebih baik.", date: "2026-01-20", pinned: false, active: true, category: "Policy" },
  { id: "4", title: "Workshop: Modern Tapping Techniques for Higher Yield", titleMs: "Bengkel: Teknik Menoreh Moden untuk Hasil Lebih Tinggi", summary: "A free training workshop will be held on 15 March 2026 at RISDA Training Centre, Sungai Buloh.", summaryMs: "Bengkel latihan percuma akan diadakan pada 15 Mac 2026 di Pusat Latihan RISDA, Sungai Buloh.", date: "2026-01-15", pinned: false, active: true, category: "Training" },
]

const defaultTenders: Tender[] = [
  { id: "1", title: "Supply and Delivery of Rubber Seedlings for Replanting Programme", titleMs: "Pembekalan dan Penghantaran Benih Getah untuk Program Tanam Semula", openingDate: "2026-02-01", closingDate: "2026-03-15", pdfUrl: "", status: "open" },
  { id: "2", title: "Construction of Rubber Processing Facility in Johor", titleMs: "Pembinaan Fasiliti Pemprosesan Getah di Johor", openingDate: "2026-02-15", closingDate: "2026-03-30", pdfUrl: "", status: "open" },
  { id: "3", title: "IT Infrastructure Upgrade and Cloud Migration Services", titleMs: "Perkhidmatan Naik Taraf Infrastruktur IT dan Migrasi Awan", openingDate: "2026-03-01", closingDate: "2026-04-10", pdfUrl: "", status: "open" },
  { id: "4", title: "Provision of Security Services for Regional Offices", titleMs: "Peruntukan Perkhidmatan Keselamatan untuk Pejabat Wilayah", openingDate: "2025-11-01", closingDate: "2025-12-31", pdfUrl: "", status: "closed" },
  { id: "5", title: "Laboratory Equipment for Rubber Quality Testing", titleMs: "Peralatan Makmal untuk Ujian Kualiti Getah", openingDate: "2025-10-01", closingDate: "2025-11-30", pdfUrl: "", status: "closed" },
]

const defaultLanding: LandingContent = {
  heroTitle: "Building the Future Together",
  heroTitleMs: "Membina Masa Depan Bersama",
  heroSubtitle: "Driving sustainable growth for the rubber industry in Sabah.",
  heroSubtitleMs: "Memacu pembangunan industri getah Sabah ke arah kemapanan dan kemakmuran.",
  highlights: [
    { id: "1", title: "Expert Team", titleMs: "Pasukan Pakar", description: "Our team of seasoned professionals brings decades of combined experience to deliver exceptional results.", descriptionMs: "Pasukan profesional berpengalaman kami membawa pengalaman gabungan berdekad untuk menyampaikan hasil yang luar biasa.", icon: "users" },
    { id: "2", title: "Innovative Solutions", titleMs: "Penyelesaian Inovatif", description: "We leverage cutting-edge technology to create solutions that are both practical and forward-thinking.", descriptionMs: "Kami memanfaatkan teknologi canggih untuk mencipta penyelesaian yang praktikal dan berpandangan jauh.", icon: "lightbulb" },
    { id: "3", title: "Proven Results", titleMs: "Hasil Terbukti", description: "With a track record of successful projects, we consistently exceed our clients' expectations.", descriptionMs: "Dengan rekod projek yang berjaya, kami secara konsisten melampaui jangkaan pelanggan kami.", icon: "chart" },
  ],
}

// --- Context type ---

interface DataStoreContextType {
  // Read (used by public pages + admin)
  banners: BannerSlide[]
  stats: StatItem[]
  news: NewsArticle[]
  announcements: Announcement[]
  tenders: Tender[]
  achievements: Achievement[]
  landing: LandingContent
  isLoading: boolean

  // Banners — batch save
  saveBanners: (banners: BannerSlide[]) => Promise<void>

  // Stats — batch save
  saveStats: (stats: StatItem[]) => Promise<void>

  // News — individual CRUD
  createNews: (data: Omit<NewsArticle, "id">) => Promise<void>
  updateNews: (id: string, data: Partial<NewsArticle>) => Promise<void>
  deleteNews: (id: string) => Promise<void>

  // Announcements — individual CRUD
  createAnnouncement: (data: Omit<Announcement, "id">) => Promise<void>
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>
  deleteAnnouncement: (id: string) => Promise<void>

  // Tenders — individual CRUD
  createTender: (data: Omit<Tender, "id">) => Promise<void>
  updateTender: (id: string, data: Partial<Tender>) => Promise<void>
  deleteTender: (id: string) => Promise<void>

  // Achievements — individual CRUD
  createAchievement: (data: Omit<Achievement, "id">) => Promise<void>
  updateAchievement: (id: string, data: Partial<Achievement>) => Promise<void>
  deleteAchievement: (id: string) => Promise<void>

  // Landing — batch save
  saveLanding: (landing: LandingContent) => Promise<void>

  // Legacy setters (local-only state updates, kept for backward compatibility)
  setBanners: (banners: BannerSlide[]) => void
  setStats: (stats: StatItem[]) => void
  setNews: (news: NewsArticle[]) => void
  setAnnouncements: (announcements: Announcement[]) => void
  setTenders: (tenders: Tender[]) => void
  setLanding: (landing: LandingContent) => void
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

function mergeWithDefaults(initial: InitialData | undefined) {
  return {
    banners: initial?.banners?.length ? initial.banners : defaultBanners,
    stats: initial?.stats?.length ? initial.stats : defaultStats,
    news: initial?.news?.length ? initial.news : defaultNews,
    announcements: initial?.announcements ?? defaultAnnouncements,
    tenders: initial?.tenders ?? defaultTenders,
    achievements: initial?.achievements ?? [],
    landing: initial?.landing ?? defaultLanding,
  }
}

export function DataStoreProvider({
  children,
  initialData,
}: {
  children: ReactNode
  initialData?: InitialData
}) {
  const router = useRouter()
  const merged = mergeWithDefaults(initialData)
  const [banners, setBanners] = useState<BannerSlide[]>(merged.banners)
  const [stats, setStats] = useState<StatItem[]>(merged.stats)
  const [news, setNews] = useState<NewsArticle[]>(merged.news)
  const [announcements, setAnnouncements] = useState<Announcement[]>(merged.announcements)
  const [tenders, setTenders] = useState<Tender[]>(merged.tenders)
  const [achievements, setAchievements] = useState<Achievement[]>(merged.achievements)
  const [landing, setLanding] = useState<LandingContent>(merged.landing)
  const [isLoading, setIsLoading] = useState(!initialData)

  useEffect(() => {
    async function loadAll() {
      const results = await Promise.allSettled([
        api.getBanners(),
        api.getStats(),
        api.getNews(),
        api.getAnnouncements(),
        api.getTenders(),
        api.getAchievements(),
        api.getLanding(),
      ])
      const [b, s, n, a, td, ac, l] = results.map((r, i) => {
        if (r.status === "fulfilled") return r.value
        console.error(`Failed to fetch CMS slice [${i}]:`, r.reason)
        return undefined
      }) as [
        BannerSlide[] | undefined,
        StatItem[] | undefined,
        NewsArticle[] | undefined,
        Announcement[] | undefined,
        Tender[] | undefined,
        Achievement[] | undefined,
        LandingContent | null | undefined,
      ]
      if (Array.isArray(b) && b.length > 0) setBanners(b)
      else if (b !== undefined) setBanners(defaultBanners)
      if (Array.isArray(s) && s.length > 0) setStats(s)
      else if (s !== undefined) setStats(defaultStats)
      if (Array.isArray(n)) setNews(n)
      else if (n !== undefined) setNews(defaultNews)
      if (Array.isArray(a)) setAnnouncements(a)
      if (Array.isArray(td)) setTenders(td)
      if (Array.isArray(ac)) setAchievements(ac)
      if (l && typeof l === "object") setLanding(l)
      setIsLoading(false)
    }
    loadAll()
  }, [])

  // --- Banners (batch save) ---
  const saveBanners = useCallback(async (newBanners: BannerSlide[]) => {
    const saved = await api.saveBanners(newBanners)
    setBanners(saved)
    router.refresh()
  }, [router])

  // --- Stats (batch save) ---
  const saveStats = useCallback(async (newStats: StatItem[]) => {
    const saved = await api.saveStats(newStats)
    setStats(saved)
  }, [])

  // --- News CRUD ---
  const createNewsArticle = useCallback(async (data: Omit<NewsArticle, "id">) => {
    const created = await api.createNews(data)
    setNews((prev) => [created, ...prev])
  }, [])

  const updateNewsArticle = useCallback(async (id: string, data: Partial<NewsArticle>) => {
    const updated = await api.updateNews(id, data)
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)))
  }, [])

  const deleteNewsArticle = useCallback(async (id: string) => {
    await api.deleteNews(id)
    setNews((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // --- Announcements CRUD ---
  const createAnnouncementFn = useCallback(async (data: Omit<Announcement, "id">) => {
    const created = await api.createAnnouncement(data)
    setAnnouncements((prev) => [created, ...prev])
  }, [])

  const updateAnnouncementFn = useCallback(async (id: string, data: Partial<Announcement>) => {
    const updated = await api.updateAnnouncement(id, data)
    setAnnouncements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)))
  }, [])

  const deleteAnnouncementFn = useCallback(async (id: string) => {
    await api.deleteAnnouncement(id)
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // --- Tenders CRUD ---
  const createTenderFn = useCallback(async (data: Omit<Tender, "id">) => {
    const created = await api.createTender(data)
    setTenders((prev) => [created, ...prev])
  }, [])

  const updateTenderFn = useCallback(async (id: string, data: Partial<Tender>) => {
    const updated = await api.updateTender(id, data)
    setTenders((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)))
  }, [])

  const deleteTenderFn = useCallback(async (id: string) => {
    await api.deleteTender(id)
    setTenders((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // --- Achievements CRUD ---
  const createAchievementFn = useCallback(async (data: Omit<Achievement, "id">) => {
    const created = await api.createAchievement(data)
    setAchievements((prev) => [created, ...prev])
  }, [])

  const updateAchievementFn = useCallback(async (id: string, data: Partial<Achievement>) => {
    const updated = await api.updateAchievement(id, data)
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)))
  }, [])

  const deleteAchievementFn = useCallback(async (id: string) => {
    await api.deleteAchievement(id)
    setAchievements((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // --- Landing (batch save) ---
  const saveLandingFn = useCallback(async (newLanding: LandingContent) => {
    const saved = await api.saveLanding(newLanding)
    setLanding(saved)
  }, [])

  return (
    <DataStoreContext.Provider
      value={{
        banners, stats, news, announcements, tenders, achievements, landing, isLoading,
        saveBanners, saveStats,
        createNews: createNewsArticle, updateNews: updateNewsArticle, deleteNews: deleteNewsArticle,
        createAnnouncement: createAnnouncementFn, updateAnnouncement: updateAnnouncementFn, deleteAnnouncement: deleteAnnouncementFn,
        createTender: createTenderFn, updateTender: updateTenderFn, deleteTender: deleteTenderFn,
        createAchievement: createAchievementFn, updateAchievement: updateAchievementFn, deleteAchievement: deleteAchievementFn,
        saveLanding: saveLandingFn,
        setBanners, setStats, setNews, setAnnouncements, setTenders, setLanding,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export function useDataStore() {
  const context = useContext(DataStoreContext)
  if (!context) {
    throw new Error("useDataStore must be used within a DataStoreProvider")
  }
  return context
}
