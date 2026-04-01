/**
 * Returns a valid image URL for display.
 * Ensures paths from the database (e.g. /uploads/xxx or uploads/xxx) work correctly.
 */
export function getImageUrl(path: string | undefined | null): string {
  if (!path || typeof path !== "string") return ""
  const trimmed = path.trim()
  if (!trimmed) return ""
  // Already absolute (same-origin or external)
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed
  }
  // Relative path - prepend slash for same-origin
  return `/${trimmed}`
}

/** Get the thumbnail (first) image from a news article's images array */
export function getThumbnailImage(images: string[] | undefined): string {
  return getImageUrl(images?.[0])
}
