import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const res = await fetch("https://data.ligs.gov.my/rubberprice", {
      next: { revalidate: 300 }, // cache for 5 minutes
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from upstream" },
        { status: 502 },
      )
    }

    const data = await res.json()

    // Save daily snapshot to database (upsert by date)
    try {
      const [day, month, year] = data.tarikh.split("/")
      const date = new Date(Number(year), Number(month) - 1, Number(day))

      await prisma.rubberPriceDaily.upsert({
        where: { date },
        update: {
          lateks: parseFloat(data.lateks),
          kepingan1: parseFloat(data.kepingan1),
          kepingan2: parseFloat(data.kepingan2),
          kentalan1: parseFloat(data.kentalan1),
          kentalan2: parseFloat(data.kentalan2),
          sekerap: parseFloat(data.sekerap),
        },
        create: {
          date,
          lateks: parseFloat(data.lateks),
          kepingan1: parseFloat(data.kepingan1),
          kepingan2: parseFloat(data.kepingan2),
          kentalan1: parseFloat(data.kentalan1),
          kentalan2: parseFloat(data.kentalan2),
          sekerap: parseFloat(data.sekerap),
        },
      })
    } catch {
      // Don't fail the main response if snapshot save fails
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch rubber price data" },
      { status: 502 },
    )
  }
}
