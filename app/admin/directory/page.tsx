"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, Plus, X, Loader2 } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

const UNIT_CAWANGAN_NONE = "__none__"

const UNIT_CAWANGAN_OPTIONS = [
  "UNIT TEKNOLOGI MAKLUMAT",
  "PEMBANTU KHAS",
  "UNIT AUDIT DALAMAN",
  "UNIT KENDERAAN/UNIT INFRASTRUKTUR",
  "UNIT PENGURUSAN ASET",
  "UNIT REKOD/PEJABAT AM",
  "UNIT INTEGRITI & KOMPETENSI",
  "UNIT SUMBER MANUSIA",
  "WILAYAH PEDALAMAN (PDN)",
  "WILAYAH PANTAI BARAT UTARA (PBU)",
  "WILAYAH PANTAI BARAT SELATAN (PBS)",
  "PROGRAM KHAS & TANAMAN HASIL BAHARU",
  "RSS/RSIF",
  "KAUNTER & PERBANKAN",
  "EMOLUMEN",
  "UNIT REKOD KEWANGAN",
  "KPK-NKEA/HIP/MESEJ",
  "AKAUN PEMBELIAN DAN PEMASARAN",
  "AKAUN IBU PEJABAT",
  "AKTIVITI EKONOMI TAMBAHAN (AET)",
  "OPERASI",
  "IBU PEJABAT",
  "PERKERANIAN",
  "PRE-SHIPMENT",
  "POST-SHIPMENT",
  "SHIPPING",
]

interface DirectoryMember {
  id: string
  name: string
  jawatan: string
  unitCawangan: string | null
  noTelefon: string
  email: string
  imageUrl: string
  orderIndex: number
}

interface DirectoryBahagian {
  id: string
  name: string
  orderIndex: number
  members: DirectoryMember[]
}

function SortableMemberRow({
  member,
  onEdit,
  onDelete,
  t,
}: {
  member: DirectoryMember
  onEdit: (m: DirectoryMember) => void
  onDelete: (m: DirectoryMember) => void
  t: (k: string) => string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: member.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border-b border-border transition-colors last:border-b-0 ${isDragging ? "opacity-50 bg-muted/50" : ""}`}
    >
      {/* Mobile: card layout */}
      <div className="flex items-center gap-3 rounded-lg bg-white p-4 md:hidden">
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none rounded p-1.5 text-muted-foreground hover:bg-accent/20 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={t("directory.reorder")}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <img
          src={member.imageUrl}
          alt=""
          className="h-12 w-12 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">{member.name}</p>
          <p className="text-sm text-muted-foreground truncate">{member.jawatan}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => onEdit(member)}
            aria-label={t("directory.editMember")}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-destructive hover:text-destructive"
            onClick={() => onDelete(member)}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop: table row */}
      <div className="hidden grid-cols-[40px_64px_1fr_1fr_1fr_1fr_minmax(180px,1fr)_96px] gap-0 items-center md:grid bg-white transition-colors hover:bg-muted/50">
        <div className="px-3 py-2">
          <button
            type="button"
            className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-accent/20 hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label={t("directory.reorder")}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
        <div className="px-3 py-2">
          <img
            src={member.imageUrl}
            alt=""
            className="h-12 w-12 rounded-full object-cover"
          />
        </div>
        <div className="px-3 py-2 font-medium text-foreground">{member.name}</div>
        <div className="px-3 py-2 text-sm text-muted-foreground">{member.jawatan}</div>
        <div className="px-3 py-2 text-sm text-muted-foreground">{member.unitCawangan || "-"}</div>
        <div className="px-3 py-2 text-sm text-muted-foreground">{member.noTelefon}</div>
        <div className="px-3 py-2 text-sm text-muted-foreground truncate max-w-[180px]">
          {member.email}
        </div>
        <div className="px-3 py-2">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(member)}
              aria-label={t("directory.editMember")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(member)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDirectoryPage() {
  const { t } = useLanguage()
  const [bahagian, setBahagian] = useState<DirectoryBahagian[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<DirectoryMember | null>(null)
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [expandedBahagian, setExpandedBahagian] = useState<string>("")
  const [form, setForm] = useState({
    name: "",
    jawatan: "",
    unitCawangan: "",
    noTelefon: "",
    email: "",
    imageUrl: "",
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/directory/bahagian")
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setBahagian(list)
      setExpandedBahagian((prev) => (prev && list.some((b: DirectoryBahagian) => b.id === prev) ? prev : list[0]?.id ?? ""))
    } catch {
      setBahagian([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async (event: DragEndEvent, b: DirectoryBahagian) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const members = b.members
    const oldIndex = members.findIndex((m) => m.id === active.id)
    const newIndex = members.findIndex((m) => m.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(members, oldIndex, newIndex)
    const memberIds = reordered.map((m) => m.id)

    try {
      const res = await fetch("/api/directory/members/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bahagianId: b.id, memberIds }),
      })
      if (!res.ok) throw new Error("Reorder failed")
      toast.success("Order updated")
      setExpandedBahagian(b.id)
      fetchData()
    } catch {
      toast.error("Failed to reorder")
    }
  }

  const resetForm = () => {
    setForm({
      name: "",
      jawatan: "",
      unitCawangan: "",
      noTelefon: "",
      email: "",
      imageUrl: "",
    })
    setEditing(null)
    setAddingFor(null)
  }

  const handleAdd = (bahagianId: string) => {
    resetForm()
    setAddingFor(bahagianId)
  }

  const handleEdit = (member: DirectoryMember) => {
    setAddingFor(null)
    setEditing(member)
    const emailPrefix = member.email.replace(/@sabah\.gov\.my$/i, "")
    setForm({
      name: member.name,
      jawatan: member.jawatan,
      unitCawangan: member.unitCawangan || "",
      noTelefon: member.noTelefon,
      email: emailPrefix,
      imageUrl: member.imageUrl,
    })
  }

  const handleDelete = async (member: DirectoryMember) => {
    if (!confirm(t("directory.deleteConfirm"))) return
    const bahagianToKeep = bahagian.find((b) => b.members.some((m) => m.id === member.id))?.id
    try {
      const res = await fetch(`/api/directory/members/${member.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Member deleted")
      if (bahagianToKeep) setExpandedBahagian(bahagianToKeep)
      resetForm()
      fetchData()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.jawatan.trim() || !form.noTelefon.trim() || !form.email.trim() || !form.imageUrl.trim()) {
      toast.error(t("directory.imageRequired"))
      return
    }

    setSaving(true)
    try {
      if (editing) {
        const res = await fetch(`/api/directory/members/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Update failed")
        }
        toast.success("Member updated")
      } else if (addingFor) {
        const res = await fetch("/api/directory/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, bahagianId: addingFor }),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Create failed")
        }
        toast.success("Member added")
      }
      const bahagianToKeep = addingFor ?? bahagian.find((b) => b.members.some((m) => m.id === editing?.id))?.id
      if (bahagianToKeep) setExpandedBahagian(bahagianToKeep)
      resetForm()
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.manage.directory")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage directory members by department. Drag to reorder members within each Bahagian.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={expandedBahagian}
            onValueChange={setExpandedBahagian}
          >
            {bahagian.map((b) => (
              <AccordionItem key={b.id} value={b.id} className="border-b border-border">
                <AccordionTrigger className="hover:no-underline">
                  <span className="font-semibold">{b.name}</span>
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({b.members.length} {t("directory.members")})
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {t("directory.members")}
                      </h3>
                      <Button
                        size="sm"
                        onClick={() => handleAdd(b.id)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {t("directory.addMember")}
                      </Button>
                    </div>

                    {b.members.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border bg-white py-8 text-center text-sm text-muted-foreground">
                        {t("directory.noMembers")}
                      </p>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                        {/* Header row - desktop only */}
                        <div className="hidden grid-cols-[40px_64px_1fr_1fr_1fr_1fr_minmax(180px,1fr)_96px] gap-0 border-b border-border bg-muted md:grid">
                          <div className="w-10 px-3 py-2" />
                          <div className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                            Photo
                          </div>
                          <div className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                            {t("directory.name")}
                          </div>
                          <div className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                            {t("directory.jawatan")}
                          </div>
                          <div className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                            {t("directory.unitCawangan")}
                          </div>
                          <div className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                            {t("directory.noTelefon")}
                          </div>
                          <div className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">
                            {t("directory.email")}
                          </div>
                          <div className="w-24 px-3 py-2" />
                        </div>
                        {/* Sortable rows - DndContext must wrap divs, not tbody */}
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(e) => handleDragEnd(e, b)}
                        >
                          <SortableContext
                            items={b.members.map((m) => m.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {b.members.map((m) => (
                              <SortableMemberRow
                                key={m.id}
                                member={m}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                t={t}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(editing || addingFor) && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 bg-background/80 backdrop-blur-sm"
          onClick={resetForm}
        >
          <div
            className="w-full max-h-[90vh] max-w-md rounded-t-2xl sm:rounded-xl border border-border bg-card p-6 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editing ? t("directory.editMember") : t("directory.addMember")}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm} aria-label="Close">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t("directory.name")}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="jawatan">{t("directory.jawatan")}</Label>
                <Input
                  id="jawatan"
                  value={form.jawatan}
                  onChange={(e) => setForm((f) => ({ ...f, jawatan: e.target.value }))}
                  placeholder="Pengurus"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="unitCawangan">{t("directory.unitCawangan")} ({t("directory.optional")})</Label>
                <Select
                  value={form.unitCawangan || UNIT_CAWANGAN_NONE}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, unitCawangan: v === UNIT_CAWANGAN_NONE ? "" : v }))
                  }
                >
                  <SelectTrigger id="unitCawangan" className="mt-1">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNIT_CAWANGAN_NONE}>—</SelectItem>
                    {(() => {
                      const opts = [...UNIT_CAWANGAN_OPTIONS]
                      const current = form.unitCawangan?.trim()
                      if (current && !opts.includes(current)) opts.push(current)
                      return opts.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))
                    })()}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="noTelefon">{t("directory.noTelefon")}</Label>
                <Input
                  id="noTelefon"
                  value={form.noTelefon}
                  onChange={(e) => setForm((f) => ({ ...f, noTelefon: e.target.value }))}
                  placeholder="088-xxx xxx"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">{t("directory.email")}</Label>
                <Input
                  id="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="name (saved as name@sabah.gov.my)"
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">{t("directory.emailHint")}</p>
              </div>
              <div>
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                  uploadPath="/api/directory/upload"
                  maxSize={2 * 1024 * 1024}
                  aspectRatio="square"
                  label={t("directory.imageRequired")}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
