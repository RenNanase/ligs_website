"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import type { Tender } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { useState } from "react"

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: "bg-emerald-500",
    closed: "bg-muted-foreground",
    awarded: "bg-amber-500",
  }
  return <span className={`inline-block h-2 w-2 rounded-full ${colors[status] || colors.closed}`} />
}

export default function AdminTendersPage() {
  const { t } = useLanguage()
  const { tenders, setTenders } = useDataStore()
  const [editing, setEditing] = useState<Tender | null>(null)
  const [isNew, setIsNew] = useState(false)

  const handleAdd = () => {
    setIsNew(true)
    setEditing({
      id: Date.now().toString(),
      title: "",
      titleMs: "",
      referenceNo: "",
      closingDate: "",
      publishDate: new Date().toISOString().split("T")[0],
      status: "open",
      category: "",
    })
  }

  const handleSave = () => {
    if (!editing) return
    if (isNew) {
      setTenders([...tenders, editing])
    } else {
      setTenders(tenders.map((t) => (t.id === editing.id ? editing : t)))
    }
    setEditing(null)
    setIsNew(false)
  }

  const handleDelete = (id: string) => {
    setTenders(tenders.filter((t) => t.id !== id))
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.tenders")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {tenders.length} tenders total &middot; {tenders.filter((t) => t.status === "open").length} open
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          {t("admin.add")}
        </Button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              {isNew ? "New Tender" : "Edit Tender"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setEditing(null); setIsNew(false) }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title (EN)</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Title (BM)</Label>
              <Input
                value={editing.titleMs}
                onChange={(e) => setEditing({ ...editing, titleMs: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Reference No.</Label>
              <Input
                value={editing.referenceNo}
                onChange={(e) => setEditing({ ...editing, referenceNo: e.target.value })}
                placeholder="e.g. TEND/2026/001"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="e.g. Supply, Construction, IT Services"
              />
            </div>
            <div className="space-y-2">
              <Label>Publish Date</Label>
              <Input
                type="date"
                value={editing.publishDate}
                onChange={(e) => setEditing({ ...editing, publishDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Closing Date</Label>
              <Input
                type="date"
                value={editing.closingDate}
                onChange={(e) => setEditing({ ...editing, closingDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Status</Label>
              <div className="flex gap-4">
                {(["open", "closed", "awarded"] as const).map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="status"
                      checked={editing.status === s}
                      onChange={() => setEditing({ ...editing, status: s })}
                      className="accent-primary"
                    />
                    <StatusDot status={s} />
                    {t(`tenders.status.${s}`)}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {t("admin.save")}
            </Button>
            <Button variant="outline" className="bg-transparent" onClick={() => { setEditing(null); setIsNew(false) }}>
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-xl border border-border bg-card">
        {tenders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No tenders yet.
          </div>
        ) : (
          tenders
            .sort((a, b) => {
              const statusOrder: Record<string, number> = { open: 0, closed: 1, awarded: 2 }
              return (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1)
            })
            .map((item, index) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-4 p-5 ${
                  index < tenders.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <StatusDot status={item.status} />
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.referenceNo}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="text-xs capitalize text-muted-foreground">
                      {item.status}
                    </span>
                  </div>
                  <p className="font-medium text-card-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Closing: {item.closingDate}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditing(item); setIsNew(false) }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
        )}
      </div>
    </AdminLayout>
  )
}
