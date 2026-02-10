import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const news = await prisma.newsArticle.findMany({
    orderBy: { date: "desc" },
  })
  return NextResponse.json(news)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.authenticated) return auth.response

  const body = await request.json()
  const article = await prisma.newsArticle.create({ data: body })
  return NextResponse.json(article, { status: 201 })
}
