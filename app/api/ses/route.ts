import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch("https://data.ligs.gov.my/ses", {
      next: { revalidate: 300 }, // cache for 5 minutes
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from upstream" },
        { status: 502 },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch SES price data" },
      { status: 502 },
    )
  }
}
