"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

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
  image: string
  category: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  roleMs: string
  bio: string
  bioMs: string
  image: string
}

export interface Announcement {
  id: string
  title: string
  titleMs: string
  summary: string
  summaryMs: string
  date: string
  pinned: boolean
  category: string
}

export interface Tender {
  id: string
  title: string
  titleMs: string
  referenceNo: string
  closingDate: string
  publishDate: string
  status: "open" | "closed" | "awarded"
  category: string
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

interface DataStoreContextType {
  banners: BannerSlide[]
  setBanners: (banners: BannerSlide[]) => void
  stats: StatItem[]
  setStats: (stats: StatItem[]) => void
  news: NewsArticle[]
  setNews: (news: NewsArticle[]) => void
  team: TeamMember[]
  setTeam: (team: TeamMember[]) => void
  announcements: Announcement[]
  setAnnouncements: (announcements: Announcement[]) => void
  tenders: Tender[]
  setTenders: (tenders: Tender[]) => void
  landing: LandingContent
  setLanding: (landing: LandingContent) => void
}

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
  { id: "1", labelKey: "stats.pekebun", value: 284732, suffix: "" },
  { id: "2", labelKey: "stats.penoreh", value: 198450, suffix: "" },
  { id: "3", labelKey: "stats.keluasan", value: 1068000, suffix: "" },
]

const defaultNews: NewsArticle[] = [
  {
    id: "1",
    title: "Company Expands Operations to Southeast Asia",
    titleMs: "Syarikat Meluaskan Operasi ke Asia Tenggara",
    content:
      "We are thrilled to announce our expansion into Southeast Asia, bringing our innovative solutions to new markets. This strategic move reflects our commitment to serving clients across the region with the same excellence they have come to expect. Our team is already on the ground, establishing partnerships and building the infrastructure needed to deliver world-class services.",
    contentMs:
      "Kami teruja mengumumkan pengembangan kami ke Asia Tenggara, membawa penyelesaian inovatif kami ke pasaran baharu. Langkah strategik ini mencerminkan komitmen kami untuk melayani pelanggan di seluruh rantau ini dengan kecemerlangan yang mereka harapkan.",
    date: "2026-01-15",
    image: "",
    category: "Expansion",
  },
  {
    id: "2",
    title: "Awarded Best Consulting Firm 2025",
    titleMs: "Dianugerahkan Firma Perundingan Terbaik 2025",
    content:
      "We are honored to receive the prestigious Best Consulting Firm award for 2025. This recognition underscores our team's dedication to delivering exceptional results and our commitment to innovation. We want to thank our incredible clients and partners who have been instrumental in this journey. This award motivates us to continue pushing boundaries.",
    contentMs:
      "Kami berbesar hati menerima anugerah berprestij Firma Perundingan Terbaik untuk 2025. Pengiktirafan ini menekankan dedikasi pasukan kami untuk menyampaikan hasil yang luar biasa dan komitmen kami terhadap inovasi.",
    date: "2025-12-20",
    image: "",
    category: "Awards",
  },
  {
    id: "3",
    title: "New Partnership with Global Tech Leaders",
    titleMs: "Perkongsian Baharu dengan Pemimpin Teknologi Global",
    content:
      "We have formed a strategic partnership with leading global technology firms to bring cutting-edge digital solutions to our clients. This collaboration will enable us to offer enhanced services in AI, cloud computing, and data analytics. Together, we aim to accelerate digital transformation across industries.",
    contentMs:
      "Kami telah membentuk perkongsian strategik dengan firma teknologi global terkemuka untuk membawa penyelesaian digital canggih kepada pelanggan kami.",
    date: "2025-11-10",
    image: "",
    category: "Partnership",
  },
]

const defaultTeam: TeamMember[] = [
  {
    id: "1",
    name: "Ahmad Razak",
    role: "Chief Executive Officer",
    roleMs: "Ketua Pegawai Eksekutif",
    bio: "Ahmad brings over 20 years of experience in strategic management and corporate leadership. Under his guidance, the company has achieved remarkable growth and industry recognition.",
    bioMs: "Ahmad membawa lebih 20 tahun pengalaman dalam pengurusan strategik dan kepimpinan korporat.",
    image: "",
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "Chief Operations Officer",
    roleMs: "Ketua Pegawai Operasi",
    bio: "Sarah oversees all operational aspects of the company, ensuring efficiency and excellence in every project we undertake. Her analytical approach drives continuous improvement.",
    bioMs: "Sarah menyelia semua aspek operasi syarikat, memastikan kecekapan dan kecemerlangan dalam setiap projek.",
    image: "",
  },
  {
    id: "3",
    name: "Mohd Hafiz",
    role: "Head of Digital Solutions",
    roleMs: "Ketua Penyelesaian Digital",
    bio: "Hafiz leads our digital transformation practice with expertise in AI, cloud computing, and data analytics. He has helped numerous organizations modernize their operations.",
    bioMs: "Hafiz menerajui amalan transformasi digital kami dengan kepakaran dalam AI, pengkomputeran awan, dan analitik data.",
    image: "",
  },
  {
    id: "4",
    name: "Nurul Aisyah",
    role: "Director of Client Relations",
    roleMs: "Pengarah Hubungan Pelanggan",
    bio: "Nurul ensures our clients receive personalized attention and world-class service. Her commitment to building lasting relationships has been key to our client retention.",
    bioMs: "Nurul memastikan pelanggan kami menerima perhatian peribadi dan perkhidmatan bertaraf dunia.",
    image: "",
  },
]

const defaultAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Registration for Rubber Replanting Subsidy 2026 Now Open",
    titleMs: "Pendaftaran Subsidi Tanam Semula Getah 2026 Kini Dibuka",
    summary:
      "Smallholders are invited to apply for the rubber replanting subsidy programme. Applications close on 30 April 2026.",
    summaryMs:
      "Pekebun kecil dijemput untuk memohon program subsidi tanam semula getah. Permohonan ditutup pada 30 April 2026.",
    date: "2026-02-01",
    pinned: true,
    category: "Subsidy",
  },
  {
    id: "2",
    title: "Office Closure During Hari Raya Aidilfitri",
    titleMs: "Penutupan Pejabat Sempena Hari Raya Aidilfitri",
    summary:
      "Our offices will be closed from 29 March to 2 April 2026. Online services remain available.",
    summaryMs:
      "Pejabat kami akan ditutup dari 29 Mac hingga 2 April 2026. Perkhidmatan dalam talian kekal tersedia.",
    date: "2026-01-28",
    pinned: false,
    category: "Notice",
  },
  {
    id: "3",
    title: "New Rubber Pricing Mechanism Effective March 2026",
    titleMs: "Mekanisme Harga Getah Baharu Berkuat Kuasa Mac 2026",
    summary:
      "A revised pricing structure for natural rubber will take effect starting 1 March 2026 to better reflect market conditions.",
    summaryMs:
      "Struktur harga semakan untuk getah asli akan berkuat kuasa mulai 1 Mac 2026 bagi mencerminkan keadaan pasaran dengan lebih baik.",
    date: "2026-01-20",
    pinned: false,
    category: "Policy",
  },
  {
    id: "4",
    title: "Workshop: Modern Tapping Techniques for Higher Yield",
    titleMs: "Bengkel: Teknik Menoreh Moden untuk Hasil Lebih Tinggi",
    summary:
      "A free training workshop will be held on 15 March 2026 at RISDA Training Centre, Sungai Buloh.",
    summaryMs:
      "Bengkel latihan percuma akan diadakan pada 15 Mac 2026 di Pusat Latihan RISDA, Sungai Buloh.",
    date: "2026-01-15",
    pinned: false,
    category: "Training",
  },
]

const defaultTenders: Tender[] = [
  {
    id: "1",
    title: "Supply and Delivery of Rubber Seedlings for Replanting Programme",
    titleMs: "Pembekalan dan Penghantaran Benih Getah untuk Program Tanam Semula",
    referenceNo: "TEND/2026/001",
    closingDate: "2026-03-15",
    publishDate: "2026-02-01",
    status: "open",
    category: "Supply",
  },
  {
    id: "2",
    title: "Construction of Rubber Processing Facility in Johor",
    titleMs: "Pembinaan Fasiliti Pemprosesan Getah di Johor",
    referenceNo: "TEND/2026/002",
    closingDate: "2026-03-30",
    publishDate: "2026-01-25",
    status: "open",
    category: "Construction",
  },
  {
    id: "3",
    title: "IT Infrastructure Upgrade and Cloud Migration Services",
    titleMs: "Perkhidmatan Naik Taraf Infrastruktur IT dan Migrasi Awan",
    referenceNo: "TEND/2026/003",
    closingDate: "2026-04-10",
    publishDate: "2026-01-20",
    status: "open",
    category: "IT Services",
  },
  {
    id: "4",
    title: "Provision of Security Services for Regional Offices",
    titleMs: "Peruntukan Perkhidmatan Keselamatan untuk Pejabat Wilayah",
    referenceNo: "TEND/2025/048",
    closingDate: "2025-12-31",
    publishDate: "2025-11-15",
    status: "closed",
    category: "Services",
  },
  {
    id: "5",
    title: "Laboratory Equipment for Rubber Quality Testing",
    titleMs: "Peralatan Makmal untuk Ujian Kualiti Getah",
    referenceNo: "TEND/2025/045",
    closingDate: "2025-11-30",
    publishDate: "2025-10-20",
    status: "awarded",
    category: "Equipment",
  },
]

const defaultLanding: LandingContent = {
  heroTitle: "Building the Future Together",
  heroTitleMs: "Membina Masa Depan Bersama",
  heroSubtitle:
    "We deliver innovative solutions that transform businesses and drive sustainable growth across industries.",
  heroSubtitleMs:
    "Kami menyampaikan penyelesaian inovatif yang mengubah perniagaan dan memacu pertumbuhan mampan merentas industri.",
  highlights: [
    {
      id: "1",
      title: "Expert Team",
      titleMs: "Pasukan Pakar",
      description:
        "Our team of seasoned professionals brings decades of combined experience to deliver exceptional results.",
      descriptionMs:
        "Pasukan profesional berpengalaman kami membawa pengalaman gabungan berdekad untuk menyampaikan hasil yang luar biasa.",
      icon: "users",
    },
    {
      id: "2",
      title: "Innovative Solutions",
      titleMs: "Penyelesaian Inovatif",
      description:
        "We leverage cutting-edge technology to create solutions that are both practical and forward-thinking.",
      descriptionMs:
        "Kami memanfaatkan teknologi canggih untuk mencipta penyelesaian yang praktikal dan berpandangan jauh.",
      icon: "lightbulb",
    },
    {
      id: "3",
      title: "Proven Results",
      titleMs: "Hasil Terbukti",
      description:
        "With a track record of successful projects, we consistently exceed our clients' expectations.",
      descriptionMs:
        "Dengan rekod projek yang berjaya, kami secara konsisten melampaui jangkaan pelanggan kami.",
      icon: "chart",
    },
  ],
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined)

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [banners, setBanners] = useState<BannerSlide[]>(defaultBanners)
  const [stats, setStats] = useState<StatItem[]>(defaultStats)
  const [news, setNews] = useState<NewsArticle[]>(defaultNews)
  const [team, setTeam] = useState<TeamMember[]>(defaultTeam)
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements)
  const [tenders, setTenders] = useState<Tender[]>(defaultTenders)
  const [landing, setLanding] = useState<LandingContent>(defaultLanding)

  return (
    <DataStoreContext.Provider
      value={{
        banners, setBanners,
        stats, setStats,
        news, setNews,
        team, setTeam,
        announcements, setAnnouncements,
        tenders, setTenders,
        landing, setLanding,
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
