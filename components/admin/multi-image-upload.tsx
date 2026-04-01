"use client"

import * as React from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const MAX_SIZE = 10 * 1024 * 1024
const MAX_FILES = 20

export interface MultiImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  uploadPath: string
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  className?: string
}

export function MultiImageUpload({
  value,
  onChange,
  uploadPath,
  maxFiles = MAX_FILES,
  maxSize = MAX_SIZE,
  disabled = false,
  className,
}: MultiImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [errors, setErrors] = React.useState<string[]>([])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const processFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files)
    const remaining = maxFiles - value.length
    if (remaining <= 0) {
      setErrors([`Maximum ${maxFiles} images. Remove some first.`])
      return
    }

    const toUpload = fileList
      .filter((f) => f.type === "image/jpeg" || f.type === "image/jpg" || f.type === "image/png")
      .slice(0, remaining)

    const invalid = fileList.filter(
      (f) => f.type !== "image/jpeg" && f.type !== "image/jpg" && f.type !== "image/png"
    )
    const tooLarge = fileList.filter((f) => f.size > maxSize)

    const errs: string[] = []
    if (invalid.length > 0) errs.push(`Invalid format (use JPEG/PNG): ${invalid.map((f) => f.name).join(", ")}`)
    if (tooLarge.length > 0)
      errs.push(`File too large (max ${Math.round(maxSize / 1024 / 1024)}MB): ${tooLarge.map((f) => f.name).join(", ")}`)
    setErrors(errs)

    if (toUpload.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      toUpload.forEach((f) => formData.append("files", f))

      const res = await fetch(uploadPath, { method: "POST", body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Upload failed (${res.status})`)
      }

      const data = await res.json()
      const urls = data.urls || []
      if (data.errors?.length) setErrors((e) => [...e, ...data.errors])
      onChange([...value, ...urls])
    } catch (err) {
      setErrors((e) => [...e, err instanceof Error ? err.message : "Upload failed"])
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (disabled || uploading) return
    processFiles(e.dataTransfer.files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    processFiles(files)
  }

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
    setErrors([])
  }

  return (
    <div className={cn("min-w-0 space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        multiple
        className="sr-only"
        aria-label="Upload images"
        onChange={handleChange}
        disabled={disabled || uploading}
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          dragActive && !disabled ? "border-primary bg-primary/5" : "border-border bg-muted/30",
          disabled && "opacity-60"
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="gap-2 text-center"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 shrink-0" />
              <span className="break-words text-left">
                Drag & drop or click (JPEG/PNG, max 10MB, up to {maxFiles - value.length} more)
              </span>
            </>
          )}
        </Button>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {errors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {value.map((url, i) => (
            <div
              key={url + i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => remove(i)}
                disabled={disabled}
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {value.length} / {maxFiles} images
        </p>
      )}
    </div>
  )
}
