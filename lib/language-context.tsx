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
  "faq.subtitle": { en: "Common questions about LIGS and our services.", ms: "Soalan umum mengenai LIGS dan perkhidmatan kami." },
  "faq.q1": {
    en: "What is Lembaga Industri Getah Sabah (LIGS)?",
    ms: "Apakah Lembaga Industri Getah Sabah (LIGS)?",
  },
  "faq.a1": {
    en: "LIGS is a state agency under the Sabah State Government responsible for the development and regulation of the rubber industry in Sabah. We support smallholders, facilitate rubber purchasing and processing, and promote sustainable practices in the sector.",
    ms: "LIGS ialah agensi kerajaan negeri di bawah Kerajaan Negeri Sabah yang bertanggungjawab terhadap pembangunan dan pengawalseliaan industri getah di Sabah. Kami menyokong pekebun kecil, memudahkan pembelian dan pemprosesan getah, serta mempromosikan amalan mampan dalam sektor ini.",
  },
  "faq.q2": {
    en: "How can I register as a rubber smallholder?",
    ms: "Bagaimana saya boleh mendaftar sebagai pekebun kecil getah?",
  },
  "faq.a2": {
    en: "You can register by visiting our regional offices or by completing the smallholder registration form available on our website. Bring along your identification documents and land ownership proof. Our staff will assist you through the process.",
    ms: "Anda boleh mendaftar dengan melawat pejabat wilayah kami atau mengisi borang pendaftaran pekebun kecil yang tersedia di laman web kami. Bawa dokumen pengenalan dan bukti pemilikan tanah. Kakitangan kami akan membantu anda melalui proses tersebut.",
  },
  "faq.q3": {
    en: "Where can I sell my rubber produce?",
    ms: "Di mana saya boleh menjual hasil getah saya?",
  },
  "faq.a3": {
    en: "LIGS operates rubber purchasing centres and works with approved dealers. You can sell your latex, cup lump, or rubber sheets at our centres or through our network of purchasing points. Contact your nearest LIGS office for locations and operating hours.",
    ms: "LIGS mengendalikan pusat pembelian getah dan bekerjasama dengan peniaga yang diluluskan. Anda boleh menjual lateks, cup lump, atau kepingan getah di pusat kami atau melalui rangkaian titik pembelian kami. Hubungi pejabat LIGS terdekat untuk lokasi dan waktu operasi.",
  },
  "faq.q4": {
    en: "What subsidies or assistance programmes does LIGS offer?",
    ms: "Apakah subsidi atau program bantuan yang ditawarkan oleh LIGS?",
  },
  "faq.a4": {
    en: "LIGS administers various programmes including replanting subsidies, monsoon season aid, and training for smallholders. Eligibility and application procedures are published in our announcements. Check the Pengumuman section regularly for updates.",
    ms: "LIGS mengurus pelbagai program termasuk subsidi tanam semula, bantuan musim tengkujuh, dan latihan untuk pekebun kecil. Kelayakan dan prosedur permohonan disiarkan dalam pengumuman kami. Semak bahagian Pengumuman secara berkala untuk kemas kini.",
  },
  "faq.q5": {
    en: "How can I get the latest rubber prices?",
    ms: "Bagaimana saya boleh mendapat harga getah terkini?",
  },
  "faq.a5": {
    en: "Daily and monthly rubber prices are published on our homepage. We also provide historical data for reference. Prices are sourced from authorised channels and updated regularly.",
    ms: "Harga getah harian dan bulanan disiarkan di halaman utama kami. Kami juga menyediakan data sejarah untuk rujukan. Harga diperoleh daripada saluran yang diiktiraf dan dikemas kini secara berkala.",
  },
  "faq.q6": {
    en: "How do I contact LIGS for enquiries?",
    ms: "Bagaimana saya boleh menghubungi LIGS untuk pertanyaan?",
  },
  "faq.a6": {
    en: "You can reach us by phone at 088-212311, 210531 or 210472, by fax at 088-234940 or 268586, or by email at gm.getah@sabah.gov.my. Visit our Contact page for our full address and office details.",
    ms: "Anda boleh menghubungi kami melalui telefon 088-212311, 210531 atau 210472, melalui faks 088-234940 atau 268586, atau melalui e-mel gm.getah@sabah.gov.my. Lawati halaman Hubungi Kami untuk alamat penuh dan butiran pejabat kami.",
  },
  "nav.contact": { en: "Contact Us", ms: "Hubungi Kami" },
  "nav.sitemap": { en: "Sitemap", ms: "Peta Laman" },
  "sitemap.title": { en: "Sitemap", ms: "Peta Laman" },
  "sitemap.subtitle": {
    en: "Browse all pages and find what you need quickly.",
    ms: "Semak semua halaman dan cari apa yang anda perlukan.",
  },
  "sitemap.searchPlaceholder": {
    en: "Search pages by keyword...",
    ms: "Cari halaman mengikut kata kunci...",
  },
  "sitemap.noResults": {
    en: "No pages match your search.",
    ms: "Tiada halaman sepadan dengan carian anda.",
  },
  "sitemap.home": { en: "Home", ms: "Utama" },
  "sitemap.utility": { en: "Quick Access", ms: "Pautan Pantas" },

  // Navigation - Main Nav
  "nav.home": { en: "Home", ms: "Utama" },
  "nav.corpinfo": { en: "Corporate Info", ms: "Info Korporat" },
  "nav.corpinfo.about": { en: "About Us", ms: "Tentang Kami" },
  "nav.corpinfo.vision": { en: "Vision & Mission", ms: "Visi & Misi" },
  "nav.corpinfo.services": { en: "Our Services", ms: "Perkhidmatan Kami" },
  "nav.corpinfo.cartaOrganisasi": { en: "LIGS Organisation Chart", ms: "Carta Organisasi LIGS" },
  "nav.corpinfo.ahliLembaga": { en: "Board of Directors", ms: "Ahli Lembaga Pengarah" },
  "nav.corpinfo.bahagianPengurusBesar": { en: "General Manager Division", ms: "Bahagian Pengurus Besar" },
  "nav.corpinfo.bahagianPentadbiran": { en: "Administration Division", ms: "Bahagian Pentadbiran" },
  "nav.corpinfo.bahagianKemajuanPekebunKecil": { en: "Smallholder Development Division", ms: "Bahagian Kemajuan Pekebun Kecil" },
  "nav.corpinfo.bahagianKewangan": { en: "Finance Division", ms: "Bahagian Kewangan" },
  "nav.corpinfo.bahagianSkimPenempatanGetah": { en: "Rubber Settlement Scheme Division", ms: "Bahagian Skim Penempatan Getah" },
  "nav.corpinfo.bahagianPembelianGetah": { en: "Rubber Purchasing Division", ms: "Bahagian Pembelian Getah" },
  "nav.corpinfo.bahagianPemprosesanPemasaran": { en: "Processing & Marketing Division", ms: "Bahagian Pemprosesan dan Pemasaran" },
  "nav.corpinfo.direktori": { en: "Directory", ms: "Direktori" },
  "nav.corpinfo.laguLigs": { en: "LIGS Song", ms: "Lagu LIGS" },
  "common.comingSoon": { en: "Coming soon", ms: "Tidak lama lagi" },
  "common.viewImage": { en: "View image", ms: "Lihat imej" },
  "nav.perkhidmatan": { en: "Services", ms: "Perkhidmatan" },
  "nav.pekebun": { en: "Smallholders", ms: "Pekebun Kecil" },
  "nav.pekebun.page": { en: "Smallholders", ms: "Pekebun Kecil" },
  "nav.pekebun.semakanBantuan": { en: "Monsoon Aid Verification 2025", ms: "Semakan Bantuan Musim Tengkujuh 2025" },
  "nav.pekebun.borangPendaftaran": { en: "Smallholder Registration Form", ms: "Borang Pendaftaran Pekebun Kecil" },
  "nav.pekebun.penyataPenjualan": { en: "Rubber Sales Statement", ms: "Penyata Penjualan Getah" },
  "nav.pencapaian": { en: "Achievements", ms: "Pencapaian" },
  "nav.integriti": { en: "Integrity Corner", ms: "Sudut Integriti" },
  "integriti.subtitle": {
    en: "Promoting integrity, transparency and accountability in LIGS.",
    ms: "Mempromosikan integriti, ketelusan dan akauntabiliti dalam LIGS.",
  },
  "integriti.intro": {
    en: "LIGS is committed to upholding the highest standards of integrity in all our operations. This corner provides resources, policies and information related to governance and anti-corruption.",
    ms: "LIGS komited dalam menegakkan standard integriti yang tertinggi dalam semua operasi kami. Sudut ini menyediakan sumber, polisi dan maklumat berkaitan tadbir urus dan anti-rasuah.",
  },
  "integriti.hebahan": { en: "Hebahan Integriti", ms: "Hebahan Integriti" },
  "tentangKami.title": { en: "About Us", ms: "Tentang Kami" },
  "tentangKami.subtitle": {
    en: "Lembaga Industri Getah Sabah (LIGS)",
    ms: "Lembaga Industri Getah Sabah (LIGS)",
  },
  "tentangKami.imageAlt": {
    en: "Wisma Pertanian Sabah",
    ms: "Wisma Pertanian Sabah",
  },
  "tentangKami.para1": {
    en: "Lembaga Industri Getah Sabah (LIGS) is a State Government Agency under the Ministry of Agriculture and Food Industry of Sabah. LIGS has played an important role in advancing the smallholder rubber industry sector in Sabah since its establishment in 1950 through the Rubber Fund Board Enactment 1950 (Amendment No. 25 of 1981), which was later amended to the Rubber Industry Board (Amendment) Enactment 2013.",
    ms: "Lembaga Industri Getah Sabah (LIGS) adalah sebuah Agensi Kerajaan Negeri di bawah Kementerian Pertanian dan Industri Makanan Sabah. LIGS telah memainkan peranan penting di dalam memajukan sektor industri getah pekebun kecil di negeri Sabah sejak ditubuhkan pada tahun 1950 melalui Enakmen Lembaga Tabung Getah 1950 (Pindaan No. 25 Tahun 1981), yang kemudiannya dipinda kepada Enakmen Lembaga Industri Getah (Pindaan) 2013.",
  },
"tentangKami.para2": {
en: "LIGS is headed by a Chairman, six (6) Deputy Chairmen, five (5) Members of the Board of Directors, three (3) ex-officio Members, and a General Manager. The General Manager serves as the Chief Executive of the organisation and is supported by six (6) Deputy General Managers (DGMs), namely the Deputy General Manager of Administration, Deputy General Manager of Smallholder Development, Deputy General Manager of Rubber Settlement Scheme, Deputy General Manager of Finance, Deputy General Manager of Processing and Marketing, and Deputy General Manager of Rubber Purchasing.",
ms: "LIGS diketuai oleh seorang Pengerusi, Enam (5) Timbalan Pengerusi, Lima (5) orang Ahli Lembaga Pengarah, tiga (3) orang Ahli ex-officio dan seorang Pengurus Besar. Ketua Eksekutif Kumpulan Pengurusan adalah Pengurus Besar, yang dibantu oleh enam (6) orang Timbalan Pengurus Besar (TPB) iaitu TPB Pentadbiran, TPB Kemajuan Pekebun Kecil, TPB Skim Penempatan Getah, TPB Kewangan, TPB Pemprosesan dan Pemasaran dan TPB Pembelian Getah.",
},
  "perkhidmatan.homeTitle": { en: "Online Services", ms: "Perkhidmatan Atas Talian" },
  "perkhidmatan.subtitle": {
    en: "Online services and resources for staff, smallholders and the public.",
    ms: "Perkhidmatan dalam talian untuk kakitangan, pekebun kecil dan orang awam.",
  },
  "perkhidmatan.intro": {
    en: "Access our range of services including applications, forms and information for smallholders, the public and staff.",
    ms: "Akses pelbagai perkhidmatan kami termasuk permohonan, borang dan maklumat untuk pekebun kecil, orang awam dan kakitangan.",
  },
  "perkhidmatan.section.kakitangan": { en: "Staff", ms: "Kakitangan" },
  "perkhidmatan.section.pekebun": { en: "Smallholders", ms: "Pekebun Kecil" },
  "perkhidmatan.section.orang_awam": { en: "Public", ms: "Orang Awam" },
  "nav.dashboard": { en: "Dashboard", ms: "Dashboard" },
  "nav.media": { en: "Media", ms: "Media" },
  "nav.media.news": { en: "News", ms: "Berita" },
  "nav.media.announcements": { en: "Announcements", ms: "Pengumuman" },
  "nav.media.gallery": { en: "Gallery", ms: "Galeri" },
  "nav.media.arkib": { en: "Archive", ms: "Arkib" },
  "nav.media.penerbitan": { en: "Publications", ms: "Penerbitan" },
  "nav.admin": { en: "Admin", ms: "Admin" },
  "nav.kakitangan": { en: "Staff", ms: "Kakitangan" },
  "nav.kakitangan.ePekeliling": { en: "e-Circulars", ms: "e-Pekeliling" },
  "nav.kakitangan.pautan": { en: "Staff Links", ms: "Pautan Kakitangan" },
  "nav.kelabSukan": { en: "Sports Club", ms: "Kelab Sukan" },
  "nav.orangAwam": { en: "Public", ms: "Orang Awam" },
  "nav.orangAwam.direktoriDaerah": {
    en: "LIGS District Offices Directory",
    ms: "Direktori Pejabat LIGS Di Daerah",
  },
  "nav.orangAwam.direktori": { en: "Directory", ms: "Direktori" },
  "nav.orangAwam.tender": { en: "Tenders", ms: "Tender" },
  "nav.orangAwam.jawatanKosong": { en: "Job Vacancies", ms: "Jawatan Kosong" },
  "nav.orangAwam.kalender": { en: "Calendar", ms: "Kalender" },

  // Calendar (Kalender)
  "calendar.title": { en: "Calendar", ms: "Kalender" },
  "calendar.subtitle": { en: "Upcoming events and activities", ms: "Acara dan aktiviti akan datang" },
  "calendar.empty": { en: "No events this month.", ms: "Tiada acara bulan ini." },
  "calendar.today": { en: "Today", ms: "Hari Ini" },
  "calendar.addToCalendar": { en: "Add to Calendar", ms: "Tambah ke Kalender" },
  "calendar.upcoming": { en: "Upcoming Events", ms: "Acara Akan Datang" },
  "calendar.filterByTag": { en: "Filter by type", ms: "Tapis mengikut jenis" },
  "calendar.legend": { en: "Event types", ms: "Jenis acara" },
  "calendar.tag.Program": { en: "Program", ms: "Program" },
  "calendar.tag.Majlis": { en: "Majlis", ms: "Majlis" },
  "calendar.tag.Mesyuarat": { en: "Meeting", ms: "Mesyuarat" },
  "calendar.tag.Public Holiday": { en: "Public Holiday", ms: "Cuti Awam" },
  "calendar.tag.Lain-lain": { en: "Other", ms: "Lain-lain" },

  // Jawatan Kosong (Job Vacancies)
  "jawatanKosong.subtitle": {
    en: "Current job vacancies at LIGS",
    ms: "Jawatan kosong terkini di LIGS",
  },
  "jawatanKosong.empty": {
    en: "No vacancies at the moment. Please check back later.",
    ms: "Tiada jawatan kosong buat masa ini. Sila semak semula kemudian.",
  },
  "jawatanKosong.bil": { en: "No.", ms: "Bil." },
  "jawatanKosong.jawatan": { en: "Position", ms: "Jawatan" },
  "jawatanKosong.taraf": { en: "Type", ms: "Taraf" },
  "jawatanKosong.taraf.kontrak": { en: "Contract", ms: "Kontrak" },
  "jawatanKosong.taraf.tetap": { en: "Permanent", ms: "Tetap" },
  "jawatanKosong.kekosongan": { en: "Vacancies", ms: "Kekosongan" },
  "jawatanKosong.tarikhLuput": { en: "Closing Date", ms: "Tarikh Luput" },
  "jawatanKosong.download": { en: "Download", ms: "Muat Turun" },
  "jawatanKosong.downloadPdf": { en: "Download PDF", ms: "Muat Turun PDF" },

  // AKAL - Borang Anugerah Kecemerlangan Akademik LIGS
  "akal.title": {
    en: "Academic Excellence Award Form (AKAL)",
    ms: "Borang Anugerah Kecemerlangan Akademik LIGS (AKAL)",
  },
  "akal.subtitle": {
    en: "SPM Excellence Award for children of LIGS staff and Sabah small rubber planters",
    ms: "Keputusan Cemerlang SPM kepada anak-anak warga LIGS dan anak-anak pekebun kecil getah Negeri Sabah",
  },

  // Hero / Carousel
  "hero.title": {
    en: "Building the Future Together",
    ms: "Membina Masa Depan Bersama",
  },
  "hero.subtitle": {
    en: "Driving sustainable growth for the rubber industry in Sabah.",
    ms: "Memacu pembangunan industri getah Sabah ke arah kemapanan dan kemakmuran.",
  },
  "hero.cta": { en: "Get Started", ms: "Mulakan" },
  "hero.learn": { en: "Learn More", ms: "Ketahui Lebih" },

  // Statistics
  "stats.title": { en: "Key Statistics", ms: "Statistik Utama" },

  "stats.pekebun": { en: "Smallholders", ms: "Pekebun Kecil" },
  "stats.penoreh": { en: "Rubber Tappers", ms: "Penoreh Getah" },
  "stats.keluasan": { en: "Rubber Area (Hectares)", ms: "Keluasan Getah (Hektar)" },

  // Activity / News
  "activity.title": { en: "Latest Activities", ms: "Aktiviti Terkini" },

  "activity.seemore": { en: "See More", ms: "Lihat Lagi" },

  // Announcements
  "announcements.title": { en: "Announcements", ms: "Pengumuman" },
  "announcements.pinned": { en: "Pinned", ms: "Disematkan" },
  "announcements.viewall": { en: "View All Announcements", ms: "Lihat Semua Pengumuman" },
  "announcements.empty": { en: "No announcements available at the moment.", ms: "Tiada pengumuman tersedia buat masa ini." },
  "announcements.active": { en: "Active (visible on website)", ms: "Aktif (dipaparkan di laman web)" },
  "announcements.inactive": { en: "Inactive", ms: "Tidak aktif" },

  // Tenders
  "tenders.title": { en: "Tenders", ms: "Tender" },
 
  "tenders.refno": { en: "Ref No.", ms: "No. Rujukan" },
  "tenders.opening": { en: "Opening Date", ms: "Tarikh Buka" },
  "tenders.closing": { en: "Closing Date", ms: "Tarikh Tutup" },
  "tenders.status.open": { en: "Open", ms: "Dibuka" },
  "tenders.status.closed": { en: "Closed", ms: "Ditutup" },
  "tenders.tab.open": { en: "Open", ms: "Dibuka" },
  "tenders.tab.closed": { en: "Closed", ms: "Ditutup" },
  "tenders.empty": { en: "No tenders available at the moment.", ms: "Tiada tender tersedia buat masa ini." },
  "tenders.status.awarded": { en: "Awarded", ms: "Dianugerahkan" },
  "tenders.viewall": { en: "View All Tenders", ms: "Lihat Semua Tender" },
  "tenders.details": { en: "View Details", ms: "Lihat Butiran" },

  // Achievements
  "achievements.title": { en: "Achievements", ms: "Pencapaian" },
  "achievements.subtitle": { en: "LIGS's journey of milestones and accomplishments throughout the years", ms: "Perjalanan pencapaian dan kejayaan LIGS sepanjang tahun" },
  "achievements.empty": { en: "No achievements recorded yet.", ms: "Tiada pencapaian direkodkan lagi." },

  // Gallery
  "gallery.title": { en: "Gallery", ms: "Galeri" },
  "gallery.subtitle": { en: "Photos and memories from our events and activities", ms: "Foto dan kenangan daripada acara dan aktiviti kami" },
  "gallery.empty": { en: "No events yet.", ms: "Tiada acara lagi." },
  "gallery.search": { en: "Search events...", ms: "Cari acara..." },
  "gallery.sortNewest": { en: "Newest first", ms: "Terbaru dahulu" },
  "gallery.sortOldest": { en: "Oldest first", ms: "Terlama dahulu" },
  "gallery.images": { en: "images", ms: "imej" },
  "gallery.viewEvent": { en: "View event", ms: "Lihat acara" },
  "gallery.back": { en: "Back to gallery", ms: "Kembali ke galeri" },
  "gallery.noImages": { en: "No images in this event.", ms: "Tiada imej dalam acara ini." },
  "arkib.title": { en: "Archive", ms: "Arkib" },
  "arkib.subtitle": { en: "Archived news and gallery content", ms: "Kandungan berita dan galeri yang diarkibkan" },
  "penerbitan.title": { en: "Publications", ms: "Penerbitan" },
  "penerbitan.subtitle": { en: "LIGS publications and documents", ms: "Penerbitan dan dokumen LIGS" },
  "arkib.tab.all": { en: "All", ms: "Semua" },
  "arkib.tab.berita": { en: "News", ms: "Berita" },
  "arkib.tab.galeri": { en: "Gallery", ms: "Galeri" },
  "arkib.search": { en: "Search by title...", ms: "Cari mengikut tajuk..." },
  "arkib.allYears": { en: "All years", ms: "Semua tahun" },
  "arkib.type": { en: "Type", ms: "Jenis" },
  "arkib.originalDate": { en: "Original Date", ms: "Tarikh Asal" },
  "arkib.archivedAt": { en: "Date Archived", ms: "Tarikh Diarkibkan" },
  "arkib.view": { en: "View", ms: "Lihat" },
  "arkib.empty": { en: "No archived content.", ms: "Tiada kandungan diarkibkan." },
  "arkib.pageOf": { en: "Page {page} of {total}", ms: "Halaman {page} daripada {total}" },
  "arkib.items": { en: "items", ms: "item" },
  "arkib.prev": { en: "Previous", ms: "Sebelum" },
  "arkib.next": { en: "Next", ms: "Seterusnya" },
  "arkib.runArchival": { en: "Run Archival Now", ms: "Jalankan Arkib Sekarang" },
  "arkib.restore": { en: "Restore", ms: "Pulihkan" },
  "arkib.restoreConfirm": { en: "Restore this item to active?", ms: "Pulihkan item ini ke aktif?" },
  "arkib.deleteConfirm": { en: "Permanently delete this item?", ms: "Padam item ini secara kekal?" },
  "admin.manage.gallery": { en: "Gallery", ms: "Galeri" },
  "admin.manage.arkib": { en: "Archive", ms: "Arkib" },
  "admin.manage.penerbitan": { en: "Publications", ms: "Penerbitan" },
  "admin.manage.directory": { en: "Directory", ms: "Direktori" },

  // Directory (Direktori)
  "directory.title": { en: "Directory", ms: "Direktori" },
  "directory.subtitle": {
    en: "Department directory with staff contact details",
    ms: "Direktori bahagian dengan maklumat perhubungan kakitangan",
  },
  "directory.searchPlaceholder": {
    en: "Search by name, position, or department...",
    ms: "Cari mengikut nama, jawatan atau bahagian...",
  },
  "directory.empty": {
    en: "No results found.",
    ms: "Tiada keputusan dijumpai.",
  },
  "directory.noMembers": {
    en: "No members in this department.",
    ms: "Tiada ahli dalam bahagian ini.",
  },
  "directory.members": { en: "members", ms: "ahli" },
  "directory.sortBy": { en: "Sort by", ms: "Susun mengikut" },
  "directory.name": { en: "Name", ms: "Nama" },
  "directory.jawatan": { en: "Position", ms: "Jawatan" },
  "directory.noTelefon": { en: "Phone", ms: "No Telefon" },
  "directory.email": { en: "Email", ms: "E-mel" },
  "directory.viewPhoto": { en: "View photo", ms: "Lihat foto" },
  "directory.prev": { en: "Prev", ms: "Sebelum" },
  "directory.next": { en: "Next", ms: "Seterusnya" },
  "directory.addMember": { en: "Add Member", ms: "Tambah Ahli" },
  "directory.editMember": { en: "Edit Member", ms: "Edit Ahli" },
  "directory.deleteConfirm": {
    en: "Delete this member?",
    ms: "Padam ahli ini?",
  },
  "directory.imageRequired": { en: "Image is required (max 2MB)", ms: "Imej diperlukan (maks 2MB)" },
  "directory.emailHint": { en: "Enter username only (e.g. john.doe). Will be saved as username@sabah.gov.my", ms: "Masukkan nama pengguna sahaja (cth. john.doe). Akan disimpan sebagai username@sabah.gov.my" },
  "directory.reorder": { en: "Drag to reorder", ms: "Seret untuk susun semula" },
  "directory.unitCawangan": { en: "Unit/Cawangan", ms: "Unit/Cawangan" },
  "directory.other": { en: "Others", ms: "Lain-lain" },
  "directory.optional": { en: "optional", ms: "pilihan" },

  // Rubber Price
  "rubber.title": { en: "Rubber Price", ms: "Harga Getah" },
  "rubber.officialTitle": { en: "Official LIGS Rubber Price", ms: "Harga Getah Rasmi LIGS" },

  "rubber.date": { en: "Date", ms: "Tarikh" },
  "rubber.grade": { en: "Grade / Type", ms: "Gred / Jenis" },
  "rubber.price": { en: "Price (RM/kg)", ms: "Harga (RM/kg)" },
  "rubber.harga": { en: "HARGA (RM)", ms: "HARGA (RM)" },
  "rubber.bkn": { en: "BKN (RM)", ms: "BKN (RM)" },
  "rubber.ligs": { en: "LIGS (RM)", ms: "LIGS (RM)" },
  "rubber.jumlah": { en: "JUMLAH (RM)", ms: "JUMLAH (RM)" },
  "rubber.bknNote": { en: "*BKN: Bantuan Kerajaan Negeri Sabah", ms: "*BKN: Bantuan Kerajaan Negeri Sabah" },
  "rubber.latex": { en: "Latex", ms: "Lateks" },
  "rubber.kepingan1": { en: "Kepingan Grade 1", ms: "Kepingan Gred 1" },
  "rubber.kepingan2": { en: "Kepingan Grade 2", ms: "Kepingan Gred 2" },
  "rubber.kentalan1": { en: "Kentalan Grade 1", ms: "Kentalan Gred 1" },
  "rubber.kentalan2": { en: "Kentalan Grade 2", ms: "Kentalan Gred 2" },
  "rubber.scrap": { en: "Scrap", ms: "Sekerap" },
  "rubber.chart.title": { en: "Price Comparison by Grade", ms: "Perbandingan Harga Mengikut Gred" },
  "rubber.chart.subtitle": { en: "Visual comparison of today's rubber prices across all grades", ms: "Perbandingan visual harga getah hari ini merentas semua gred" },
  "rubber.loading": { en: "Loading price data...", ms: "Memuatkan data harga..." },
  "rubber.error": { en: "Price data not available yet", ms: "Data harga belum tersedia" },
  "rubber.retry": { en: "Retry", ms: "Cuba Semula" },
  "rubber.noData": { en: "No price data available", ms: "Tiada data harga tersedia" },
  "rubber.asOf": { en: "As of", ms: "Sehingga" },
  "rubber.source": { en: "Source: LIGS Data Portal", ms: "Sumber: Portal Data LIGS" },
  "rubber.lateks": { en: "Latex", ms: "Lateks" },
  "rubber.sekerap": { en: "Scrap", ms: "Sekerap" },

  // SES (Harga Ses Getah)
  "rubber.sesTitle": { en: "Harga Ses Getah Sabah (RM/tan)", ms: "Harga Ses Getah Sabah (RM/tan)" },
  "rubber.sesGetah": { en: "Getah", ms: "Getah" },
  "rubber.sesTanamSemula": { en: "Tanam Semula", ms: "Tanam Semula" },
  "rubber.sesGetahMentah": { en: "Getah Mentah", ms: "Getah Mentah" },

  // Monthly Rubber Price
  "rubberMonthly.title": { en: "Monthly Rubber Price Statistics", ms: "Statistik Harga Getah Bulanan" },
  "rubberMonthly.day": { en: "Day", ms: "Hari" },
  "rubberMonthly.highest": { en: "Highest", ms: "Tertinggi" },
  "rubberMonthly.lowest": { en: "Lowest", ms: "Terendah" },
  "rubberMonthly.priceRange": { en: "Price range for", ms: "Julat harga bagi" },

  // Social Media
  "social.title": { en: "Social Media", ms: "Media Sosial" },
  "social.noVideo": { en: "No video configured", ms: "Tiada video dikonfigurasi" },
  "social.scrollForMore": { en: "Scroll for more", ms: "Tatal ke bawah" },
  "social.follow": { en: "Follow Us", ms: "Ikuti Kami" },

  "agensiBerkaitan.title": { en: "Related Agencies", ms: "Agensi Berkaitan" },

  // Admin
  "admin.manage.announcements": { en: "Manage Announcements", ms: "Pengumuman" },
  "admin.manage.tenders": { en: "Manage Tenders", ms: "Tender" },
  "admin.manage.jawatanKosong": { en: "Job Vacancies", ms: "Jawatan Kosong" },
  "admin.manage.akal": { en: "AKAL Submissions", ms: "Borang AKAL" },
  "admin.manage.ePekeliling": { en: "e-Circulars", ms: "e-Pekeliling" },
  "admin.manage.calendar": { en: "Manage Calendar", ms: "Kalender" },
  "admin.manage.achievements": { en: "Manage Achievements", ms: "Pencapaian" },
  "admin.manage.bahagian": { en: "Bahagian", ms: "Bahagian" },
  "admin.manage.perkhidmatan": { en: "Manage Perkhidmatan", ms: "Perkhidmatan" },
  "admin.manage.agensiBerkaitan": { en: "Agensi Berkaitan", ms: "Agensi Berkaitan" },

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

  "visiMisi.title": { en: "Vision & Mission", ms: "Visi & Misi" },
  "visiMisi.subtitle": {
    en: "LIGS strategic direction and core policies",
    ms: "Arah strategik dan dasar teras LIGS",
  },
  "visiMisi.visiHeading": { en: "Vision", ms: "Visi" },
  "visiMisi.visiText": {
    en: "A Modern, Sustainable and Dynamic Rubber Industry",
    ms: "Industri Getah yang Moden, Berdaya Maju dan Dinamik",
  },
  "visiMisi.misiHeading": { en: "Mission", ms: "Misi" },
  "visiMisi.misiText": {
    en: "To develop the rubber industry in an integrated manner through efficient smallholder sector management, increasing production and diversifying downstream industries that are competitive in the global market.",
    ms: "Membangunkan industri getah secara bersepadu melalui pengurusan sektor pekebun kecil yang efisien, meningkatkan pengeluaran dan mempelbagaikan industri hiliran yang mampu bersaing di pasaran global.",
  },
  "visiMisi.dasarHeading": { en: "Policy", ms: "Dasar" },
  "visiMisi.dasar1": {
    en: "To establish stable and sustainable sources of income for farmers practising shifting cultivation, poor farmers and hardcore poor.",
    ms: "Mewujudkan punca pendapatan yang tetap dan mapan kepada petani yang mengamalkan pertanian pindah randah, petani miskin dan miskin tegar.",
  },
  "visiMisi.dasar2": {
    en: "To increase productivity and income for rubber smallholders.",
    ms: "Meningkatkan produktiviti dan pendapatan kepada para pekebun kecil getah.",
  },
  "visiMisi.dasar3": {
    en: "To place farmers practising shifting cultivation or farmers without land into rubber settlement schemes.",
    ms: "Menempatkan petani yang mengamalkan pertanian pindah randah atau petani yang tidak mempunyai tanah ke skim penempatan getah.",
  },
  "visiMisi.dasar4": {
    en: "To intensify the transfer of new technology to rubber smallholders.",
    ms: "Mempergiatkan proses pemindahan teknologi baharu kepada para pekebun kecil getah.",
  },
  "visiMisi.dasar5": {
    en: "To provide rubber processing and marketing facilities for rubber smallholders.",
    ms: "Menyediakan kemudahan pemprosesan dan pemasaran getah untuk pekebun kecil getah.",
  },
  "visiMisi.dasar6": {
    en: "To encourage the growth of rubber-based and rubberwood downstream industries.",
    ms: "Menggalakkan pertumbuhan industri hiliran yang berasaskan getah dan kayu getah.",
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

  // News
  "news.title": { en: "Latest News", ms: "Berita Terkini" },

  "news.readmore": { en: "Read More", ms: "Baca Lagi" },
  "news.prev": { en: "Previous", ms: "Sebelum" },
  "news.next": { en: "Next", ms: "Seterusnya" },
  "news.page": { en: "Page", ms: "Halaman" },

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
  "contact.map.title": { en: "Our Location", ms: "Lokasi Kami" },
  "contact.map.loading": { en: "Loading map...", ms: "Memuatkan peta..." },
  "contact.map.loadError": { en: "Map failed to load. Please check your connection.", ms: "Peta gagal dimuatkan. Sila semak sambungan anda." },
  "contact.map.noKey": { en: "Map is not configured. Please add your Google Maps API key.", ms: "Peta tidak dikonfigurasi. Sila tambah kunci API Google Maps." },
  "contact.map.openInMaps": { en: "Open in Google Maps", ms: "Buka dalam Google Maps" },
  "contact.map.getDirections": { en: "Get Directions", ms: "Dapatkan Arahan" },
  "contact.map.ariaLabel": { en: "Interactive map showing company location at Wisma Pertanian Sabah, Kota Kinabalu", ms: "Peta interaktif menunjukkan lokasi syarikat di Wisma Pertanian Sabah, Kota Kinabalu" },
  "contact.map.markerLabel": { en: "Company location - Wisma Pertanian Sabah", ms: "Lokasi syarikat - Wisma Pertanian Sabah" },
  "contact.anakSyarikat": { en: "Anak Syarikat LIGS", ms: "Anak Syarikat LIGS" },

  // Feedback
  "nav.feedback": { en: "Feedback", ms: "Maklum Balas" },
  "feedback.title": { en: "Feedback", ms: "Maklum Balas" },
  "feedback.subtitle": {
    en: "Share your thoughts. We value your feedback and will respond within 3-5 working days.",
    ms: "Kongsi pendapat anda. Kami menghargai maklum balas anda dan akan membalas dalam 3-5 hari bekerja.",
  },
  "feedback.name": { en: "Name", ms: "Nama" },
  "feedback.namePlaceholder": { en: "Your full name", ms: "Nama penuh anda" },
  "feedback.phone": { en: "Phone", ms: "Telefon" },
  "feedback.phonePlaceholder": { en: "e.g. 0123456789 ", ms: "cth. 0123456789" },
  "feedback.email": { en: "Email", ms: "E-mel" },
  "feedback.emailPlaceholder": { en: "username@example.com", ms: "username@example.com" },
  "feedback.subject": { en: "Subject", ms: "Subjek" },
  "feedback.subjectPlaceholder": { en: "Select a subject", ms: "Pilih subjek" },
  "feedback.subjectOther": { en: "Please specify", ms: "Sila nyatakan" },
  "feedback.subjectOtherPlaceholder": { en: "Describe your subject", ms: "Terangkan subjek anda" },
  "feedback.subject.general": { en: "General Inquiry", ms: "Pertanyaan Umum" },
  "feedback.subject.technical": { en: "Technical Issue", ms: "Isu Teknikal" },
  "feedback.subject.feedback": { en: "Feedback", ms: "Maklum Balas" },
  "feedback.subject.complaint": { en: "Complaint", ms: "Aduan" },
  "feedback.subject.other": { en: "Other", ms: "Lain-lain" },
  "feedback.message": { en: "Message", ms: "Mesej" },
  "feedback.messagePlaceholder": { en: "Your message (min 10, max 500 characters)", ms: "Mesej anda (min 10, maks 500 aksara)" },
  "feedback.submit": { en: "Submit Feedback", ms: "Hantar Maklum Balas" },
  "feedback.submitting": { en: "Submitting...", ms: "Menghantar..." },
  "feedback.successTitle": { en: "Thank you for your feedback!", ms: "Terima kasih atas maklum balas anda!" },
  "feedback.successMessage": {
    en: "We have received your message and will get back to you within 3-5 working days.",
    ms: "Kami telah menerima mesej anda dan akan membalas dalam 3-5 hari bekerja.",
  },
  "feedback.submitAnother": { en: "Submit another", ms: "Hantar lagi" },
  "feedback.errorGeneric": { en: "Something went wrong. Please try again.", ms: "Sesuatu telah berlaku. Sila cuba lagi." },
  "feedback.validation.nameMin": { en: "Name must be at least 2 characters", ms: "Nama mesti sekurang-kurangnya 2 aksara" },
  "feedback.validation.nameFormat": { en: "Name can only contain letters, numbers, spaces, hyphens and apostrophes", ms: "Nama hanya boleh mengandungi huruf, nombor, ruang, sengkang dan apostrof" },
  "feedback.validation.phoneRequired": { en: "Phone is required", ms: "Telefon diperlukan" },
  "feedback.validation.phoneFormat": {
    en: "Invalid phone format. Use e.g. 0123456789 (9-12 digits)",
    ms: "Format telefon tidak sah. Guna cth. 0123456789 (9-12 digit)",
  },
  "feedback.validation.emailFormat": { en: "Invalid email address", ms: "Alamat e-mel tidak sah" },
  "feedback.validation.subjectRequired": { en: "Please select a subject", ms: "Sila pilih subjek" },
  "feedback.validation.subjectOtherRequired": { en: "Please specify your subject", ms: "Sila nyatakan subjek anda" },
  "feedback.validation.messageMin": { en: "Message must be at least 10 characters", ms: "Mesej mesti sekurang-kurangnya 10 aksara" },
  "feedback.validation.messageMax": { en: "Message must not exceed 500 characters", ms: "Mesej tidak boleh melebihi 500 aksara" },

  // Kepuasan Pelanggan (Customer Satisfaction Survey)
  "nav.kepuasanPelanggan": { en: "Customer Satisfaction Survey", ms: "Kajian Tahap Kepuasan Pelanggan" },
  "kepuasan.title": { en: "Customer Satisfaction Survey (LIGS-PTN-076)", ms: "Borang Kajian Tahap Kepuasan Pelanggan (LIGS-PTN-076)" },
  "kepuasan.subtitle": {
    en: "This survey aims to gather information for improving the MS ISO 9001:2015 quality system at LIGS. Please submit before 30 April 2025.",
    ms: "Objektif kajian ini adalah untuk memperolehi maklumat bagi penambahbaikan sistem kualiti pelaksanaan MS ISO 9001:2015 di LIGS. Borang ini haruslah dihantar sebelum 30 April 2025.",
  },
  "kepuasan.intro1": {
    en: "Please give sincere, transparent, honest and open answers.",
    ms: "Sila berikan jawapan yang ikhlas, telus, jujur dan secara terbuka.",
  },
  "kepuasan.intro2": {
    en: "Thank you for your cooperation in completing this survey.",
    ms: "Terima Kasih kerana telah memberikan kerjasama anda untuk mengisi borang kajian ini.",
  },
  "kepuasan.intro3": {
    en: "Select one (1) option only for each question.",
    ms: "Pilih satu (1) sahaja pilihan jawapan dalam setiap soalan yang telah diberikan.",
  },
  "kepuasan.intro4": {
    en: "This form must be submitted before 30 April 2025.",
    ms: "Borang ini haruslah dihantar sebelum 30 April 2025.",
  },
  "kepuasan.jantina": { en: "Gender", ms: "Jantina" },
  "kepuasan.umur": { en: "Age", ms: "Umur" },
  "kepuasan.umurPlaceholder": { en: "e.g. 35", ms: "cth. 35" },
  "kepuasan.daerah": { en: "Current residence / District", ms: "Tempat tinggal sekarang / Daerah" },
  "kepuasan.daerahPlaceholder": { en: "Select district", ms: "Pilih daerah" },
  "kepuasan.pekerjaan": { en: "Occupation", ms: "Pekerjaan" },
  "kepuasan.pekerjaanPlaceholder": { en: "Select occupation", ms: "Pilih pekerjaan" },
  "kepuasan.tahunPerkhidmatan": { en: "I have received LIGS service since year", ms: "Saya mendapat perkhidmatan LIGS semenjak tahun" },
  "kepuasan.tahunPlaceholder": { en: "e.g. 2020", ms: "cth. 2020" },
  "kepuasan.cadanganKomen": { en: "Suggestions / Comments", ms: "Cadangan / Komen" },
  "kepuasan.cadanganPlaceholder": { en: "Your suggestions or comments", ms: "Cadangan atau komen anda" },
  "kepuasan.submit": { en: "Submit Survey", ms: "Hantar Borang" },
  "kepuasan.submitting": { en: "Submitting...", ms: "Menghantar..." },
  "kepuasan.successTitle": { en: "Thank you for your response!", ms: "Terima kasih atas maklum balas anda!" },
  "kepuasan.successMessage": {
    en: "Your survey has been submitted successfully.",
    ms: "Borang kajian anda telah berjaya dihantar.",
  },
  "kepuasan.submitAnother": { en: "Submit another", ms: "Hantar lagi" },
  "kepuasan.errorGeneric": { en: "Something went wrong. Please try again.", ms: "Sesuatu telah berlaku. Sila cuba lagi." },
  "kepuasan.validation.required": { en: "This field is required", ms: "Ruangan ini wajib diisi" },
  "kepuasan.validation.umurRequired": { en: "Age is required", ms: "Umur wajib diisi" },
  "kepuasan.validation.umurFormat": {
    en: "Age must be 1-2 digits only (numbers only, no letters or symbols)",
    ms: "Umur mesti 1-2 digit sahaja (nombor sahaja, tiada huruf atau simbol)",
  },
  "kepuasan.validation.daerahRequired": { en: "District is required", ms: "Daerah wajib diisi" },
  "kepuasan.validation.tahunRequired": { en: "Year is required", ms: "Tahun wajib diisi" },
  "kepuasan.validation.tahunFormat": {
    en: "Year must be exactly 4 digits (numbers only, e.g. 2020)",
    ms: "Tahun mesti tepat 4 digit (nombor sahaja, cth. 2020)",
  },
  "kepuasan.validation.cadanganRequired": { en: "Suggestions/Comments are required", ms: "Cadangan/Komen wajib diisi" },
  "kepuasan.validation.completeAll": {
    en: "Please complete all required questions before submitting.",
    ms: "Sila lengkapkan semua soalan wajib sebelum menghantar.",
  },
  "kepuasan.formClosedTitle": { en: "Form Closed", ms: "Borang Ditutup" },
  "kepuasan.formClosedMessage": {
    en: "This form no longer accepts submissions.",
    ms: "Borang ini tidak lagi menerima penghantaran.",
  },

  // Kepuasan Staf (Staff Satisfaction Survey LIGS-PTN-077)
  "nav.kepuasanStaf": { en: "Staff Satisfaction Survey", ms: "Kajian Tahap Kepuasan Staf" },
  "kepuasanStaf.title": { en: "Staff Satisfaction Survey (LIGS-PTN-077)", ms: "Borang Kajian Tahap Kepuasan Kakitangan (LIGS-PTN-077)" },
  "kepuasanStaf.subtitle": {
    en: "This survey aims to gather staff feedback for improving the MS ISO 9001:2015 quality system at LIGS.",
    ms: "Kajian ini bertujuan untuk memperolehi maklumat staf bagi penambahbaikan sistem kualiti MS ISO 9001:2015 di LIGS.",
  },
  "kepuasanStaf.intro1": {
    en: "Please give sincere, transparent, honest and open answers.",
    ms: "Sila berikan jawapan yang ikhlas, telus, jujur dan secara terbuka.",
  },
  "kepuasanStaf.intro2": {
    en: "Thank you for your cooperation in completing this survey.",
    ms: "Terima Kasih di atas kerjasama anda kerana mengisi borang kajian ini.",
  },
  "kepuasanStaf.jantina": { en: "Gender", ms: "Jantina" },
  "kepuasanStaf.daerah": { en: "District", ms: "Daerah" },
  "kepuasanStaf.daerahPlaceholder": { en: "Your district", ms: "Daerah anda" },
  "kepuasanStaf.bahagianUnit": { en: "Division / Work placement unit", ms: "Bahagian / Unit penempatan kerja" },
  "kepuasanStaf.bahagianUnitPlaceholder": { en: "Your division or unit", ms: "Bahagian atau unit anda" },
  "kepuasanStaf.tahunKhidmat": { en: "Have served with LIGS for", ms: "Telah berkhidmat dengan LIGS selama" },
  "kepuasanStaf.tahunKhidmatPlaceholder": { en: "Select duration", ms: "Pilih tempoh" },
  "kepuasanStaf.cadanganKomen": { en: "Suggestions / Comments", ms: "Cadangan / Komen" },
  "kepuasanStaf.cadanganPlaceholder": { en: "Your suggestions or comments", ms: "Cadangan atau komen anda" },
  "kepuasanStaf.submit": { en: "Submit Survey", ms: "Hantar Borang" },
  "kepuasanStaf.submitting": { en: "Submitting...", ms: "Menghantar..." },
  "kepuasanStaf.successTitle": { en: "Thank you for your response!", ms: "Terima kasih atas maklum balas anda!" },
  "kepuasanStaf.successMessage": {
    en: "Your survey has been submitted successfully.",
    ms: "Borang kajian anda telah berjaya dihantar.",
  },
  "kepuasanStaf.submitAnother": { en: "Submit another", ms: "Hantar lagi" },
  "kepuasanStaf.errorGeneric": { en: "Something went wrong. Please try again.", ms: "Sesuatu telah berlaku. Sila cuba lagi." },
  "kepuasanStaf.validation.bahagianRequired": { en: "Division/Unit is required", ms: "Bahagian/Unit diperlukan" },

  // Admin - Kepuasan tabs
  "admin.kepuasan.tabsSubtitle": { en: "View submission counts and export data for Customer and Staff surveys.", ms: "Lihat bilangan penghantaran dan eksport data untuk kajian Pelanggan dan Staf." },
  "admin.kepuasan.tabPelanggan": { en: "Pelanggan (LIGS-PTN-076)", ms: "Pelanggan (LIGS-PTN-076)" },
  "admin.kepuasan.tabStaf": { en: "Staf (LIGS-PTN-077)", ms: "Staf (LIGS-PTN-077)" },
  "admin.kepuasanStaf.submissions": { en: "submissions", ms: "penghantaran" },
  "admin.kepuasanStaf.noSubmissions": { en: "No staff survey submissions yet.", ms: "Tiada penghantaran borang kajian staf lagi." },
  "admin.kepuasanStaf.exportExcel": { en: "Export to Excel", ms: "Eksport ke Excel" },
  "admin.kepuasanStaf.exportHint": { en: "Export to Excel to view all submission data.", ms: "Eksport ke Excel untuk melihat semua data penghantaran." },
  "admin.kepuasan.formOpen": { en: "Form open (accepting submissions)", ms: "Borang dibuka (menerima penghantaran)" },
  "admin.kepuasan.formClosed": { en: "Form closed (not accepting)", ms: "Borang ditutup (tidak menerima)" },
  "kepuasan.formClosedMessage": { en: "This form no longer accepts submissions.", ms: "Borang ini tidak lagi menerima penghantaran." },
  "admin.kepuasan.formOpen": { en: "Form open (accepting submissions)", ms: "Borang dibuka (menerima penghantaran)" },
  "admin.kepuasan.formClosed": { en: "Form closed (no submissions)", ms: "Borang ditutup (tiada penghantaran)" },
  "kepuasan.formClosedAlert": {
    en: "This form no longer accepts submissions.",
    ms: "Borang ini tidak lagi menerima penghantaran.",
  },

  // Accessibility
  "a11y.menuLabel": { en: "Open accessibility options", ms: "Buka pilihan kebolehcapaian" },
  "a11y.panelTitle": { en: "Accessibility", ms: "Kebolehcapaian" },
  "a11y.fontSize": { en: "Font size", ms: "Saiz fon" },
  "a11y.increaseFont": { en: "Increase font size", ms: "Besarkan saiz fon" },
  "a11y.decreaseFont": { en: "Decrease font size", ms: "Kecilkan saiz fon" },
  "a11y.colorVision": { en: "Color vision", ms: "Persepsi warna" },
  "a11y.colorVision.normal": { en: "Normal vision", ms: "Penglihatan normal" },
  "a11y.colorVision.protanopia": { en: "Protanopia (red-blind)", ms: "Protanopia (buta merah)" },
  "a11y.colorVision.deuteranopia": { en: "Deuteranopia (green-blind)", ms: "Deuteranopia (buta hijau)" },
  "a11y.colorVision.tritanopia": { en: "Tritanopia (blue-blind)", ms: "Tritanopia (buta biru)" },
  "a11y.colorVision.achromatopsia": { en: "Achromatopsia (monochromacy)", ms: "Achromatopsia (monokromasi)" },
  "a11y.highContrast": { en: "High contrast", ms: "Kontras tinggi" },
  "a11y.reset": { en: "Reset to default", ms: "Set semula ke asal" },

  "contact.addressText": {
    en: "Our address: Wisma Pertanian Sabah, Jalan Tasik, Luyang, 88632 Kota Kinabalu, Sabah, Malaysia",
    ms: "Alamat kami: Wisma Pertanian Sabah, Jalan Tasik, Luyang, 88632 Kota Kinabalu, Sabah, Malaysia",
  },

  // Footer
  "footer.tagline": { en: '"Industri Getah Memacu Gemilang"', ms: '"Industri Getah Memacu Gemilang"' },
  "footer.rights": { en: "All rights reserved.", ms: "Hak cipta terpelihara." },
  "footer.lastUpdated": { en: "Last Updated", ms: "Tarikh Kemaskini" },
  "footer.quicklinks": { en: "Quick Links", ms: "Pautan Pantas" },
  "footer.aboutUs": { en: "About Us", ms: "Tentang Kami" },
  "footer.contact": { en: "Contact Info", ms: "Maklumat Hubungan" },
  "footer.followUs": { en: "Follow Us", ms: "Ikuti Kami" },
  "footer.followUsDesc": {
    en: "Follow our social media for the latest news and updates.",
    ms: "Ikuti media sosial kami untuk berita dan kemas kini terkini.",
  },
  "footer.aboutLIGS": { en: "About LIGS", ms: "Mengenai LIGS" },
  "footer.visionMission": { en: "Vision & Mission", ms: "Visi & Misi" },
  "footer.orgChart": { en: "Organisation Chart", ms: "Carta Organisasi" },
  "footer.procurement": { en: "Procurement", ms: "Tender" },
  "footer.download": { en: "Download", ms: "Muat Turun" },
  "footer.activityCalendar": { en: "Activity Calendar", ms: "Kalendar Aktiviti" },
  "footer.openData": { en: "Open Data", ms: "Data Terbuka" },
  "footer.policies": { en: "Policies & Notices", ms: "Dasar & Notis" },
  "footer.privasi": { en: "Privacy Policy", ms: "Privasi" },
  "footer.dasarKeselamatan": { en: "Security Policy", ms: "Dasar Keselamatan" },
  "footer.penafian": { en: "Disclaimer", ms: "Penafian" },
  "footer.notisHakCipta": { en: "Copyright Notice", ms: "Notis Hak Cipta" },

  // Legal / Dasar pages
  "legal.privasi": { en: "Privacy Policy", ms: "Dasar Privasi" },
  "legal.privasiSubtitle": { en: "How we collect, use and protect your information.", ms: "Cara kami mengumpul, menggunakan dan melindungi maklumat anda." },
  "legal.privasiContent1": {
    en: "Lembaga Industri Getah Sabah (LIGS) is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose and safeguard your information when you visit our website or use our services.",
    ms: "Lembaga Industri Getah Sabah (LIGS) berkomitmen melindungi data peribadi anda. Dasar Privasi ini menerangkan cara kami mengumpul, menggunakan, mendedahkan dan menjaga maklumat anda apabila anda melawati laman web kami atau menggunakan perkhidmatan kami.",
  },
  "legal.privasiContent2": {
    en: "We may collect information such as your name, email address, contact number and other relevant details when you voluntarily provide them through our contact forms or enquiries. This information is used solely to respond to your requests and improve our services.",
    ms: "Kami mungkin mengumpul maklumat seperti nama, alamat e-mel, nombor telefon dan butiran lain yang anda berikan secara sukarela melalui borang hubungan atau pertanyaan. Maklumat ini digunakan semata-mata untuk membalas permintaan anda dan meningkatkan perkhidmatan kami.",
  },
  "legal.privasiContent3": {
    en: "We do not sell, trade or transfer your personal information to third parties without your consent. For any questions regarding this policy, please contact us at gm.getah@sabah.gov.my.",
    ms: "Kami tidak menjual, memperdagangkan atau memindahkan maklumat peribadi anda kepada pihak ketiga tanpa persetujuan anda. Untuk sebarang pertanyaan mengenai dasar ini, sila hubungi kami di gm.getah@sabah.gov.my.",
  },

  "legal.dasarKeselamatan": { en: "Security Policy", ms: "Dasar Keselamatan" },
  "legal.dasarKeselamatanSubtitle": { en: "Our commitment to data and system security.", ms: "Komitmen kami terhadap keselamatan data dan sistem." },
  "legal.dasarKeselamatanContent1": {
    en: "LIGS adopts industry-standard security measures to protect our website, systems and data from unauthorized access, disruption or misuse. We regularly review and update our security practices to address emerging threats.",
    ms: "LIGS menggunakan langkah keselamatan standard industri untuk melindungi laman web, sistem dan data kami daripada akses tanpa kebenaran, gangguan atau penyalahgunaan. Kami sentiasa mengkaji dan mengemas kini amalan keselamatan kami untuk menangani ancaman baharu.",
  },
  "legal.dasarKeselamatanContent2": {
    en: "Our website uses secure protocols and encryption where appropriate. Access to sensitive information is restricted to authorized personnel only, and we conduct regular audits to ensure compliance with our security policies.",
    ms: "Laman web kami menggunakan protokol selamat dan penyulitan di mana sesuai. Akses kepada maklumat sensitif disekat kepada kakitangan yang diberi kuasa sahaja, dan kami menjalankan audit berkala untuk memastikan pematuhan terhadap dasar keselamatan kami.",
  },
  "legal.dasarKeselamatanContent3": {
    en: "If you discover any security vulnerability or have concerns about the safety of our systems, please report it to us at gm.getah@sabah.gov.my. We treat all reports seriously and will respond accordingly.",
    ms: "Sekiranya anda menemui sebarang kerentanan keselamatan atau mempunyai kebimbangan tentang keselamatan sistem kami, sila laporkan kepada kami di gm.getah@sabah.gov.my. Kami menganggap semua laporan dengan serius dan akan bertindak balas sewajarnya.",
  },

  "legal.penafian": { en: "Disclaimer", ms: "Penafian" },
  "legal.penafianSubtitle": { en: "Important information about the use of this website.", ms: "Maklumat penting tentang penggunaan laman web ini." },
  "legal.penafianContent1": {
    en: "The information on this website is provided for general reference only. While LIGS endeavours to ensure accuracy and timeliness of the content, we do not guarantee that the information is complete, current or free from errors.",
    ms: "Maklumat di laman web ini disediakan untuk rujukan umum sahaja. Walaupun LIGS berusaha memastikan ketepatan dan ketepatan masa kandungan, kami tidak menjamin bahawa maklumat tersebut lengkap, terkini atau bebas daripada ralat.",
  },
  "legal.penafianContent2": {
    en: "LIGS shall not be held liable for any loss, damage or inconvenience arising from the use of or reliance on the information provided on this website. Users are encouraged to verify critical information through official channels before making any decisions.",
    ms: "LIGS tidak akan bertanggungjawab atas sebarang kerugian, kerosakan atau ketidakselesaan yang timbul daripada penggunaan atau pergantungan pada maklumat yang disediakan di laman web ini. Pengguna digalakkan untuk mengesahkan maklumat penting melalui saluran rasmi sebelum membuat sebarang keputusan.",
  },
  "legal.penafianContent3": {
    en: "This website may contain links to external sites. LIGS is not responsible for the content or privacy practices of those external websites. The inclusion of any link does not imply endorsement by LIGS.",
    ms: "Laman web ini mungkin mengandungi pautan ke laman luar. LIGS tidak bertanggungjawab terhadap kandungan atau amalan privasi laman web luar tersebut. Kemasukan sebarang pautan tidak bermaksud pengesahan oleh LIGS.",
  },

  "legal.notisHakCipta": { en: "Copyright Notice", ms: "Notis Hak Cipta" },
  "legal.notisHakCiptaSubtitle": { en: "Use of content and materials on this website.", ms: "Penggunaan kandungan dan bahan di laman web ini." },
  "legal.notisHakCiptaContent1": {
    en: "Unless otherwise stated, all content on this website including text, graphics, logos, images and software is the property of Lembaga Industri Getah Sabah (LIGS) or its content suppliers and is protected by Malaysian and international copyright laws.",
    ms: "Melainkan dinyatakan sebaliknya, semua kandungan di laman web ini termasuk teks, grafik, logo, imej dan perisian adalah hak milik Lembaga Industri Getah Sabah (LIGS) atau pembekal kandungannya dan dilindungi oleh undang-undang hak cipta Malaysia dan antarabangsa.",
  },
  "legal.notisHakCiptaContent2": {
    en: "You may view, download and print materials from this website for personal, non-commercial use only. Any reproduction, distribution, modification or commercial use of the content without prior written permission from LIGS is prohibited.",
    ms: "Anda boleh melihat, memuat turun dan mencetak bahan dari laman web ini untuk kegunaan peribadi dan bukan komersial sahaja. Sebarang penggandaan, pengedaran, pengubahsuaian atau penggunaan komersial kandungan tanpa kebenaran bertulis terlebih dahulu daripada LIGS adalah dilarang.",
  },
  "legal.notisHakCiptaContent3": {
    en: "For permissions or enquiries regarding the use of our content, please contact us at gm.getah@sabah.gov.my. LIGS reserves the right to take legal action against any unauthorised use of its materials.",
    ms: "Untuk kebenaran atau pertanyaan mengenai penggunaan kandungan kami, sila hubungi kami di gm.getah@sabah.gov.my. LIGS berhak mengambil tindakan undang-undang terhadap sebarang penggunaan bahan tanpa kebenaran.",
  },

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
  "admin.dashboard": { en: "Dashboard", ms: "Dashboard" },
  "admin.manage.news": { en: "Manage News", ms: "Berita" },
  "admin.manage.landing": { en: "Manage Landing", ms: "Halaman Utama" },
  "admin.manage.integriti": { en: "Sudut Integriti", ms: "Sudut Integriti" },
  "admin.manage.laguLigs": { en: "Lagu LIGS", ms: "Lagu LIGS" },
  "admin.manage.mediaSosial": { en: "Media Sosial", ms: "Media Sosial" },
  "admin.manage.banners": { en: "Manage Banners", ms: "Banner" },
  "admin.manage.stats": { en: "Key Statistics", ms: "Statistik Utama" },
  "admin.manage.theme": { en: "Theme Settings", ms: "Tetapan Tema" },
  "admin.manage.feedback": { en: "Feedback", ms: "Maklum Balas" },
  "admin.manage.kepuasanPelanggan": { en: "Customer Satisfaction Survey", ms: "Kepuasan Pelanggan" },
  "admin.manage.kelabSukan": { en: "Kelab Sukan", ms: "Kelab Sukan" },
  "admin.manage.users": { en: "Users", ms: "Pengguna" },
  "admin.manage.activityLog": { en: "Activity Log", ms: "Log Aktiviti" },
  "admin.kelabSukan.news": { en: "News", ms: "Berita" },
  "admin.kelabSukan.intro": { en: "Introduction", ms: "Pengenalan" },
  "admin.kelabSukan.presidents": { en: "President History", ms: "Sejarah Presiden" },
  "kelabSukan.pengenalan": { en: "Introduction", ms: "Pengenalan" },
  "admin.feedback.submissions": { en: "submissions", ms: "penghantaran" },
  "admin.feedback.noSubmissions": { en: "No feedback submissions yet.", ms: "Tiada penghantaran maklum balas lagi." },
  "admin.kepuasan.submissions": { en: "submissions", ms: "penghantaran" },
  "admin.kepuasan.noSubmissions": { en: "No survey submissions yet.", ms: "Tiada penghantaran borang kajian lagi." },
  "admin.kepuasan.exportExcel": { en: "Export to Excel", ms: "Eksport ke Excel" },
  "admin.kepuasan.exportHint": { en: "Export to Excel to view all submission data.", ms: "Eksport ke Excel untuk melihat semua data penghantaran." },
  "admin.kepuasan.toggleSaved": { en: "Form status updated", ms: "Status borang telah dikemas kini" },
  "admin.kepuasan.toggleFailed": { en: "Failed to update form status", ms: "Gagal mengemas kini status borang" },
  "admin.kepuasan.formOpen": { en: "Form open (accepting submissions)", ms: "Borang dibuka (menerima penghantaran)" },
  "admin.kepuasan.formClosed": { en: "Form closed (no submissions)", ms: "Borang ditutup (tiada penghantaran)" },
  "kepuasan.formClosedAlert": { en: "This form no longer accepts submissions.", ms: "Borang ini tidak lagi menerima penghantaran." },
  "admin.kepuasan.formOpen": { en: "Form open", ms: "Borang dibuka" },
  "admin.kepuasan.formClosed": { en: "Form closed", ms: "Borang ditutup" },
  "kepuasan.formClosedMessage": { en: "This form no longer accepts submissions.", ms: "Borang ini tidak lagi menerima penghantaran." },
  "admin.kepuasan.formOpen": { en: "Form open", ms: "Borang dibuka" },
  "admin.kepuasan.formClosed": { en: "Form closed", ms: "Borang ditutup" },
  "kepuasan.formClosedMessage": { en: "This form no longer accepts submissions.", ms: "Borang ini tidak lagi menerima penghantaran." },
  "admin.kepuasan.formOpen": { en: "Form open (accepting submissions)", ms: "Borang dibuka (menerima penghantaran)" },
  "admin.kepuasan.formClosed": { en: "Form closed (no submissions)", ms: "Borang ditutup (tiada penghantaran)" },
  "kepuasan.formClosedMessage": {
    en: "This form no longer accepts submissions.",
    ms: "Borang ini tidak lagi menerima penghantaran.",
  },
  "admin.kepuasan.formOpen": { en: "Form open (accepting submissions)", ms: "Borang dibuka (menerima penghantaran)" },
  "admin.kepuasan.formClosed": { en: "Form closed (no submissions)", ms: "Borang ditutup (tiada penghantaran)" },
  "admin.kepuasan.formOpen": { en: "Form open", ms: "Borang terbuka" },
  "admin.kepuasan.formClosed": { en: "Form closed", ms: "Borang ditutup" },
  "kepuasan.formClosedMessage": { en: "This form no longer accepts submissions.", ms: "Borang ini tidak lagi menerima penghantaran." },
  "admin.pagination.prev": { en: "Previous", ms: "Sebelumnya" },
  "admin.pagination.next": { en: "Next", ms: "Seterusnya" },
  "admin.pagination.page": { en: "Page", ms: "Halaman" },
  "admin.pagination.of": { en: "of", ms: "daripada" },
  "admin.logout": { en: "Logout", ms: "Log Keluar" },
  "admin.backToWebsite": { en: "Back to Website", ms: "Kembali ke Laman" },
  "admin.add": { en: "Add New", ms: "Tambah Baru" },
  "admin.edit": { en: "Edit", ms: "Sunting" },
  "admin.delete": { en: "Delete", ms: "Padam" },
  "admin.save": { en: "Save", ms: "Simpan" },
  "admin.cancel": { en: "Cancel", ms: "Batal" },
  "admin.title": { en: "Title", ms: "Tajuk" },
  "admin.image": { en: "Image", ms: "Imej" },
  "admin.content": { en: "Content", ms: "Kandungan" },
  "admin.name": { en: "Name", ms: "Nama" },
  "admin.role": { en: "Role", ms: "Peranan" },
  "admin.bio": { en: "Bio", ms: "Bio" },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ms")

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
