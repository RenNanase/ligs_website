import { NextResponse } from "next/server"

const TIKTOK_PROFILE_URL = "https://www.tiktok.com/@kentalansikarapsabah"
const CACHE_MAX_AGE = 3600 // 1 hour

export async function GET() {
  try {
    const url = `https://www.tiktok.com/oembed?url=${encodeURIComponent(TIKTOK_PROFILE_URL)}`
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: CACHE_MAX_AGE },
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: "TikTok oEmbed failed", status: res.status },
        { status: 502 }
      )
    }
    const data = (await res.json()) as { html?: string; title?: string }
    if (!data?.html) {
      return NextResponse.json(
        { error: "Invalid TikTok oEmbed response" },
        { status: 502 }
      )
    }
    return NextResponse.json({ html: data.html, title: data.title })
  } catch (e) {
    console.error("[tiktok-embed]", e)
    return NextResponse.json(
      { error: "Failed to fetch TikTok embed" },
      { status: 500 }
    )
  }
}
