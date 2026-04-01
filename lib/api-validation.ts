/**
 * Shared API validation schemas and helpers.
 * Use whitelist-based validation (Zod) for all user inputs.
 */
import { z } from "zod"

/** Safe parseInt with fallback - prevents NaN from invalid input */
export function safeParseInt(val: string | null | undefined, fallback: number): number {
  if (val == null || val === "") return fallback
  const n = parseInt(val, 10)
  return Number.isNaN(n) ? fallback : Math.max(0, n)
}

/** CUID format (typical format: c开头25字符) - basic check */
const cuidRegex = /^c[a-z0-9]{24}$/i
export const cuidSchema = z.string().regex(cuidRegex, "Invalid ID format")

/** Slug: lowercase, numbers, hyphens only */
export const slugSchema = z.string().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

/** URL string, max length */
export const urlSchema = z.string().url().max(500).or(z.literal(""))

/** Trimmed string with max length */
export function str(max = 255) {
  return z.string().transform((s) => s?.trim() ?? "").pipe(z.string().max(max))
}

// Announcement link item (url + display text)
const announcementLinkSchema = z.object({
  url: z.string().trim().max(500),
  text: z.string().trim().max(255),
})

// Announcement
export const announcementSchema = z.object({
  title: str(500),
  titleMs: str(500),
  summary: str(50000),
  summaryMs: str(50000),
  date: z.string().max(20),
  pinned: z.boolean().default(false),
  active: z.boolean().default(true),
  category: str(100),
  imageUrl: z.string().max(500).optional().nullable(),
  linkUrl: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  linkText: z.string().trim().max(255).optional().nullable().or(z.literal("")),
  links: z.array(announcementLinkSchema).optional().nullable(),
})

// Banner slide (single)
export const bannerSlideSchema = z.object({
  image: z.string().max(500).default(""),
  title: str(255),
  titleMs: str(255),
  caption: str(50000),
  captionMs: str(50000),
  ctaText: str(255),
  ctaTextMs: str(255),
  ctaLink: str(255),
  sortOrder: z.number().int().min(0).default(0),
})

// Settings update
export const settingsSchema = z.object({
  themeId: z.string().max(50).optional(),
  cartaOrganisasiImage: z.string().max(500).nullable().optional(),
})
