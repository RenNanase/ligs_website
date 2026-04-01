import { z } from "zod"

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const bahagianCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255).regex(slugRegex, "Slug must be lowercase letters, numbers and hyphens only"),
  shortDescription: z.string().max(2000).optional().nullable(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().max(500).optional().nullable(),
  membersImage: z.string().max(500).optional().nullable(),
  orderIndex: z.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
  metaTitle: z.string().max(255).optional().nullable(),
  metaDescription: z.string().max(500).optional().nullable(),
})

export const bahagianUpdateSchema = bahagianCreateSchema.partial()

export type BahagianCreate = z.infer<typeof bahagianCreateSchema>
export type BahagianUpdate = z.infer<typeof bahagianUpdateSchema>
