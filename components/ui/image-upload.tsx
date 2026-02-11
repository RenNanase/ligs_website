"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
  aspectRatio?: "square" | "video" | "banner"
}

const aspectRatioMap = {
  square: "aspect-square",
  video: "aspect-video",
  banner: "aspect-[21/9]",
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  className,
  aspectRatio = "video",
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [previewError, setPreviewError] = React.useState(false)
  const showPreview = Boolean(value) && !previewError

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Upload failed")
        return
      }

      onChange(data.url)
      setPreviewError(false)
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleChoose = () => inputRef.current?.click()

  const handleClear = () => {
    onChange("")
    setPreviewError(false)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-1.5 text-sm font-medium text-card-foreground">
        <ImageIcon className="h-3.5 w-3.5" />
        {label}
      </Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        aria-hidden
        onChange={handleFileChange}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {showPreview ? (
          <>
            <div
              className={cn(
                "relative w-full overflow-hidden rounded-lg border border-border bg-muted sm:w-40 shrink-0",
                aspectRatioMap[aspectRatio]
              )}
            >
              <img
                src={value}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setPreviewError(true)}
                onLoad={() => setPreviewError(false)}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 rounded-md opacity-90 hover:opacity-100"
                onClick={handleClear}
                aria-label="Clear image"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleChoose}
              disabled={uploading}
              className="gap-2 shrink-0"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Replace image
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleChoose}
            disabled={uploading}
            className="gap-2 h-auto py-6 border-dashed"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            {uploading ? "Uploading..." : "Choose image from device"}
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
