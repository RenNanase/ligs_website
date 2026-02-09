"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "ms"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation - Utility Bar
  "nav.faq": { en: "FAQ", ms: "Soalan Lazim" },
  "nav.contact": { en: "Contact Us", ms: "Hubungi Kami" },
  "nav.sitemap": { en: "Sitemap", ms: "Peta Laman" },

  // Navigation - Main Nav
  "nav.home": { en: "Home", ms: "Utama" },
  "nav.corpinfo": { en: "Corporate Info", ms: "Info Korporat" },
  "nav.corpinfo.about": { en: "About Us", ms: "Tentang Kami" },
  "nav.corpinfo.vision": { en: "Vision & Mission", ms: "Visi & Misi" },
  "nav.corpinfo.team": { en: "Leadership Team", ms: "Pasukan Kepimpinan" },
  "nav.corpinfo.services": { en: "Our Services", ms: "Perkhidmatan Kami" },
  "nav.archive": { en: "Archive", ms: "Arkib" },
  "nav.archive.news": { en: "News", ms: "Berita" },
  "nav.archive.gallery": { en: "Gallery", ms: "Galeri" },
  "nav.admin": { en: "Admin", ms: "Admin" },

  // Hero / Carousel
  "hero.title": {
    en: "Building the Future Together",
    ms: "Membina Masa Depan Bersama",
  },
  "hero.subtitle": {
    en: "We deliver innovative solutions that transform businesses and drive sustainable growth across industries.",
    ms: "Kami menyampaikan penyelesaian inovatif yang mengubah perniagaan dan memacu pertumbuhan mampan merentas industri.",
  },
  "hero.cta": { en: "Get Started", ms: "Mulakan" },
  "hero.learn": { en: "Learn More", ms: "Ketahui Lebih" },

  // Statistics
  "stats.title": { en: "Key Statistics", ms: "Statistik Utama" },
  "stats.subtitle": {
    en: "Our impact in numbers",
    ms: "Impak kami dalam angka",
  },
  "stats.pekebun": { en: "Smallholders", ms: "Pekebun Kecil" },
  "stats.penoreh": { en: "Rubber Tappers", ms: "Penoreh Getah" },
  "stats.keluasan": { en: "Rubber Area (Hectares)", ms: "Keluasan Getah (Hektar)" },

  // Activity / News
  "activity.title": { en: "Latest Activities", ms: "Aktiviti Terkini" },
  "activity.subtitle": {
    en: "Stay updated with our latest news and announcements",
    ms: "Kekal dikemas kini dengan berita dan pengumuman terkini kami",
  },
  "activity.seemore": { en: "See More", ms: "Lihat Lagi" },

  // Announcements
  "announcements.title": { en: "Announcements", ms: "Pengumuman" },
  "announcements.subtitle": {
    en: "Important notices and updates",
    ms: "Notis dan kemas kini penting",
  },
  "announcements.pinned": { en: "Pinned", ms: "Disematkan" },
  "announcements.viewall": { en: "View All Announcements", ms: "Lihat Semua Pengumuman" },

  // Tenders
  "tenders.title": { en: "Tenders", ms: "Tender" },
  "tenders.subtitle": {
    en: "Current procurement opportunities",
    ms: "Peluang perolehan semasa",
  },
  "tenders.refno": { en: "Ref No.", ms: "No. Rujukan" },
  "tenders.closing": { en: "Closing Date", ms: "Tarikh Tutup" },
  "tenders.status.open": { en: "Open", ms: "Dibuka" },
  "tenders.status.closed": { en: "Closed", ms: "Ditutup" },
  "tenders.status.awarded": { en: "Awarded", ms: "Dianugerahkan" },
  "tenders.viewall": { en: "View All Tenders", ms: "Lihat Semua Tender" },
  "tenders.details": { en: "View Details", ms: "Lihat Butiran" },

  // Rubber Price
  "rubber.title": { en: "Rubber Price", ms: "Harga Getah" },
  "rubber.subtitle": {
    en: "Daily rubber price updates and market trends",
    ms: "Kemas kini harga getah harian dan trend pasaran",
  },
  "rubber.date": { en: "Date", ms: "Tarikh" },
  "rubber.grade": { en: "Grade/Type", ms: "Gred/Jenis" },
  "rubber.price": { en: "Price (RM/kg)", ms: "Harga (RM/kg)" },
  "rubber.change": { en: "Change", ms: "Perubahan" },
  "rubber.chart.title": { en: "Monthly Rubber Price Statistics", ms: "Statistik Harga Getah Bulanan" },
  "rubber.chart.subtitle": { en: "Daily price trends for the selected month", ms: "Trend harga harian untuk bulan yang dipilih" },
  "rubber.chart.selectMonth": { en: "Select Month", ms: "Pilih Bulan" },
  "rubber.chart.legend": { en: "Daily Price (RM/kg)", ms: "Harga Harian (RM/kg)" },

  // Social Media
  "social.title": { en: "Social Media", ms: "Media Sosial" },
  "social.subtitle": {
    en: "Connect with us on social media for the latest updates and news",
    ms: "Berhubung dengan kami di media sosial untuk kemas kini dan berita terkini",
  },
  "social.follow": { en: "Follow Us", ms: "Ikuti Kami" },

  // Admin
  "admin.manage.announcements": { en: "Manage Announcements", ms: "Urus Pengumuman" },
  "admin.manage.tenders": { en: "Manage Tenders", ms: "Urus Tender" },

  // Highlights
  "highlights.title": { en: "Why Choose Us", ms: "Mengapa Pilih Kami" },
  "highlights.subtitle": {
    en: "We bring expertise, innovation, and dedication to every project.",
    ms: "Kami membawa kepakaran, inovasi, dan dedikasi ke setiap projek.",
  },

  // About
  "about.title": { en: "About Us", ms: "Tentang Kami" },
  "about.subtitle": {
    en: "Our Story & Mission",
    ms: "Kisah & Misi Kami",
  },
  "about.desc": {
    en: "Founded with a vision to transform industries, we have grown from a small team to a leading consultancy. Our mission is to empower organizations through innovation, strategic thinking, and unwavering commitment to excellence.",
    ms: "Ditubuhkan dengan visi untuk mengubah industri, kami telah berkembang dari pasukan kecil kepada firma perundingan terkemuka. Misi kami adalah untuk memperkasakan organisasi melalui inovasi, pemikiran strategik, dan komitmen teguh terhadap kecemerlangan.",
  },
  "about.vision.title": { en: "Our Vision", ms: "Visi Kami" },
  "about.vision.desc": {
    en: "To be the most trusted partner for organizations seeking sustainable growth and meaningful transformation.",
    ms: "Menjadi rakan kongsi paling dipercayai bagi organisasi yang mencari pertumbuhan mampan dan transformasi bermakna.",
  },
  "about.mission.title": { en: "Our Mission", ms: "Misi Kami" },
  "about.mission.desc": {
    en: "To deliver exceptional consulting services that drive real, measurable outcomes for our clients.",
    ms: "Menyampaikan perkhidmatan perundingan luar biasa yang memacu hasil sebenar dan terukur untuk pelanggan kami.",
  },
  "about.values.title": { en: "Our Values", ms: "Nilai Kami" },
  "about.values.desc": {
    en: "Integrity, Innovation, Collaboration, and Excellence guide everything we do.",
    ms: "Integriti, Inovasi, Kerjasama, dan Kecemerlangan membimbing segala yang kami lakukan.",
  },

  // Services
  "services.title": { en: "Our Services", ms: "Perkhidmatan Kami" },
  "services.subtitle": {
    en: "Comprehensive solutions tailored to your needs",
    ms: "Penyelesaian menyeluruh disesuaikan dengan keperluan anda",
  },
  "service.1.title": { en: "Strategic Consulting", ms: "Perundingan Strategik" },
  "service.1.desc": {
    en: "We help organizations define their vision, set clear goals, and develop actionable strategies for growth.",
    ms: "Kami membantu organisasi mentakrifkan visi mereka, menetapkan matlamat yang jelas, dan membangunkan strategi yang boleh dilaksanakan untuk pertumbuhan.",
  },
  "service.2.title": { en: "Digital Transformation", ms: "Transformasi Digital" },
  "service.2.desc": {
    en: "Modernize your operations with our digital transformation services that integrate the latest technologies.",
    ms: "Modenkan operasi anda dengan perkhidmatan transformasi digital kami yang mengintegrasikan teknologi terkini.",
  },
  "service.3.title": { en: "Project Management", ms: "Pengurusan Projek" },
  "service.3.desc": {
    en: "End-to-end project management ensuring timely delivery, budget adherence, and quality outcomes.",
    ms: "Pengurusan projek hujung ke hujung memastikan penyampaian tepat masa, pematuhan bajet, dan hasil berkualiti.",
  },
  "service.4.title": { en: "Training & Development", ms: "Latihan & Pembangunan" },
  "service.4.desc": {
    en: "Invest in your team with tailored training programs that build capabilities and boost performance.",
    ms: "Laburkan dalam pasukan anda dengan program latihan khusus yang membina keupayaan dan meningkatkan prestasi.",
  },

  // Team
  "team.title": { en: "Our Team", ms: "Pasukan Kami" },
  "team.subtitle": {
    en: "Meet the people behind our success",
    ms: "Kenali orang di sebalik kejayaan kami",
  },

  // News
  "news.title": { en: "Latest News", ms: "Berita Terkini" },
  "news.subtitle": {
    en: "Stay updated with our latest announcements and insights",
    ms: "Kekal dikemas kini dengan pengumuman dan pandangan terkini kami",
  },
  "news.readmore": { en: "Read More", ms: "Baca Lagi" },

  // Contact
  "contact.title": { en: "Contact Us", ms: "Hubungi Kami" },
  "contact.subtitle": {
    en: "Get in touch with our team",
    ms: "Hubungi pasukan kami",
  },
  "contact.name": { en: "Full Name", ms: "Nama Penuh" },
  "contact.email": { en: "Email Address", ms: "Alamat Emel" },
  "contact.subject": { en: "Subject", ms: "Subjek" },
  "contact.message": { en: "Message", ms: "Mesej" },
  "contact.send": { en: "Send Message", ms: "Hantar Mesej" },
  "contact.address": { en: "Address", ms: "Alamat" },
  "contact.phone": { en: "Phone", ms: "Telefon" },

  // Footer
  "footer.rights": { en: "All rights reserved.", ms: "Hak cipta terpelihara." },
  "footer.quicklinks": { en: "Quick Links", ms: "Pautan Pantas" },
  "footer.contact": { en: "Contact Info", ms: "Maklumat Hubungan" },

  // CTA
  "cta.title": {
    en: "Ready to Transform Your Business?",
    ms: "Bersedia Mengubah Perniagaan Anda?",
  },
  "cta.subtitle": {
    en: "Let's discuss how we can help you achieve your goals.",
    ms: "Mari bincangkan bagaimana kami boleh membantu anda mencapai matlamat anda.",
  },
  "cta.button": { en: "Get in Touch", ms: "Hubungi Kami" },

  // Admin
  "admin.login": { en: "Admin Login", ms: "Log Masuk Admin" },
  "admin.email": { en: "Email", ms: "Emel" },
  "admin.password": { en: "Password", ms: "Kata Laluan" },
  "admin.signin": { en: "Sign In", ms: "Log Masuk" },
  "admin.dashboard": { en: "Dashboard", ms: "Papan Pemuka" },
  "admin.manage.news": { en: "Manage News", ms: "Urus Berita" },
  "admin.manage.team": { en: "Manage Team", ms: "Urus Pasukan" },
  "admin.manage.landing": { en: "Manage Landing", ms: "Urus Utama" },
  "admin.manage.banners": { en: "Manage Banners", ms: "Urus Sepanduk" },
  "admin.manage.theme": { en: "Theme Settings", ms: "Tetapan Tema" },
  "admin.logout": { en: "Logout", ms: "Log Keluar" },
  "admin.add": { en: "Add New", ms: "Tambah Baru" },
  "admin.edit": { en: "Edit", ms: "Sunting" },
  "admin.delete": { en: "Delete", ms: "Padam" },
  "admin.save": { en: "Save", ms: "Simpan" },
  "admin.cancel": { en: "Cancel", ms: "Batal" },
  "admin.title": { en: "Title", ms: "Tajuk" },
  "admin.content": { en: "Content", ms: "Kandungan" },
  "admin.name": { en: "Name", ms: "Nama" },
  "admin.role": { en: "Role", ms: "Peranan" },
  "admin.bio": { en: "Bio", ms: "Bio" },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return translations[key]?.[language] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
