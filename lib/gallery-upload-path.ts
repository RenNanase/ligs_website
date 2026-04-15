/**
 * Folder segment under public/uploads/gallery/<slug>/ for organizing images by event title.
 * Gallery titles are unique in DB, so one folder name per event.
 */
export function galleryFolderSlugFromTitle(title: string): string {
  const raw = title.trim()
  if (!raw) return "untitled"

  let s = raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (!s) return "untitled"
  // Windows-safe length; avoid trailing dots/spaces
  s = s.replace(/\.+$/g, "").slice(0, 80)
  return s || "untitled"
}
