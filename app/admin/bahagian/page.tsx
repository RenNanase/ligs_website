"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface BahagianItem {
  id: string
  name: string
  slug: string
  status: string
  updatedAt: string
}

export default function AdminBahagianListPage() {
  const router = useRouter()
  const [items, setItems] = useState<BahagianItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchItems = async (pageNum?: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(pageNum ?? page))
      params.set("limit", "20")
      if (search.trim()) params.set("search", search.trim())
      const res = await fetch(`/api/bahagian?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setItems(data.items || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch {
      setItems([])
      toast.error("Failed to load bahagian")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [page])

  const handleSearch = () => {
    setPage(1)
    fetchItems(1)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      const res = await fetch(`/api/bahagian/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete")
      }
      toast.success("Deleted successfully")
      fetchItems()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published"
    try {
      const res = await fetch(`/api/bahagian/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success(`Marked as ${newStatus}`)
      fetchItems()
    } catch {
      toast.error("Failed to update status")
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">All Bahagian</h1>
          <p className="mt-1 text-muted-foreground">{total} total</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/bahagian/carta-organisasi">
            <Button variant="outline" className="gap-2">
              Carta Organisasi Page
            </Button>
          </Link>
          <Link href="/admin/bahagian/new">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-sm"
          />
          <Button variant="outline" onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center text-muted-foreground">
            <p>No bahagian found.</p>
            <Link href="/admin/bahagian/new">
              <Button variant="outline">Add your first bahagian</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Slug</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Updated</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border last:border-0">
                      <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{item.slug}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            item.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {item.status === "published" && (
                            <Link href={`/bahagian/${item.slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" title="Preview">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            title={item.status === "published" ? "Unpublish" : "Publish"}
                          >
                            {item.status === "published" ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Link href={`/admin/bahagian/${item.id}`}>
                            <Button variant="ghost" size="sm" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item.id, item.name)}
                            title="Delete"
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
