"use client"

import { useLanguage } from "@/lib/language-context"
import { useState } from "react"
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Dummy data for rubber prices
const rubberPriceData = [
  { id: 1, date: "2025-01-15", grade: "SMR 20", price: 6.45, change: 0.15 },
  { id: 2, date: "2025-01-14", grade: "SMR 20", price: 6.30, change: -0.10 },
  { id: 3, date: "2025-01-13", grade: "SMR 20", price: 6.40, change: 0.05 },
  { id: 4, date: "2025-01-12", grade: "SMR 20", price: 6.35, change: 0.20 },
  { id: 5, date: "2025-01-11", grade: "SMR 20", price: 6.15, change: -0.05 },
]

// Dummy data for monthly chart (daily prices for a selected month)
const generateMonthlyData = (month: string) => {
  const daysInMonth: Record<string, number> = {
    "2025-01": 31,
    "2025-02": 28,
    "2025-03": 31,
    "2024-12": 31,
  }

  const days = daysInMonth[month] || 30
  const data = []

  for (let day = 1; day <= days; day++) {
    const basePrice = 6.0 + Math.random() * 1.5
    data.push({
      day: day.toString(),
      date: `${month}-${day.toString().padStart(2, "0")}`,
      price: Number(basePrice.toFixed(2)),
    })
  }

  return data
}

function PriceChangeIndicator({ change }: { change: number }) {
  const isPositive = change >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown
  const colorClass = isPositive ? "text-emerald-600" : "text-red-600"
  const bgClass = isPositive ? "bg-emerald-50" : "bg-red-50"

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${bgClass} ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {isPositive ? "+" : ""}{change.toFixed(2)}
    </span>
  )
}

export function RubberPriceSection() {
  const { language, t } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState("2025-01")
  const monthlyData = generateMonthlyData(selectedMonth)

  const monthOptions = [
    { value: "2025-01", label: language === "en" ? "January 2025" : "Januari 2025" },
    { value: "2024-12", label: language === "en" ? "December 2024" : "Disember 2024" },
    { value: "2024-11", label: language === "en" ? "November 2024" : "November 2024" },
    { value: "2024-10", label: language === "en" ? "October 2024" : "Oktober 2024" },
  ]

  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-4.5 w-4.5 text-primary" />
              </div>
              <h2 className="font-heading text-3xl font-bold text-foreground md:text-4xl">
                {t("rubber.title")}
              </h2>
            </div>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
              {t("rubber.subtitle")}
            </p>
          </div>
        </div>

        {/* Price Table */}
        <div className="mb-12 overflow-hidden rounded-xl border border-border bg-card">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("rubber.date")}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("rubber.grade")}
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("rubber.price")}
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("rubber.change")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rubberPriceData.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-muted/30">
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-foreground">
                      {new Date(item.date).toLocaleDateString(
                        language === "en" ? "en-MY" : "ms-MY",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {item.grade}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <span className="text-lg font-bold text-foreground">
                        RM {item.price.toFixed(2)}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">/kg</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-center">
                      <PriceChangeIndicator change={item.change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 p-4 md:hidden">
            {rubberPriceData.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.date).toLocaleDateString(
                      language === "en" ? "en-MY" : "ms-MY",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {item.grade}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold text-foreground">
                      RM {item.price.toFixed(2)}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">/kg</span>
                  </div>
                  <PriceChangeIndicator change={item.change} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="mb-1 text-xl font-bold text-card-foreground">
                {t("rubber.chart.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("rubber.chart.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("rubber.chart.selectMonth")} />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="day"
                  label={{
                    value: language === "en" ? "Day of Month" : "Hari dalam Bulan",
                    position: "insideBottom",
                    offset: -5,
                  }}
                  className="text-xs text-muted-foreground"
                />
                <YAxis
                  label={{
                    value: "RM/kg",
                    angle: -90,
                    position: "insideLeft",
                  }}
                  className="text-xs text-muted-foreground"
                  domain={[5, 8]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`RM ${value.toFixed(2)}/kg`, t("rubber.price")]}
                  labelFormatter={(label) => `${language === "en" ? "Day" : "Hari"} ${label}`}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={() => t("rubber.chart.legend")}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
