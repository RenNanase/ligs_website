"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore, type TeamMember } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2, X, User } from "lucide-react"
import { useState } from "react"

const emptyMember: Omit<TeamMember, "id"> = {
  name: "",
  role: "",
  roleMs: "",
  bio: "",
  bioMs: "",
  image: "",
}

export default function AdminTeamPage() {
  const { t } = useLanguage()
  const { team, setTeam } = useDataStore()
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState(emptyMember)

  const handleCreate = () => {
    const newMember: TeamMember = {
      ...form,
      id: Date.now().toString(),
    }
    setTeam([...team, newMember])
    setCreating(false)
    setForm(emptyMember)
  }

  const handleUpdate = () => {
    if (!editing) return
    setTeam(
      team.map((m) =>
        m.id === editing.id ? { ...editing, ...form } : m
      )
    )
    setEditing(null)
    setForm(emptyMember)
  }

  const handleDelete = (id: string) => {
    setTeam(team.filter((m) => m.id !== id))
  }

  const startEdit = (member: TeamMember) => {
    setEditing(member)
    setCreating(false)
    setForm({
      name: member.name,
      role: member.role,
      roleMs: member.roleMs,
      bio: member.bio,
      bioMs: member.bioMs,
      image: member.image,
    })
  }

  const cancelForm = () => {
    setEditing(null)
    setCreating(false)
    setForm(emptyMember)
  }

  const showForm = creating || editing

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.team")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {team.length} members
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setCreating(true)
              setEditing(null)
              setForm(emptyMember)
            }}
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("admin.add")}
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              {editing ? t("admin.edit") : t("admin.add")} - Team Member
            </h2>
            <Button variant="ghost" size="sm" onClick={cancelForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                {t("admin.name")}
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                {t("admin.role")} (EN)
              </Label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="bg-background"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                {t("admin.role")} (BM)
              </Label>
              <Input
                value={form.roleMs}
                onChange={(e) => setForm({ ...form, roleMs: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                {t("admin.bio")} (EN)
              </Label>
              <Textarea
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="bg-background"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2 block text-sm font-medium text-card-foreground">
                {t("admin.bio")} (BM)
              </Label>
              <Textarea
                rows={3}
                value={form.bioMs}
                onChange={(e) => setForm({ ...form, bioMs: e.target.value })}
                className="bg-background"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={editing ? handleUpdate : handleCreate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("admin.save")}
            </Button>
            <Button variant="outline" onClick={cancelForm}>
              {t("admin.cancel")}
            </Button>
          </div>
        </div>
      )}

      {/* Team Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {team.map((member) => (
          <div
            key={member.id}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-card-foreground">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit(member)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(member.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {team.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No team members yet.
        </div>
      )}
    </AdminLayout>
  )
}
