"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { BarChart3, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function AdminStatsPage() {
  const { t } = useLanguage()
  const { stats, saveStats, isLoading } = useDataStore()
  const [editing, setEditing] = useState<{ id: string; value: number; suffix: string }[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setEditing(stats.map((s) => ({ id: s.id, value: s.value, suffix: s.suffix })))
  }, [stats])

  const handleChange = (id: string, field: "value" | "suffix", val: number | string) => {
    setEditing((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: val } : e))
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const toSave = stats.map((s, i) => {
        const ed = editing.find((e) => e.id === s.id)
        return {
          ...s,
          value: ed?.value ?? s.value,
          suffix: ed?.suffix ?? s.suffix,
        }
      })
      await saveStats(toSave)
      toast.success("Statistics updated successfully")
    } catch (e) {
      toast.error("Failed to update statistics")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading && stats.length === 0) {
    return (
      <AdminLayout>
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("admin.manage.stats")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Update the Key Statistics shown on the homepage (Statistik Utama).
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-lg font-semibold text-card-foreground">
            {t("stats.title")}
          </h2>
        </div>

        <div className="space-y-4">
          {editing.map((item) => {
            const stat = stats.find((s) => s.id === item.id)
            if (!stat) return null
            return (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:gap-6"
              >
                <label className="min-w-[140px] font-medium text-foreground sm:text-right">
                  {t(stat.labelKey)}
                </label>
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={item.value}
                    onChange={(e) =>
                      handleChange(item.id, "value", parseInt(e.target.value, 10) || 0)
                    }
                    className="w-full max-w-[200px] rounded-lg border border-border bg-background px-3 py-2 text-sm tabular-nums"
                  />
                  <input
                    type="text"
                    value={item.suffix}
                    onChange={(e) => handleChange(item.id, "suffix", e.target.value)}
                    placeholder="Suffix (e.g. %)"
                    className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
