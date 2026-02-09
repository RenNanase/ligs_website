"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { useState } from "react"

export default function AdminLandingPage() {
  const { t } = useLanguage()
  const { landing, setLanding } = useDataStore()
  const [form, setForm] = useState(landing)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setLanding(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateHighlight = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...form.highlights]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, highlights: updated })
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("admin.manage.landing")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Edit the hero section and highlights on the landing page.
        </p>
      </div>

      {/* Hero Section */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-6 font-heading text-lg font-semibold text-card-foreground">
          Hero Section
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="mb-2 block text-sm font-medium text-card-foreground">
              Hero Title (EN)
            </Label>
            <Input
              value={form.heroTitle}
              onChange={(e) =>
                setForm({ ...form, heroTitle: e.target.value })
              }
              className="bg-background"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium text-card-foreground">
              Hero Title (BM)
            </Label>
            <Input
              value={form.heroTitleMs}
              onChange={(e) =>
                setForm({ ...form, heroTitleMs: e.target.value })
              }
              className="bg-background"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-2 block text-sm font-medium text-card-foreground">
              Hero Subtitle (EN)
            </Label>
            <Textarea
              rows={3}
              value={form.heroSubtitle}
              onChange={(e) =>
                setForm({ ...form, heroSubtitle: e.target.value })
              }
              className="bg-background"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="mb-2 block text-sm font-medium text-card-foreground">
              Hero Subtitle (BM)
            </Label>
            <Textarea
              rows={3}
              value={form.heroSubtitleMs}
              onChange={(e) =>
                setForm({ ...form, heroSubtitleMs: e.target.value })
              }
              className="bg-background"
            />
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-6 font-heading text-lg font-semibold text-card-foreground">
          Highlights
        </h2>
        <div className="flex flex-col gap-6">
          {form.highlights.map((highlight, index) => (
            <div
              key={highlight.id}
              className="rounded-lg border border-border p-4"
            >
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                Highlight {index + 1}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block text-sm font-medium text-card-foreground">
                    {t("admin.title")} (EN)
                  </Label>
                  <Input
                    value={highlight.title}
                    onChange={(e) =>
                      updateHighlight(index, "title", e.target.value)
                    }
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="mb-2 block text-sm font-medium text-card-foreground">
                    {t("admin.title")} (BM)
                  </Label>
                  <Input
                    value={highlight.titleMs}
                    onChange={(e) =>
                      updateHighlight(index, "titleMs", e.target.value)
                    }
                    className="bg-background"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-2 block text-sm font-medium text-card-foreground">
                    Description (EN)
                  </Label>
                  <Textarea
                    rows={2}
                    value={highlight.description}
                    onChange={(e) =>
                      updateHighlight(index, "description", e.target.value)
                    }
                    className="bg-background"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-2 block text-sm font-medium text-card-foreground">
                    Description (BM)
                  </Label>
                  <Textarea
                    rows={2}
                    value={highlight.descriptionMs}
                    onChange={(e) =>
                      updateHighlight(
                        index,
                        "descriptionMs",
                        e.target.value
                      )
                    }
                    className="bg-background"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Save className="h-4 w-4" />
          {t("admin.save")}
        </Button>
        {saved && (
          <span className="text-sm font-medium text-primary">
            Changes saved successfully!
          </span>
        )}
      </div>
    </AdminLayout>
  )
}
