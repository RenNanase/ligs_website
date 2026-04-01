"use client"

import { useState, useEffect, useCallback } from "react"
import { api, type KelabSukanPresidentItem, type KelabSukanPresidentInput } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { GripVertical, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

function formatPeriod(start: string, end: string | null) {
  const s = new Date(start).getFullYear()
  if (!end) return `${s} - Present`
  const e = new Date(end).getFullYear()
  return `${s} - ${e}`
}

function SortablePresidentRow({
  president,
  onEdit,
  onDelete,
}: {
  president: KelabSukanPresidentItem
  onEdit: (p: KelabSukanPresidentItem) => void
  onDelete: (p: KelabSukanPresidentItem) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: president.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none rounded p-1.5 text-muted-foreground hover:bg-accent/20 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
        {president.imageUrl ? (
          <img src={president.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            ?
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-card-foreground">{president.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatPeriod(president.startDate, president.endDate)}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onEdit(president)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-destructive hover:text-destructive"
          onClick={() => onDelete(president)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function KelabSukanPresidentsSection() {
  const [presidents, setPresidents] = useState<KelabSukanPresidentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<KelabSukanPresidentItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<KelabSukanPresidentItem | null>(null)
  const [form, setForm] = useState<KelabSukanPresidentInput>({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: null,
    imageUrl: "",
    description: "",
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await api.getKelabSukanPresidents()
      setPresidents(list)
    } catch (err) {
      toast.error("Failed to load presidents")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = presidents.findIndex((p) => p.id === active.id)
    const newIndex = presidents.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const next = arrayMove(presidents, oldIndex, newIndex)
    setPresidents(next)
    api.reorderKelabSukanPresidents(next.map((p) => p.id)).then(() => {
      toast.success("Order updated")
    }).catch(() => toast.error("Failed to reorder"))
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!form.imageUrl.trim()) {
      toast.error("Image is required")
      return
    }
    setSaving(true)
    try {
      const data: KelabSukanPresidentInput = {
        ...form,
        description: form.description?.trim() || null,
        endDate: form.endDate?.trim() || null,
      }
      if (isNew) {
        await api.createKelabSukanPresident(data)
        toast.success("President added")
      } else if (editing) {
        await api.updateKelabSukanPresident(editing.id, data)
        toast.success("President updated")
      }
      setEditing(null)
      setIsNew(false)
      setForm({
        name: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: null,
        imageUrl: "",
        description: "",
      })
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await api.deleteKelabSukanPresident(deleteTarget.id)
      toast.success("President removed")
      setDeleteTarget(null)
      load()
    } catch {
      toast.error("Failed to delete")
    }
  }

  const showForm = editing || isNew

  return (
    <div className="space-y-6">
      {/* Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-card-foreground">
              {isNew ? "Add President" : "Edit President"}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => { setEditing(null); setIsNew(false) }}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="President name"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date (leave empty for Present)</Label>
              <Input
                type="date"
                value={form.endDate ?? ""}
                onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                label="Photo * (square/circular crop recommended)"
                aspectRatio="square"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description (optional)</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Short bio or notes..."
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
            <Button variant="outline" onClick={() => { setEditing(null); setIsNew(false) }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Timeline list */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-card-foreground">
            President Timeline
          </h2>
          {!showForm && (
            <Button onClick={() => { setIsNew(true); setEditing(null); setForm({
              name: "",
              startDate: new Date().toISOString().split("T")[0],
              endDate: null,
              imageUrl: "",
              description: "",
            }) }} className="gap-2">
              <Plus className="h-4 w-4" />
              Add President
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : presidents.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            No president history added yet. Click &quot;Add President&quot; to add the first entry.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={presidents.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {presidents.map((president) => (
                  <SortablePresidentRow
                    key={president.id}
                    president={president}
                    onEdit={(p) => {
                      setEditing(p)
                      setIsNew(false)
                      setForm({
                        name: p.name,
                        startDate: p.startDate,
                        endDate: p.endDate,
                        imageUrl: p.imageUrl,
                        description: p.description ?? "",
                      })
                    }}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove president?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove &quot;{deleteTarget?.name}&quot; from the timeline. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
