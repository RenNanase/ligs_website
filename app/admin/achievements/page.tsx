"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import type { Achievement } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { Plus, Pencil, Trash2, X, Trophy, Calendar } from "lucide-react"
import { useState } from "react"

export default function AdminAchievementsPage() {
  const { t } = useLanguage()
  const { achievements, createAchievement, updateAchievement, deleteAchievement } = useDataStore()
  const [editing, setEditing] = useState<Achievement | null>(null)
  const [isNew, setIsNew] = useState(false)

  const handleAdd = () => {
    setIsNew(true)
    setEditing({
      id: "",
      title: "",
      description: "",
      imageUrl: "",
      achievementDate: new Date().toISOString().split("T")[0],
    })
  }

  const handleSave = async () => {
    if (!editing) return
    if (isNew) {
      const { id, ...data } = editing
      await createAchievement(data)
    } else {
      const { id, ...data } = editing
      await updateAchievement(editing.id, data)
    }
    setEditing(null)
    setIsNew(false)
  }

  const handleDelete = async (id: string) => {
    await deleteAchievement(id)
  }

  const sorted = [...achievements].sort(
    (a, b) => new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime()
  )

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Manage Achievements
          </h1>
          <p className="mt-1 text-muted-foreground">
            {achievements.length} achievements total
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
              {isNew ? "New Achievement" : "Edit Achievement"}
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
            <div className="space-y-2 md:col-span-2">
              <Label>Title</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Achievement title"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={4}
                placeholder="Describe the achievement..."
              />
            </div>
            <div className="space-y-2">
              <Label>Achievement Date</Label>
              <Input
                type="date"
                value={editing.achievementDate}
                onChange={(e) => setEditing({ ...editing, achievementDate: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <ImageUpload
                value={editing.imageUrl}
                onChange={(url) => setEditing({ ...editing, imageUrl: url })}
                label="Image"
                aspectRatio="video"
              />
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
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
            <Trophy className="h-8 w-8" />
            No achievements yet.
          </div>
        ) : (
          sorted.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-4 p-5 ${
                index < sorted.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-4">
                {item.imageUrl && (
                  <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border sm:block">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.achievementDate).toLocaleDateString("en-MY", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="font-medium text-card-foreground">{item.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
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
