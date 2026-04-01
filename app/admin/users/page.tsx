"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, KeyRound } from "lucide-react"
import { CMS_MODULES, MODULE_LABELS } from "@/lib/permissions"
import { toast } from "sonner"

interface UserRecord {
  id: string
  email: string
  name: string | null
  role: string
  allowedModules: string[] | null
  createdAt: string
}

export default function AdminUsersPage() {
  const { t } = useLanguage()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UserRecord | null>(null)
  const [saving, setSaving] = useState(false)
  const [resetModal, setResetModal] = useState<{ user: UserRecord; link?: string; emailSent?: boolean } | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "user" as "admin" | "user" | "author" | "publisher",
    allowedModules: [] as string[],
  })

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => fetchUsers(), [])

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
      name: "",
      role: "user",
      allowedModules: [],
    })
    setEditing(null)
    setModalOpen(false)
  }

  const handleEdit = (u: UserRecord) => {
    setEditing(u)
    setForm({
      email: u.email,
      password: "",
      name: u.name ?? "",
      role: u.role as "admin" | "user" | "author" | "publisher",
      allowedModules: Array.isArray(u.allowedModules) ? u.allowedModules : [],
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const body: Record<string, unknown> = {
          email: form.email,
          name: form.name || null,
          role: form.role,
          allowedModules:
            form.role === "user" ? form.allowedModules : form.role === "author" || form.role === "publisher" ? ["news"] : [],
        }
        if (form.password) body.password = form.password
        const res = await fetch(`/api/admin/users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? "Failed")
        }
        toast.success("User updated")
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            name: form.name || null,
            role: form.role,
            allowedModules:
            form.role === "user" ? form.allowedModules : form.role === "author" || form.role === "publisher" ? ["news"] : [],
          }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? "Failed")
        }
        toast.success("User created")
      }
      resetForm()
      fetchUsers()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed")
    } finally {
      setSaving(false)
    }
  }

  const handleRequestReset = async (u: UserRecord) => {
    setResetModal({ user: u })
    setResetLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${u.id}/request-reset`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed")
      setResetModal((m) => m ? { ...m, link: data.resetLink, emailSent: data.emailSent } : null)
      toast.success(data.emailSent ? "Reset link sent to user email" : "Reset link generated")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed")
      setResetModal(null)
    } finally {
      setResetLoading(false)
    }
  }

  const copyResetLink = () => {
    if (resetModal?.link) {
      navigator.clipboard.writeText(resetModal.link)
      toast.success("Link copied to clipboard")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed")
      }
      toast.success("User deleted")
      fetchUsers()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed")
    }
  }

  const toggleModule = (mod: string) => {
    setForm((f) => ({
      ...f,
      allowedModules: f.allowedModules.includes(mod)
        ? f.allowedModules.filter((m) => m !== mod)
        : [...f.allowedModules, mod],
    }))
  }

  return (
    <AdminLayout>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t("admin.manage.users")}</h1>
          <Button
            onClick={() => {
              setForm({ email: "", password: "", name: "", role: "user", allowedModules: [] })
              setEditing(null)
              setModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Modules</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        u.role === "admin" ? "bg-primary/20 text-primary" :
                        u.role === "publisher" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        u.role === "author" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.role === "admin" ? "All" : u.role === "author" ? "News (create/edit/delete, no publish)" : u.role === "publisher" ? "News (edit/delete/publish)" : (Array.isArray(u.allowedModules) ? u.allowedModules.join(", ") || "None" : "None")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRequestReset(u)}
                        disabled={resetLoading}
                        title="Reset Password"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={modalOpen} onOpenChange={(o) => !o && resetForm()}>
          <DialogContent className="max-w-lg border-0 bg-white p-0 shadow-xl sm:rounded-2xl">
            <div className="border-b border-gray-100 bg-white px-8 pt-8 pb-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  {editing ? "Edit User" : "Add User"}
                </DialogTitle>
              </DialogHeader>
            </div>
            <form onSubmit={handleSubmit} className="px-8 pb-8 pt-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    disabled={!!editing}
                    className="h-11 border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {editing ? "New Password (optional)" : "Password"}
                  </Label>
                  <PasswordInput
                    id="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required={!editing}
                    minLength={6}
                    className="h-11 border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-11 border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Role</Label>
                  <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3 sm:grid-cols-4">
                    <label className="flex cursor-pointer flex-col gap-1 rounded-md border border-transparent px-4 py-2.5 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary">
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === "admin"}
                        onChange={() => setForm((f) => ({ ...f, role: "admin", allowedModules: [] }))}
                        className="border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Admin</span>
                      <span className="text-xs text-gray-500">Full access</span>
                    </label>
                    <label className="flex cursor-pointer flex-col gap-1 rounded-md border border-transparent px-4 py-2.5 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary">
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === "publisher"}
                        onChange={() => setForm((f) => ({ ...f, role: "publisher", allowedModules: [] }))}
                        className="border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Publisher</span>
                      <span className="text-xs text-gray-500">Edit, delete, publish berita</span>
                    </label>
                    <label className="flex cursor-pointer flex-col gap-1 rounded-md border border-transparent px-4 py-2.5 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary">
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === "author"}
                        onChange={() => setForm((f) => ({ ...f, role: "author", allowedModules: [] }))}
                        className="border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">Author</span>
                      <span className="text-xs text-gray-500">Create, edit, delete berita (no publish)</span>
                    </label>
                    <label className="flex cursor-pointer flex-col gap-1 rounded-md border border-transparent px-4 py-2.5 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary">
                      <input
                        type="radio"
                        name="role"
                        checked={form.role === "user"}
                        onChange={() => setForm((f) => ({ ...f, role: "user" }))}
                        className="border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">User</span>
                      <span className="text-xs text-gray-500">Select modules</span>
                    </label>
                  </div>
                </div>
                {form.role === "user" && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Allowed Modules</Label>
                    <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50/30 p-4">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-3">
                        {CMS_MODULES.map((mod) => (
                          <label
                            key={mod}
                            className="flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 text-sm hover:bg-white/60"
                          >
                            <input
                              type="checkbox"
                              checked={form.allowedModules.includes(mod)}
                              onChange={() => toggleModule(mod)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            {MODULE_LABELS[mod]}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm} className="border-gray-200">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="min-w-[100px]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!resetModal} onOpenChange={(o) => !o && setResetModal(null)}>
          <DialogContent className="max-w-md border-0 bg-white shadow-xl sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            {resetLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : resetModal?.link ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {resetModal.emailSent
                    ? `Reset link sent to ${resetModal.user.email}`
                    : `Share this link with ${resetModal.user.email} (email not configured):`}
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={resetModal.link}
                    className="font-mono text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={copyResetLink}>
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Link expires in 24 hours. User must open it and set a new password.
                </p>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
