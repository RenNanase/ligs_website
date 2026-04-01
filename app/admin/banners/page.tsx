"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { useDataStore, type BannerSlide } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Save, GripVertical } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { useState, useEffect, useRef } from "react"

export default function AdminBannersPage() {
  const { t } = useLanguage()
  const { banners, saveBanners } = useDataStore()
  const [form, setForm] = useState<BannerSlide[]>(banners)

  // Sync form with banners when data loads from API (fixes images not showing after DB has saved images)
  useEffect(() => {
    setForm(banners)
  }, [banners])
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await saveBanners(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const firstCardRef = useRef<HTMLDivElement>(null)

  const addBanner = () => {
    if (form.length >= 10) return
    const newBanner: BannerSlide = {
      id: Date.now().toString(),
      image: "",
      title: "New Banner",
      titleMs: "Banner Baru",
      caption: "Banner description goes here.",
      captionMs: "Penerangan banner di sini.",
      ctaText: "Learn More",
      ctaTextMs: "Ketahui Lebih",
      ctaLink: "/about",
    }
    setForm([newBanner, ...form])
    // Scroll to top so admin sees the new banner immediately
    setTimeout(() => firstCardRef.current?.scrollIntoView({ behavior: "smooth" }), 0)
  }

  const removeBanner = (index: number) => {
    setForm(form.filter((_, i) => i !== index))
  }

  const updateBanner = (index: number, field: string, value: string) => {
    const updated = [...form]
    updated[index] = { ...updated[index], [field]: value }
    setForm(updated)
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {t("admin.manage.banners")}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage the hero carousel banners on the homepage. Up to 10 slides supported.
          </p>
        </div>
        <Button
          onClick={addBanner}
          disabled={form.length >= 10}
          className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("admin.add")}
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {form.map((banner, index) => (
          <div
            key={banner.id}
            ref={index === 0 ? firstCardRef : undefined}
            className="rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <h3 className="font-heading text-lg font-semibold text-card-foreground">
                  Slide {index + 1}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeBanner(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <ImageUpload
                  label="Image"
                  value={banner.image}
                  onChange={(url) => updateBanner(index, "image", url)}
                  uploadPath="/api/upload"
                  maxSize={10 * 1024 * 1024}
                  aspectRatio="banner"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-card-foreground">
                  {t("admin.title")} (EN)
                </Label>
                <Input
                  value={banner.title}
                  onChange={(e) => updateBanner(index, "title", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-card-foreground">
                  {t("admin.title")} (BM)
                </Label>
                <Input
                  value={banner.titleMs}
                  onChange={(e) => updateBanner(index, "titleMs", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-card-foreground">
                  Caption (EN)
                </Label>
                <Textarea
                  rows={2}
                  value={banner.caption}
                  onChange={(e) => updateBanner(index, "caption", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-card-foreground">
                  Caption (BM)
                </Label>
                <Textarea
                  rows={2}
                  value={banner.captionMs}
                  onChange={(e) => updateBanner(index, "captionMs", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-card-foreground">
                  CTA Text (EN)
                </Label>
                <Input
                  value={banner.ctaText}
                  onChange={(e) => updateBanner(index, "ctaText", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="mb-2 block text-sm font-medium text-card-foreground">
                  CTA Text (BM)
                </Label>
                <Input
                  value={banner.ctaTextMs}
                  onChange={(e) => updateBanner(index, "ctaTextMs", e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="mb-2 block text-sm font-medium text-card-foreground">
                  CTA Link
                </Label>
                <Input
                  placeholder="/about"
                  value={banner.ctaLink}
                  onChange={(e) => updateBanner(index, "ctaLink", e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {form.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No banners yet. Click "Add New" to create your first banner slide.</p>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex items-center gap-4">
        <Button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground gap-2"
        >
          <Save className="h-4 w-4" />
          {t("admin.save")}
        </Button>
        {saved && (
          <span className="text-sm font-medium text-primary">
            Changes saved successfully!
          </span>
        )}
        <span className="text-sm text-muted-foreground">
          {form.length}/10 slides
        </span>
      </div>
    </AdminLayout>
  )
}
