"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import type { Announcement } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { Plus, Pencil, Trash2, Pin, X, Eye, EyeOff, Link2 } from "lucide-react"
import { useState } from "react"

export default function AdminAnnouncementsPage() {
  const { t } = useLanguage()
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useDataStore()
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [isNew, setIsNew] = useState(false)

  const handleAdd = () => {
    setIsNew(true)
    setEditing({
      id: "",
      title: "",
      titleMs: "",
      summary: "",
      summaryMs: "",
      date: new Date().toISOString().split("T")[0],
      pinned: false,
      active: true,
      category: "",
      imageUrl: "",
      linkUrl: "",
      linkText: "",
      links: [],
    })
  }

  const handleSave = async () => {
    if (!editing) return
    const payload = { ...editing }
    if (Array.isArray(payload.links)) {
      payload.links = payload.links.filter((l) => (l?.url ?? "").trim() !== "")
    }
    if (isNew) {
      const { id, ...data } = payload
      await createAnnouncement(data)
    } else {
      const { id, ...data } = payload
      await updateAnnouncement(editing.id, data)
    }
    setEditing(null)
    setIsNew(false)
  }

  const handleDelete = async (id: string) => {
    await deleteAnnouncement(id)
  }

  const togglePin = async (id: string) => {
    const item = announcements.find((a) => a.id === id)
    if (item) {
      await updateAnnouncement(id, { pinned: !item.pinned })
    }
  }

  const toggleActive = async (id: string) => {
    const item = announcements.find((a) => a.id === id)
    if (item) {
      const newActive = item.active !== false ? false : true
      await updateAnnouncement(id, { active: newActive })
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.announcements")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {announcements.length} announcements total
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
          <Plus className="h-4 w-4" />
          {t("admin.add")}
        </Button>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              {isNew ? "New Announcement" : "Edit Announcement"}
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
              <Label>Summary (EN)</Label>
              <Textarea
                value={editing.summary}
                onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Summary (BM)</Label>
              <Textarea
                value={editing.summaryMs}
                onChange={(e) => setEditing({ ...editing, summaryMs: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={editing.date}
                onChange={(e) => setEditing({ ...editing, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="e.g. Notice, Policy, Training"
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label className="text-base">Links (URL + display text)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => {
                    const links = Array.isArray(editing.links) ? [...editing.links] : []
                    setEditing({ ...editing, links: [...links, { url: "", text: "" }] })
                  }}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Add link
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add one or more links. Each link has a URL and display text (what users see and click). Users can add multiple links per announcement.
              </p>
              {(Array.isArray(editing.links) ? editing.links : []).map((link, idx) => (
                <div key={idx} className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Link {idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        const links = [...(editing.links ?? [])]
                        links.splice(idx, 1)
                        setEditing({ ...editing, links })
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const links = [...(editing.links ?? [])]
                        links[idx] = { ...link, url: e.target.value }
                        setEditing({ ...editing, links })
                      }}
                      placeholder="https://example.com/document.pdf"
                    />
                    <Input
                      value={link.text}
                      onChange={(e) => {
                        const links = [...(editing.links ?? [])]
                        links[idx] = { ...link, text: e.target.value }
                        setEditing({ ...editing, links })
                      }}
                      placeholder="e.g. Click here to view"
                    />
                  </div>
                </div>
              ))}
              {(!editing.links || editing.links.length === 0) && (
                <p className="text-sm text-muted-foreground italic">No links yet. Click &quot;Add link&quot; to add one or more links.</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUpload
                label={t("admin.image")}
                value={editing.imageUrl ?? ""}
                onChange={(url) => setEditing({ ...editing, imageUrl: url })}
                uploadPath="/api/upload"
                aspectRatio="video"
              />
            </div>
            <div className="flex flex-wrap items-center gap-6 md:col-span-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.pinned}
                  onChange={(e) => setEditing({ ...editing, pinned: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary accent-primary"
                />
                Pin this announcement
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.active !== false}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary accent-primary"
                />
                {t("announcements.active")}
              </label>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
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
        {announcements.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No announcements yet.
          </div>
        ) : (
          announcements
            .sort((a, b) => {
              if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
              return new Date(b.date).getTime() - new Date(a.date).getTime()
            })
            .map((item, index) => (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-4 p-5 ${
                  index < announcements.length - 1 ? "border-b border-border" : ""
                }`}
              >
                {item.imageUrl ? (
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-14 w-20 shrink-0 rounded-lg border border-dashed border-border bg-muted/50 flex items-center justify-center text-[10px] text-muted-foreground">
                    No img
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {item.pinned && (
                      <Pin className="h-3.5 w-3.5 text-accent" />
                    )}
                    {item.active === false && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {t("announcements.inactive")}
                      </span>
                    )}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                  <p className="font-medium text-card-foreground">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{item.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(item.id)}
                    className={item.active !== false ? "text-green-600" : "text-muted-foreground"}
                    title={item.active !== false ? "Set inactive (hide from website)" : "Set active (show on website)"}
                  >
                    {item.active !== false ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePin(item.id)}
                    className={item.pinned ? "text-accent" : "text-muted-foreground"}
                    title={item.pinned ? "Unpin" : "Pin"}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const itemToEdit = { ...item }
                      if (!Array.isArray(itemToEdit.links) || itemToEdit.links.length === 0) {
                        if (itemToEdit.linkUrl?.trim()) {
                          itemToEdit.links = [{ url: itemToEdit.linkUrl, text: (itemToEdit.linkText || "Click here").trim() }]
                        } else {
                          itemToEdit.links = []
                        }
                      }
                      setEditing(itemToEdit)
                      setIsNew(false)
                    }}
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
