import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import bcrypt from "bcryptjs"

const dbUrl = new URL(process.env.DATABASE_URL!)
const database = dbUrl.pathname.slice(1).split("?")[0] || "ligs_website"
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: decodeURIComponent(dbUrl.username), // Decode just in case
  password: decodeURIComponent(dbUrl.password), // This turns %40 back into @
  database,
  allowPublicKeyRetrieval: true,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database (skip tables that already have data)...")

  // 1. Admin user (upsert — always safe)
  const hashedPassword = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@ligs.com" },
    update: {},
    create: {
      email: "admin@ligs.com",
      password: hashedPassword,
      name: "Admin",
    },
  })
  console.log("  Admin user OK")

  // 2. Banners — only seed if empty
  const bannerCount = await prisma.bannerSlide.count()
  if (bannerCount === 0) {
    await prisma.bannerSlide.createMany({
      data: [
        {
          image: "",
          title: "Empowering Smallholders Nationwide",
          titleMs: "Memperkasakan Pekebun Kecil Seluruh Negara",
          caption: "Supporting rubber industry growth through innovation and sustainable practices for a better tomorrow.",
          captionMs: "Menyokong pertumbuhan industri getah melalui inovasi dan amalan mampan untuk hari esok yang lebih baik.",
          ctaText: "Learn More",
          ctaTextMs: "Ketahui Lebih",
          ctaLink: "/about",
          sortOrder: 0,
        },
        {
          image: "",
          title: "Driving Sustainable Growth",
          titleMs: "Memacu Pertumbuhan Mampan",
          caption: "Our commitment to environmental stewardship and community development continues to shape the future.",
          captionMs: "Komitmen kami terhadap kelestarian alam sekitar dan pembangunan komuniti terus membentuk masa depan.",
          ctaText: "Our Services",
          ctaTextMs: "Perkhidmatan Kami",
          ctaLink: "/services",
          sortOrder: 1,
        },
        {
          image: "",
          title: "Building Partnerships That Last",
          titleMs: "Membina Perkongsian Berkekalan",
          caption: "Collaborating with global and local stakeholders to create opportunities and drive meaningful impact.",
          captionMs: "Bekerjasama dengan pihak berkepentingan global dan tempatan untuk mencipta peluang dan kesan bermakna.",
          ctaText: "Contact Us",
          ctaTextMs: "Hubungi Kami",
          ctaLink: "/contact",
          sortOrder: 2,
        },
      ],
    })
    console.log("  Banners seeded")
  } else {
    console.log("  Banners skipped (already have " + bannerCount + " rows)")
  }

  // 3. Stats — only seed if empty
  const statCount = await prisma.statItem.count()
  if (statCount === 0) {
    await prisma.statItem.createMany({
      data: [
        { labelKey: "stats.pekebun", value: 700, suffix: "", sortOrder: 0 },
        { labelKey: "stats.penoreh", value: 895, suffix: "", sortOrder: 1 },
        { labelKey: "stats.keluasan", value: 93201, suffix: "", sortOrder: 2 },
      ],
    })
    console.log("  Stats seeded")
  } else {
    console.log("  Stats skipped (already have " + statCount + " rows)")
  }

  // 4. News — only seed if empty
  const newsCount = await prisma.newsArticle.count()
  if (newsCount === 0) {
    await prisma.newsArticle.createMany({
      data: [
        {
          title: "Company Expands Operations to Southeast Asia",
          titleMs: "Syarikat Meluaskan Operasi ke Asia Tenggara",
          content: "We are thrilled to announce our expansion into Southeast Asia, bringing our innovative solutions to new markets. This strategic move reflects our commitment to serving clients across the region with the same excellence they have come to expect. Our team is already on the ground, establishing partnerships and building the infrastructure needed to deliver world-class services.",
          contentMs: "Kami teruja mengumumkan pengembangan kami ke Asia Tenggara, membawa penyelesaian inovatif kami ke pasaran baharu. Langkah strategik ini mencerminkan komitmen kami untuk melayani pelanggan di seluruh rantau ini dengan kecemerlangan yang mereka harapkan.",
          date: "2026-01-15",
          category: "Expansion",
        },
        {
          title: "Awarded Best Consulting Firm 2025",
          titleMs: "Dianugerahkan Firma Perundingan Terbaik 2025",
          content: "We are honored to receive the prestigious Best Consulting Firm award for 2025. This recognition underscores our team's dedication to delivering exceptional results and our commitment to innovation. We want to thank our incredible clients and partners who have been instrumental in this journey. This award motivates us to continue pushing boundaries.",
          contentMs: "Kami berbesar hati menerima anugerah berprestij Firma Perundingan Terbaik untuk 2025. Pengiktirafan ini menekankan dedikasi pasukan kami untuk menyampaikan hasil yang luar biasa dan komitmen kami terhadap inovasi.",
          date: "2025-12-20",
          category: "Awards",
        },
        {
          title: "New Partnership with Global Tech Leaders",
          titleMs: "Perkongsian Baharu dengan Pemimpin Teknologi Global",
          content: "We have formed a strategic partnership with leading global technology firms to bring cutting-edge digital solutions to our clients. This collaboration will enable us to offer enhanced services in AI, cloud computing, and data analytics. Together, we aim to accelerate digital transformation across industries.",
          contentMs: "Kami telah membentuk perkongsian strategik dengan firma teknologi global terkemuka untuk membawa penyelesaian digital canggih kepada pelanggan kami.",
          date: "2025-11-10",
          category: "Partnership",
        },
      ],
    })
    console.log("  News seeded")
  } else {
    console.log("  News skipped (already have " + newsCount + " rows)")
  }

  // 6. Tenders — only seed if empty
  const tenderCount = await prisma.tender.count()
  if (tenderCount === 0) {
    await prisma.tender.createMany({
      data: [
        {
          title: "Supply and Delivery of Rubber Seedlings for Replanting Programme",
          titleMs: "Pembekalan dan Penghantaran Benih Getah untuk Program Tanam Semula",
          openingDate: "2026-02-01",
          closingDate: "2026-03-15",
          pdfUrl: "",
          status: "open",
        },
        {
          title: "Construction of Rubber Processing Facility in Johor",
          titleMs: "Pembinaan Fasiliti Pemprosesan Getah di Johor",
          openingDate: "2026-02-15",
          closingDate: "2026-03-30",
          pdfUrl: "",
          status: "open",
        },
        {
          title: "IT Infrastructure Upgrade and Cloud Migration Services",
          titleMs: "Perkhidmatan Naik Taraf Infrastruktur IT dan Migrasi Awan",
          openingDate: "2026-03-01",
          closingDate: "2026-04-10",
          pdfUrl: "",
          status: "open",
        },
        {
          title: "Provision of Security Services for Regional Offices",
          titleMs: "Peruntukan Perkhidmatan Keselamatan untuk Pejabat Wilayah",
          openingDate: "2025-11-01",
          closingDate: "2025-12-31",
          pdfUrl: "",
          status: "closed",
        },
        {
          title: "Laboratory Equipment for Rubber Quality Testing",
          titleMs: "Peralatan Makmal untuk Ujian Kualiti Getah",
          openingDate: "2025-10-01",
          closingDate: "2025-11-30",
          pdfUrl: "",
          status: "closed",
        },
      ],
    })
    console.log("  Tenders seeded")
  } else {
    console.log("  Tenders skipped (already have " + tenderCount + " rows)")
  }

  // 6b. Calendar events — only seed if empty
  const calendarCount = await prisma.calendarEvent.count()
  if (calendarCount === 0) {
    await prisma.calendarEvent.createMany({
      data: [
        {
          title: "Mes Christmas & Tahun Baru",
          startDate: new Date("2026-12-20"),
          endDate: new Date("2026-12-20"),
          location: "Dewan Besar LIGS",
          tag: "Majlis",
        },
        {
          title: "Mesyuarat Lembaga Pengarah",
          startDate: new Date("2026-02-25"),
          endDate: new Date("2026-02-25"),
          location: "Bilik Mesyuarat Utama",
          tag: "Mesyuarat",
        },
        {
          title: "Program Latihan Pekebun Kecil",
          startDate: new Date("2026-03-10"),
          endDate: new Date("2026-03-12"),
          location: "Pusat Latihan LIGS",
          tag: "Program",
        },
        {
          title: "Hari Raya Aidilfitri",
          startDate: new Date("2026-03-31"),
          endDate: new Date("2026-04-01"),
          location: "Pejabat Ditutup",
          tag: "Public Holiday",
        },
      ],
    })
    console.log("  Calendar events seeded")
  } else {
    console.log("  Calendar events skipped (already have " + calendarCount + " rows)")
  }

  // 7. Achievements — only seed if empty
  const achievementCount = await prisma.achievement.count()
  if (achievementCount === 0) {
    await prisma.achievement.createMany({
      data: [
        {
          title: "LIGS Officially Established",
          description: "The Lembaga Industri Getah Sabah (LIGS) was officially established under the Sabah Rubber Industry Board Enactment to oversee and develop the rubber industry in Sabah.",
          imageUrl: "",
          achievementDate: new Date("1969-01-01"),
        },
        {
          title: "First Rubber Replanting Programme Launched",
          description: "LIGS launched its inaugural rubber replanting programme, providing subsidies and technical assistance to smallholders across Sabah to modernize their plantations.",
          imageUrl: "",
          achievementDate: new Date("1975-06-15"),
        },
        {
          title: "10,000 Hectares Replanted Milestone",
          description: "A major milestone was reached as LIGS successfully facilitated the replanting of 10,000 hectares of rubber plantations with high-yielding clones.",
          imageUrl: "",
          achievementDate: new Date("1985-03-20"),
        },
        {
          title: "Rubber Quality Laboratory Inaugurated",
          description: "LIGS inaugurated its state-of-the-art rubber quality testing laboratory, enabling certified quality assurance for Sabah's rubber exports.",
          imageUrl: "",
          achievementDate: new Date("1992-09-10"),
        },
        {
          title: "Excellence Award from State Government",
          description: "LIGS received the Excellence Award from the Sabah State Government in recognition of outstanding contributions to the development of the rubber industry and rural economy.",
          imageUrl: "",
          achievementDate: new Date("2000-08-31"),
        },
        {
          title: "Smallholder Digital Registration System Launched",
          description: "LIGS modernized its operations by launching a digital registration and management system for smallholders, streamlining subsidy distribution and data management.",
          imageUrl: "",
          achievementDate: new Date("2010-04-01"),
        },
        {
          title: "200,000 Smallholders Registered",
          description: "LIGS achieved the landmark of 200,000 registered smallholders under its programmes, reflecting its deep reach into Sabah's rural communities.",
          imageUrl: "",
          achievementDate: new Date("2018-12-01"),
        },
        {
          title: "Sustainable Rubber Initiative Partnership",
          description: "LIGS entered a strategic partnership with international organizations to promote sustainable rubber practices, including environmentally responsible tapping techniques and fair trade certification.",
          imageUrl: "",
          achievementDate: new Date("2022-07-15"),
        },
        {
          title: "LIGS Data Portal Goes Live",
          description: "The LIGS Data Portal was launched, providing real-time rubber price data, industry statistics, and online services for smallholders and stakeholders.",
          imageUrl: "",
          achievementDate: new Date("2024-01-15"),
        },
        {
          title: "Best Government Agency Award 2025",
          description: "LIGS was named Best Government Agency at the Sabah Public Service Awards 2025, recognized for innovation, transparency, and impactful community programmes.",
          imageUrl: "",
          achievementDate: new Date("2025-11-20"),
        },
      ],
    })
    console.log("  Achievements seeded")
  } else {
    console.log("  Achievements skipped (already have " + achievementCount + " rows)")
  }

  // 8. Landing content + highlights — only seed if empty
  const landingCount = await prisma.landingContent.count()
  if (landingCount === 0) {
    const landing = await prisma.landingContent.create({
      data: {
        heroTitle: "Building the Future Together",
        heroTitleMs: "Membina Masa Depan Bersama",
        heroSubtitle: "We deliver innovative solutions that transform businesses and drive sustainable growth across industries.",
        heroSubtitleMs: "Kami menyampaikan penyelesaian inovatif yang mengubah perniagaan dan memacu pertumbuhan mampan merentas industri.",
        highlights: {
          create: [
            {
              title: "Expert Team",
              titleMs: "Pasukan Pakar",
              description: "Our team of seasoned professionals brings decades of combined experience to deliver exceptional results.",
              descriptionMs: "Pasukan profesional berpengalaman kami membawa pengalaman gabungan berdekad untuk menyampaikan hasil yang luar biasa.",
              icon: "users",
              sortOrder: 0,
            },
            {
              title: "Innovative Solutions",
              titleMs: "Penyelesaian Inovatif",
              description: "We leverage cutting-edge technology to create solutions that are both practical and forward-thinking.",
              descriptionMs: "Kami memanfaatkan teknologi canggih untuk mencipta penyelesaian yang praktikal dan berpandangan jauh.",
              icon: "lightbulb",
              sortOrder: 1,
            },
            {
              title: "Proven Results",
              titleMs: "Hasil Terbukti",
              description: "With a track record of successful projects, we consistently exceed our clients' expectations.",
              descriptionMs: "Dengan rekod projek yang berjaya, kami secara konsisten melampaui jangkaan pelanggan kami.",
              icon: "chart",
              sortOrder: 2,
            },
          ],
        },
      },
    })
    console.log("  Landing content seeded (id: " + landing.id + ")")
  } else {
    console.log("  Landing skipped (already have " + landingCount + " rows)")
  }

  // Bahagian — only seed if empty
  const bahagianCount = await prisma.bahagian.count()
  if (bahagianCount === 0) {
    const bahagianData = [
      { name: "Ahli Lembaga Pengarah", slug: "ahli-lembaga-pengarah", orderIndex: 0 },
      { name: "Bahagian Pengurus Besar", slug: "bahagian-pengurus-besar", orderIndex: 1 },
      { name: "Bahagian Pentadbiran", slug: "bahagian-pentadbiran", orderIndex: 2 },
      { name: "Bahagian Pembelian Getah", slug: "bahagian-pembelian-getah", orderIndex: 3 },
      { name: "Bahagian Kemajuan Pekebun Kecil", slug: "bahagian-kemajuan-pekebun-kecil", orderIndex: 4 },
      { name: "Bahagian Kewangan", slug: "bahagian-kewangan", orderIndex: 5 },
      { name: "Bahagian Skim Penempatan Getah", slug: "bahagian-skim-penempatan-getah", orderIndex: 6 },
      { name: "Bahagian Pemprosesan dan Pemasaran", slug: "bahagian-pemprosesan-pemasaran", orderIndex: 7 },
    ]
    for (const b of bahagianData) {
      await prisma.bahagian.upsert({
        where: { slug: b.slug },
        update: {},
        create: {
          name: b.name,
          slug: b.slug,
          shortDescription: `${b.name} - Maklumat akan dikemaskini.`,
          content: `<p>Kandungan untuk ${b.name} akan dikemaskini melalui CMS.</p>`,
          orderIndex: b.orderIndex,
          status: "published",
        },
      })
    }
    console.log("  Bahagian seeded (" + bahagianData.length + " entries)")
  } else {
    console.log("  Bahagian skipped (already have " + bahagianCount + " rows)")
  }

  // DirectoryBahagian — fixed list for Direktori page (seed if empty)
  const dirBahagianCount = await prisma.directoryBahagian.count()
  if (dirBahagianCount === 0) {
    const dirBahagianData = [
      { name: "Pejabat Pengurus Besar", orderIndex: 0 },
      { name: "Bahagian Pentadbiran", orderIndex: 1 },
      { name: "Bahagian Kemajuan Pekebun Kecil", orderIndex: 2 },
      { name: "Bahagian Kewangan", orderIndex: 3 },
      { name: "Bahagian Skim Penempatan Getah", orderIndex: 4 },
      { name: "Bahagian Pembelian Getah", orderIndex: 5 },
      { name: "Bahagian Pemprosesan dan Pemasaran Getah", orderIndex: 6 },
    ]
    await prisma.directoryBahagian.createMany({ data: dirBahagianData })
    console.log("  DirectoryBahagian seeded (" + dirBahagianData.length + " entries)")
  } else {
    console.log("  DirectoryBahagian skipped (already have " + dirBahagianCount + " rows)")
  }

  // Ensure SiteSettings exists; set lastUpdated only when creating or when null
  const now = new Date()
  const existingSettings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } })
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: { id: "singleton", themeId: "default", lastUpdated: now },
    })
  } else if (!existingSettings.lastUpdated) {
    await prisma.siteSettings.update({
      where: { id: "singleton" },
      data: { lastUpdated: now },
    })
  }
  console.log("  SiteSettings OK")

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
