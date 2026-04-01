"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { Plus, Pencil, Trash2, X, Wrench, ExternalLink, ToggleLeft, ToggleRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"

export type PerkhidmatanSectionType = "kakitangan" | "pekebun" | "orang_awam"

export interface PerkhidmatanItem {
  id: string
  name: string
  logoPath: string
  url: string
  section: string
  isActive: boolean
  sortOrder: number
}

// Accept full URLs (http/https) or bare domains (e.g. bmt.ligs.gov.my)
const URL_REGEX = /^(https?:\/\/.+|[\w.-]+\.[a-z]{2,}(?:\/.*)?)$/i

function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return "https://" + trimmed
}

interface PerkhidmatanSectionProps {
  section: PerkhidmatanSectionType
  titleKey: string
}

export function PerkhidmatanSection({ section, titleKey }: PerkhidmatanSectionProps) {
  const { t } = useLanguage()
  const [items, setItems] = useState<PerkhidmatanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<PerkhidmatanItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [error, setError] = useState("")

  const sectionItems = items.filter((i) => i.section === section)

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/perkhidmatan/admin")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleAdd = () => {
    setIsNew(true)
    setEditing({
      id: "",
      name: "",
      logoPath: "",
      url: "",
      section,
      isActive: true,
      sortOrder: sectionItems.length,
    })
    setError("")
  }

  const validate = (item: PerkhidmatanItem): string | null => {
    if (!item.name.trim()) return "Service name is required"
    if (!item.url.trim()) return "URL is required"
    if (!URL_REGEX.test(item.url.trim())) return "Invalid URL format"
    return null
  }

  const handleSave = async () => {
    if (!editing) return
    const err = validate(editing)
    if (err) {
      setError(err)
      return
    }
    setError("")
    try {
      if (isNew) {
        const res = await fetch("/api/perkhidmatan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editing.name,
            logoPath: editing.logoPath,
            url: normalizeUrl(editing.url),
            section: editing.section,
            isActive: editing.isActive,
            sortOrder: editing.sortOrder,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to save")
        }
      } else {
        const res = await fetch(`/api/perkhidmatan/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editing.name,
            logoPath: editing.logoPath,
            url: normalizeUrl(editing.url),
            section: editing.section,
            isActive: editing.isActive,
            sortOrder: editing.sortOrder,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to save")
        }
      }
      setEditing(null)
      setIsNew(false)
      await fetchItems()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return
    try {
      const res = await fetch(`/api/perkhidmatan/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      await fetchItems()
      if (editing?.id === id) {
        setEditing(null)
        setIsNew(false)
      }
    } catch {
      setError("Failed to delete")
    }
  }

  const handleToggleActive = async (item: PerkhidmatanItem) => {
    try {
      const res = await fetch(`/api/perkhidmatan/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      })
      if (!res.ok) throw new Error("Failed to update")
      await fetchItems()
    } catch {
      setError("Failed to update")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-foreground">
          {t(titleKey)}
        </h2>
        <Button onClick={handleAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          <Plus className="h-4 w-4" />
          {t("admin.add")}
        </Button>
      </div>

      {/* Edit Form */}
      {editing && editing.section === section && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold text-card-foreground">
              {isNew ? "New Service" : "Edit Service"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setEditing(null); setIsNew(false); setError("") }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Service Name</Label>
              <Input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. e-Portal"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Logo (optional)</Label>
              <ImageUpload
                value={editing.logoPath}
                onChange={(url) => setEditing({ ...editing, logoPath: url })}
                label=""
                aspectRatio="square"
                uploadPath="/api/perkhidmatan/upload"
                maxSize={2 * 1024 * 1024}
                accept="image/jpeg,image/png,image/jpg,image/svg+xml"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>URL</Label>
              <Input
                value={editing.url}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                placeholder="https://example.com or bmt.ligs.gov.my"
              />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={editing.sortOrder}
                onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="flex items-end gap-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.isActive}
                  onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-border"
                />
                Active
              </Label>
            </div>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <div className="mt-6 flex gap-3">
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
              {t("admin.save")}
            </Button>
            <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false); setError("") }}>
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            Loading...
          </div>
        ) : sectionItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
            <Wrench className="h-8 w-8" />
            No services in this section yet. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Logo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">URL</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Order</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {sectionItems.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      {item.logoPath ? (
                        <div className="h-12 w-12 overflow-hidden rounded-lg border border-border bg-muted">
                          <img
                            src={item.logoPath}
                            alt={item.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-primary/15 text-sm font-semibold uppercase text-primary"
                          title={item.name}
                        >
                          {item.name
                            .trim()
                            .replace(/\s+/g, " ")
                            .slice(0, 2)
                            .toUpperCase() || "—"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{item.name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {item.url.length > 35 ? `${item.url.slice(0, 32)}...` : item.url}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(item)}
                        className="gap-1"
                      >
                        {item.isActive ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Inactive</span>
                          </>
                        )}
                      </Button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.sortOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditing(item); setIsNew(false); setError("") }}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
