import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/** Public GET: returns news (published only), intro, presidents for the Kelab Sukan page */
export async function GET() {
  const [news, content, presidents] = await Promise.all([
    prisma.kelabSukanNews.findMany({
      where: { status: "published" },
      orderBy: { datePosted: "desc" },
      take: 50,
    }),
    prisma.kelabSukanContent.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.kelabSukanPresident.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return NextResponse.json({
    news: news.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      featuredImage: n.featuredImage,
      datePosted: n.datePosted.toISOString().split("T")[0],
    })),
    logo: content?.logoUrl ?? null,
    intro: content?.introHtml ?? "",
    presidents: presidents.map((p) => ({
      id: p.id,
      name: p.name,
      startDate: p.startDate.toISOString().split("T")[0],
      endDate: p.endDate?.toISOString().split("T")[0] ?? null,
      imageUrl: p.imageUrl,
      description: p.description,
      sortOrder: p.sortOrder,
    })),
  })
}
