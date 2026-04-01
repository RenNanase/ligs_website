"use client"

import { useLanguage } from "@/lib/language-context"
import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface DayData {
  day: number
  lateks: number
  kepingan1: number
  kepingan2: number
  kentalan1: number
  kentalan2: number
  sekerap: number
}

const GRADE_KEYS = [
  { key: "lateks", color: "hsl(var(--primary))" },
  { key: "kepingan1", color: "hsl(142, 71%, 45%)" },
  { key: "kepingan2", color: "hsl(262, 83%, 58%)" },
  { key: "kentalan1", color: "hsl(24, 95%, 53%)" },
  { key: "kentalan2", color: "hsl(350, 89%, 60%)" },
  { key: "sekerap", color: "hsl(200, 18%, 46%)" },
]

type GradeKey = keyof Omit<DayData, "day">

function computeHighLow(data: DayData[]): {
  key: GradeKey
  highest: number
  lowest: number
  highestDay: number
  lowestDay: number
}[] {
  if (data.length === 0) return []
  const grades: GradeKey[] = ["lateks", "kepingan1", "kepingan2", "kentalan1", "kentalan2", "sekerap"]
  return grades.map((key) => {
    let highest = -Infinity
    let lowest = Infinity
    let highestDay = 0
    let lowestDay = 0
    for (const row of data) {
      const v = row[key]
      if (v > highest) {
        highest = v
        highestDay = row.day
      }
      if (v < lowest) {
        lowest = v
        lowestDay = row.day
      }
    }
    return {
      key,
      highest: highest === -Infinity ? 0 : highest,
      lowest: lowest === Infinity ? 0 : lowest,
      highestDay,
      lowestDay,
    }
  })
}

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 3 }, (_, i) => CURRENT_YEAR - i)

function getMonthLabel(month: number, language: string): string {
  const date = new Date(2000, month - 1, 1)
  return date.toLocaleDateString(language === "en" ? "en-MY" : "ms-MY", {
    month: "long",
  })
}

export function MonthlyRubberPriceSection() {
  const { language, t } = useLanguage()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [chartData, setChartData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [yearOpen, setYearOpen] = useState(false)
  const [monthOpen, setMonthOpen] = useState(false)
  const yearRef = useRef<HTMLDivElement>(null)
  const monthRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/rubber-price/monthly?year=${year}&month=${month}`)
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error ?? "Come back later")
        }
        return json
      })
      .then((json) => {
        if (cancelled) return
        setChartData(json.data ?? [])
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("rubber.error"))
          setChartData([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [year, month])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        yearRef.current &&
        !yearRef.current.contains(e.target as Node) &&
        monthRef.current &&
        !monthRef.current.contains(e.target as Node)
      ) {
        setYearOpen(false)
        setMonthOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const monthLabel = getMonthLabel(month, language)
  const highLowData = computeHighLow(chartData)

  return (
    <section className="bg-primary-bg py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="mb-6 font-heading text-3xl font-bold text-foreground md:text-4xl">
            {t("rubberMonthly.title")}
          </h2>

          {/* Year & Month Selectors */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Year */}
            <div className="relative" ref={yearRef}>
              <button
                onClick={() => {
                  setYearOpen(!yearOpen)
                  setMonthOpen(false)
                }}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent/20"
              >
                {year}
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${yearOpen ? "rotate-180" : ""}`}
                />
              </button>
              {yearOpen && (
                <div className="absolute left-1/2 z-20 mt-1 max-h-60 w-24 -translate-x-1/2 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => {
                        setYear(y)
                        setYearOpen(false)
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent/20 ${
                        y === year ? "bg-primary/10 font-medium text-primary" : "text-foreground"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Month */}
            <div className="relative" ref={monthRef}>
              <button
                onClick={() => {
                  setMonthOpen(!monthOpen)
                  setYearOpen(false)
                }}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent/20"
              >
                {monthLabel}
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${monthOpen ? "rotate-180" : ""}`}
                />
              </button>
              {monthOpen && (
                <div className="absolute left-1/2 z-20 mt-1 max-h-60 w-44 -translate-x-1/2 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                  {MONTHS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMonth(m)
                        setMonthOpen(false)
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent/20 ${
                        m === month ? "bg-primary/10 font-medium text-primary" : "text-foreground"
                      }`}
                    >
                      {getMonthLabel(m, language)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
          {loading ? (
            <div className="flex h-[350px] w-full items-center justify-center sm:h-[400px]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex h-[350px] w-full flex-col items-center justify-center gap-2 text-muted-foreground sm:h-[400px]">
              <p>{error}</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-[350px] w-full flex-col items-center justify-center gap-2 text-muted-foreground sm:h-[400px]">
              <p>{t("rubber.noData")}</p>
            </div>
          ) : (
            <>
              <div className="h-[350px] w-full sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      domain={["auto", "auto"]}
                      label={{
                        value: "RM/kg",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      labelFormatter={(day) =>
                        `${t("rubberMonthly.day")} ${day}`
                      }
                      formatter={(value: number, name: string) => [
                        `RM ${value.toFixed(2)}`,
                        t(`rubber.${name}`),
                      ]}
                    />
                    <Legend
                      formatter={(value: string) => t(`rubber.${value}`)}
                      wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                    />
                    {GRADE_KEYS.map(({ key, color }) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 3, fill: color }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Highest & Lowest Price Summary */}
              {highLowData.length > 0 && (
                <div className="mt-6 border-t border-border pt-6">
                  <h4 className="mb-4 text-center text-sm font-semibold text-foreground">
                    {t("rubberMonthly.priceRange")} {monthLabel} {year}
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full min-w-[400px] text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-3 py-2.5 text-left font-semibold text-foreground">
                            {t("rubber.grade")}
                          </th>
                          <th className="px-3 py-2.5 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                            {t("rubberMonthly.highest")}
                          </th>
                          <th className="px-3 py-2.5 text-center font-semibold text-amber-600 dark:text-amber-400">
                            {t("rubberMonthly.lowest")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {highLowData.map(({ key, highest, lowest, highestDay, lowestDay }) => (
                          <tr key={key} className="hover:bg-muted/20">
                            <td className="px-3 py-2.5 font-medium text-foreground">
                              {t(`rubber.${key}`)}
                            </td>
                            <td className="px-3 py-2.5 text-center tabular-nums text-emerald-600 dark:text-emerald-400">
                              RM {highest.toFixed(2)}
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                ({t("rubberMonthly.day")} {highestDay})
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center tabular-nums text-amber-600 dark:text-amber-400">
                              RM {lowest.toFixed(2)}
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                ({t("rubberMonthly.day")} {lowestDay})
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Source */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {t("rubber.source")}
        </p>
      </div>
    </section>
  )
}
