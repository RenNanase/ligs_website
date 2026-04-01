import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"

const SITE_URL = process.env.NEXTAUTH_URL || "https://ligs.gov.my"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Peta Laman | Sitemap | Lembaga Industri Getah Sabah",
    description:
      "Browse the complete sitemap of LIGS website. Find news, announcements, tenders, gallery, corporate info, and more.",
    openGraph: {
      title: "Peta Laman | Sitemap - LIGS",
      description: "Browse all pages on the Lembaga Industri Getah Sabah website.",
      url: `${SITE_URL}/peta-laman`,
    },
    alternates: {
      canonical: `${SITE_URL}/peta-laman`,
    },
  }
}

export default async function PetaLamanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = SITE_URL.replace(/\/$/, "")

  const sitemapUrls = [
    { url: `${baseUrl}/`, priority: 1 },
    { url: `${baseUrl}/info-korporat/tentang-kami`, priority: 0.9 },
    { url: `${baseUrl}/info-korporat/visi-misi`, priority: 0.9 },
    { url: `${baseUrl}/services`, priority: 0.9 },
    { url: `${baseUrl}/info-korporat/carta-organisasi`, priority: 0.9 },
    { url: `${baseUrl}/direktori`, priority: 0.9 },
    { url: `${baseUrl}/info-korporat/lagu-ligs`, priority: 0.8 },
    { url: `${baseUrl}/perkhidmatan`, priority: 0.9 },
    { url: `${baseUrl}/pencapaian`, priority: 0.9 },
    { url: `${baseUrl}/integriti`, priority: 0.9 },
    { url: `${baseUrl}/kakitangan`, priority: 0.9 },
    { url: `${baseUrl}/kakitangan/e-pekeliling`, priority: 0.8 },
    { url: `${baseUrl}/kakitangan/pautan-kakitangan`, priority: 0.8 },
    { url: `${baseUrl}/kelab-sukan`, priority: 0.9 },
    { url: `${baseUrl}/orang-awam`, priority: 0.9 },
    { url: `${baseUrl}/tenders`, priority: 0.9 },
    { url: `${baseUrl}/jawatan-kosong`, priority: 0.9 },
    { url: `${baseUrl}/kalender`, priority: 0.9 },
    { url: `${baseUrl}/news`, priority: 0.9 },
    { url: `${baseUrl}/announcements`, priority: 0.9 },
    { url: `${baseUrl}/gallery`, priority: 0.9 },
    { url: `${baseUrl}/penerbitan`, priority: 0.9 },
    { url: `${baseUrl}/arkib`, priority: 0.9 },
    { url: `${baseUrl}/soalan-lazim`, priority: 0.8 },
    { url: `${baseUrl}/contact`, priority: 0.9 },
    { url: `${baseUrl}/feedback`, priority: 0.8 },
    { url: `${baseUrl}/privasi`, priority: 0.7 },
    { url: `${baseUrl}/dasar-keselamatan`, priority: 0.7 },
    { url: `${baseUrl}/penafian`, priority: 0.7 },
    { url: `${baseUrl}/notis-hak-cipta`, priority: 0.7 },
  ]

  let bahagianUrls: { url: string; priority: number }[] = []
  try {
    const bahagian = await prisma.bahagian.findMany({
      where: { status: "published" },
      select: { slug: true },
    })
    bahagianUrls = bahagian.map((b) => ({
      url: `${baseUrl}/bahagian/${b.slug}`,
      priority: 0.8,
    }))
  } catch {
    // ignore
  }

  const allUrls = [...sitemapUrls, ...bahagianUrls]

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Peta Laman | Sitemap - Lembaga Industri Getah Sabah",
    description: "Complete sitemap of the LIGS website with all available pages and sections.",
    url: `${baseUrl}/peta-laman`,
    isPartOf: {
      "@type": "WebSite",
      name: "Lembaga Industri Getah Sabah",
      url: baseUrl,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: allUrls.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: item.url,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {children}
    </>
  )
}
