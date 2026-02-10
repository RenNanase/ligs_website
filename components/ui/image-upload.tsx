"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageIcon, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
  /** Preview aspect ratio: "square" | "video" | "banner" */
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
  const [previewError, setPreviewError] = React.useState(false)
  const showPreview = Boolean(value) && !previewError

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      if (typeof dataUrl === "string") onChange(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const handleChoose = () => inputRef.current?.click()

  const handleClear = () => {
    onChange("")
    setPreviewError(false)
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
        accept="image/*"
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
              className="gap-2 shrink-0"
            >
              <Upload className="h-4 w-4" />
              Replace image
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleChoose}
            className="gap-2 h-auto py-6 border-dashed"
          >
            <Upload className="h-5 w-5" />
            Choose image from device
          </Button>
        )}
      </div>
    </div>
  )
}
