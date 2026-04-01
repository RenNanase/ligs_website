"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload, X, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
  /** Preview aspect ratio: "square" | "video" | "banner" */
  aspectRatio?: "square" | "video" | "banner"
  /** Custom upload API path (default: /api/upload) */
  uploadPath?: string
  /** Max file size in bytes (default: 5 MB) */
  maxSize?: number
  /** Accept attribute for file input */
  accept?: string
}

const aspectRatioMap = {
  square: "aspect-square",
  video: "aspect-video",
  banner: "aspect-[21/9]",
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  className,
  aspectRatio = "video",
  uploadPath = "/api/upload",
  maxSize = DEFAULT_MAX_SIZE,
  accept = "image/jpeg,image/png,image/webp,image/gif",
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [previewError, setPreviewError] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState("")
  const showPreview = Boolean(value) && !previewError
  // Cache-bust image URL so newly uploaded images display immediately (avoids browser/proxy 404 cache)
  const imageSrc = React.useMemo(
    () => (value ? `${value}${value.includes("?") ? "&" : "?"}v=${Date.now()}` : ""),
    [value]
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    e.target.value = ""

    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)} MB.`)
      return
    }

    setError("")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(uploadPath, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Upload failed (${res.status})`)
      }

      const { url } = await res.json()
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleChoose = () => inputRef.current?.click()

  const handleClear = () => {
    onChange("")
    setPreviewError(false)
    setError("")
  }

  const handleImageError = () => setPreviewError(true)
  const handleImageLoad = () => setPreviewError(false)

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-1.5 text-sm font-medium text-card-foreground">
        <ImageIcon className="h-3.5 w-3.5" />
        {label}
      </Label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
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
                key={value}
                src={imageSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
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
              {uploading ? "Uploading..." : "Replace image"}
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
        <p className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  )
}
