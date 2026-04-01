"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { api } from "@/lib/api-client"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { ImageUpload } from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const INTRO_CHAR_LIMIT = 5000
const AUTO_SAVE_INTERVAL_MS = 30_000

export function KelabSukanIntroSection() {
  const [intro, setIntro] = useState("")
  const [logo, setLogo] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")

  const load = useCallback(async () => {
    try {
      const res = await api.getKelabSukanIntro()
      setIntro(res.intro ?? "")
      setLogo(res.logo ?? null)
    } catch (err) {
      toast.error("Failed to load intro")
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(async () => {
    if (intro.length > INTRO_CHAR_LIMIT) {
      toast.error(`Content exceeds ${INTRO_CHAR_LIMIT} characters`)
      return
    }
    setSaving(true)
    try {
      await api.saveKelabSukanIntro({ intro, logo: logo ?? undefined })
      toast.success("Introduction saved")
    } catch (err) {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }, [intro, logo])

  const introRef = useRef(intro)
  const logoRef = useRef(logo)
  introRef.current = intro
  logoRef.current = logo
  useEffect(() => {
    if (!loaded) return
    const t = setInterval(() => {
      const content = introRef.current
      const logoUrl = logoRef.current
      if (!content && !logoUrl) return
      api.saveKelabSukanIntro({ intro: content, logo: logoUrl ?? undefined }).then(() => toast.success("Auto-saved")).catch(() => {})
    }, AUTO_SAVE_INTERVAL_MS)
    return () => clearInterval(t)
  }, [loaded])

  const charCount = intro.replace(/<[^>]*>/g, "").length
  const overLimit = charCount > INTRO_CHAR_LIMIT

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label className="text-base font-medium">Introduction Content</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Rich text with headings, bold, italic, lists, links, images. Max {INTRO_CHAR_LIMIT} characters.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant={previewMode === "desktop" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("desktop")}>
              Desktop
            </Button>
            <Button variant={previewMode === "mobile" ? "default" : "outline"} size="sm" onClick={() => setPreviewMode("mobile")}>
              Mobile
            </Button>
          </div>
        </div>

        {!loaded ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <ImageUpload
                value={logo ?? ""}
                onChange={(url) => setLogo(url || null)}
                label="Logo (optional – shown at top center before intro)"
                aspectRatio="video"
              />
            </div>
            <div className="mb-4">
              <RichTextEditor
                value={intro}
                onChange={setIntro}
                placeholder="Write the introduction for Kelab Sukan..."
                minHeight="300px"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${overLimit ? "text-destructive" : "text-muted-foreground"}`}>
                {charCount} / {INTRO_CHAR_LIMIT} characters
              </p>
              <Button onClick={save} disabled={saving || overLimit}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Now
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Live preview */}
      {loaded && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-heading text-lg font-semibold text-card-foreground">
            Live Preview
          </h3>
          <div
            className={`mx-auto overflow-auto rounded-lg border border-border bg-white p-6 ${
              previewMode === "mobile" ? "max-w-sm" : "max-w-3xl"
            }`}
          >
            {logo && (
              <div className="mb-6 flex justify-center">
                <img src={logo} alt="Kelab Sukan logo" className="h-20 w-auto object-contain" />
              </div>
            )}
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: intro || "<p class='text-muted-foreground'>No content yet. Start typing above.</p>" }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
