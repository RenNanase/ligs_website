import { NextResponse } from "next/server"

const LIGS_MONTHLY_API = "https://data.ligs.gov.my/rubberpricemonthly"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const yearParam = searchParams.get("year")
  const monthParam = searchParams.get("month")

  const now = new Date()
  const year = yearParam ? Number(yearParam) : now.getFullYear()
  const month = monthParam ? Number(monthParam) : now.getMonth() + 1

  const ym = `${year}${String(month).padStart(2, "0")}`

  try {
    const res = await fetch(`${LIGS_MONTHLY_API}/${ym}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      return NextResponse.json({ year, month, data: [] })
    }

    const raw = (await res.json()) as Array<{
      tarikh: string
      lateks: string
      kepingan1: string
      kepingan2: string
      kentalan1: string
      kentalan2: string
      sekerap: string
    }>

    const data = raw.map((r) => {
      const [day] = r.tarikh.split("/").map(Number)
      return {
        day,
        lateks: parseFloat(r.lateks) || 0,
        kepingan1: parseFloat(r.kepingan1) || 0,
        kepingan2: parseFloat(r.kepingan2) || 0,
        kentalan1: parseFloat(r.kentalan1) || 0,
        kentalan2: parseFloat(r.kentalan2) || 0,
        sekerap: parseFloat(r.sekerap) || 0,
      }
    })

    return NextResponse.json({ year, month, data })
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch monthly price data", year, month, data: [] },
      { status: 502 },
    )
  }
}
