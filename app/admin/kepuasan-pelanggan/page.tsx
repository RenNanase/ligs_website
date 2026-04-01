"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { toast } from "sonner"
import { FileSpreadsheet } from "lucide-react"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

function PelangganTab() {
  const { t } = useLanguage()
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [formOpen, setFormOpen] = useState(true)
  const [savingToggle, setSavingToggle] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [countRes, settingsRes] = await Promise.all([
          fetch("/api/kepuasan-pelanggan?count=1", { credentials: "include" }),
          fetch("/api/survey-settings", { credentials: "include" }),
        ])
        const countData = await countRes.json()
        const settingsData = await settingsRes.json()
        if (countRes.ok) setTotal(countData.count ?? 0)
        if (settingsRes.ok) setFormOpen(settingsData.pelangganOpen ?? true)
      } catch (err) {
        console.error("Failed to load pelanggan data:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleToggle = async (checked: boolean) => {
    setSavingToggle(true)
    try {
      const res = await fetch("/api/survey-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pelangganOpen: checked }),
      })
      if (res.ok) {
        setFormOpen(checked)
        toast.success(t("admin.kepuasan.toggleSaved"))
      } else {
        const json = await res.json().catch(() => ({}))
        toast.error(json.error ?? t("admin.kepuasan.toggleFailed"))
      }
    } catch {
      toast.error(t("admin.kepuasan.toggleFailed"))
    } finally {
      setSavingToggle(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch("/api/kepuasan-pelanggan?format=excel", {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `LIGS-PTN-076-Kepuasan-Pelanggan-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export error:", err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Switch
              id="pelanggan-open"
              checked={formOpen}
              onCheckedChange={handleToggle}
              disabled={savingToggle}
            />
            <Label htmlFor="pelanggan-open" className="cursor-pointer text-sm font-medium">
              {formOpen ? t("admin.kepuasan.formOpen") : t("admin.kepuasan.formClosed")}
            </Label>
          </div>
          <p className="text-muted-foreground">
            {loading ? (
              <span className="inline-block h-5 w-20 animate-pulse rounded bg-muted" />
            ) : (
              <>
                {total} {t("admin.kepuasan.submissions")}
              </>
            )}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exporting ? "..." : t("admin.kepuasan.exportExcel")}
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
        <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>
          {loading
            ? ""
            : total === 0
              ? t("admin.kepuasan.noSubmissions")
              : t("admin.kepuasan.exportHint")}
        </p>
      </div>
    </>
  )
}

function StafTab() {
  const { t } = useLanguage()
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [formOpen, setFormOpen] = useState(true)
  const [savingToggle, setSavingToggle] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [countRes, settingsRes] = await Promise.all([
          fetch("/api/kepuasan-staf?count=1", { credentials: "include" }),
          fetch("/api/survey-settings", { credentials: "include" }),
        ])
        const countData = await countRes.json()
        const settingsData = await settingsRes.json()
        if (countRes.ok) setTotal(countData.count ?? 0)
        if (settingsRes.ok) setFormOpen(settingsData.stafOpen ?? true)
      } catch (err) {
        console.error("Failed to load staf data:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleToggle = async (checked: boolean) => {
    setSavingToggle(true)
    try {
      const res = await fetch("/api/survey-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stafOpen: checked }),
      })
      if (res.ok) {
        setFormOpen(checked)
        toast.success(t("admin.kepuasan.toggleSaved"))
      } else {
        const json = await res.json().catch(() => ({}))
        toast.error(json.error ?? t("admin.kepuasan.toggleFailed"))
      }
    } catch {
      toast.error(t("admin.kepuasan.toggleFailed"))
    } finally {
      setSavingToggle(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch("/api/kepuasan-staf?format=excel", {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `LIGS-PTN-077-Kepuasan-Staf-${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export error:", err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Switch
              id="staf-open"
              checked={formOpen}
              onCheckedChange={handleToggle}
              disabled={savingToggle}
            />
            <Label htmlFor="staf-open" className="cursor-pointer text-sm font-medium">
              {formOpen ? t("admin.kepuasan.formOpen") : t("admin.kepuasan.formClosed")}
            </Label>
          </div>
          <p className="text-muted-foreground">
            {loading ? (
              <span className="inline-block h-5 w-20 animate-pulse rounded bg-muted" />
            ) : (
              <>
                {total} {t("admin.kepuasanStaf.submissions")}
              </>
            )}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exporting ? "..." : t("admin.kepuasanStaf.exportExcel")}
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
        <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>
          {loading
            ? ""
            : total === 0
              ? t("admin.kepuasanStaf.noSubmissions")
              : t("admin.kepuasanStaf.exportHint")}
        </p>
      </div>
    </>
  )
}

export default function AdminKepuasanPelangganPage() {
  const { t } = useLanguage()

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("admin.manage.kepuasanPelanggan")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("admin.kepuasan.tabsSubtitle")}
        </p>
      </div>

      <Tabs defaultValue="pelanggan" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pelanggan">
            {t("admin.kepuasan.tabPelanggan")}
          </TabsTrigger>
          <TabsTrigger value="staf">
            {t("admin.kepuasan.tabStaf")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pelanggan">
          <PelangganTab />
        </TabsContent>
        <TabsContent value="staf">
          <StafTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
