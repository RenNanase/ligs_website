"use client"

import { useLanguage } from "@/lib/language-context"
import { PageHeader } from "@/components/sections/page-header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Search, Mail, Phone, User, X, Loader2 } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"

const MEMBERS_PER_PAGE = 10

interface DirectoryMember {
  id: string
  name: string
  jawatan: string
  unitCawangan: string | null
  noTelefon: string
  email: string
  imageUrl: string
  orderIndex: number
}

interface DirectoryBahagian {
  id: string
  name: string
  orderIndex: number
  members: DirectoryMember[]
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length >= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  return phone
}

/** Group members by unitCawangan, preserving order of first occurrence */
function groupMembersByUnit(
  members: DirectoryMember[],
  otherLabel: string
): { unitLabel: string; members: DirectoryMember[] }[] {
  const groupOrder: string[] = []
  const groupMap = new Map<string, DirectoryMember[]>()
  for (const m of members) {
    const key = m.unitCawangan?.trim() || "__other__"
    if (!groupMap.has(key)) groupOrder.push(key)
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(m)
  }
  return groupOrder.map((key) => ({
    unitLabel: key === "__other__" ? otherLabel : key,
    members: groupMap.get(key)!,
  }))
}

function MemberList({
  members,
  t,
  onImageClick,
}: {
  members: DirectoryMember[]
  t: (k: string) => string
  onImageClick: (m: DirectoryMember) => void
}) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(members.length / MEMBERS_PER_PAGE) || 1
  const safePage = Math.min(page, totalPages) || 1
  const startIdx = (safePage - 1) * MEMBERS_PER_PAGE
  const endIdx = safePage * MEMBERS_PER_PAGE

  const groups = groupMembersByUnit(members, t("directory.other"))

  // Build paginated content: iterate groups, output header when first of group in page range, then members
  const pageRows: { isHeader: true; label: string } | { isHeader: false; member: DirectoryMember }[] = []
  let memberCount = 0
  const seenGroupsThisPage = new Set<string>()
  outer: for (const group of groups) {
    for (const member of group.members) {
      if (memberCount >= endIdx) break outer
      if (memberCount >= startIdx) {
        if (!seenGroupsThisPage.has(group.unitLabel)) {
          seenGroupsThisPage.add(group.unitLabel)
          pageRows.push({ isHeader: true, label: group.unitLabel })
        }
        pageRows.push({ isHeader: false, member })
      }
      memberCount++
    }
  }

  if (members.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        {t("directory.noMembers")}
      </p>
    )
  }

  return (
    <>
      {/* Desktop: table with unit/cawangan section headers */}
      <div className="hidden overflow-hidden rounded-lg border border-border bg-white shadow-sm md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                {t("directory.name")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                {t("directory.jawatan")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                {t("directory.noTelefon")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">
                {t("directory.email")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {pageRows.map((row, idx) =>
              row.isHeader ? (
                <tr key={`h-${row.label}-${idx}`} className="bg-muted/60">
                  <td colSpan={5} className="px-4 py-2.5 font-semibold text-foreground">
                    {row.label}
                  </td>
                </tr>
              ) : (
                <tr key={row.member.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onImageClick(row.member)}
                      className="relative h-14 w-14 overflow-hidden rounded-full border border-border bg-muted transition-opacity hover:opacity-90"
                      aria-label={t("directory.viewPhoto")}
                    >
                      <Image
                        src={row.member.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{row.member.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.member.jawatan}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`tel:${row.member.noTelefon.replace(/\s/g, "")}`}
                      className="text-sm text-muted-foreground hover:text-accent"
                    >
                      {formatPhone(row.member.noTelefon)}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`mailto:${row.member.email}`}
                      className="text-sm text-muted-foreground hover:text-accent truncate max-w-[200px] block"
                    >
                      {row.member.email}
                    </a>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile: cards with unit/cawangan section headers */}
      <div className="space-y-3 md:hidden">
        {pageRows.map((row, idx) =>
          row.isHeader ? (
            <div key={`h-${row.label}-${idx}`} className="rounded-lg border border-border bg-muted/60 px-4 py-2.5 font-semibold text-foreground">
              {row.label}
            </div>
          ) : (
            <MemberCard
              key={row.member.id}
              member={row.member}
              t={t}
              onImageClick={() => onImageClick(row.member)}
            />
          )
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-accent/20"
          >
            {t("directory.prev")}
          </button>
          <span className="text-sm text-muted-foreground">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded border border-border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-accent/20"
          >
            {t("directory.next")}
          </button>
        </div>
      )}
    </>
  )
}

function MemberCard({
  member,
  t,
  onImageClick,
}: {
  member: DirectoryMember
  t: (k: string) => string
  onImageClick: () => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 shadow-sm transition-colors hover:bg-muted/50">
      <button
        type="button"
        onClick={onImageClick}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted ring-2 ring-transparent transition-all hover:ring-accent/50 focus:ring-2 focus:ring-primary"
        aria-label={t("directory.viewPhoto")}
      >
        <Image
          src={member.imageUrl}
          alt={member.name}
          fill
          className="object-cover"
          sizes="64px"
          unoptimized
        />
      </button>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{member.name}</p>
        <p className="text-sm text-muted-foreground">{member.jawatan}</p>
        {member.unitCawangan && (
          <p className="text-xs text-muted-foreground">{member.unitCawangan}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
          <a
            href={`tel:${member.noTelefon.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-accent"
          >
            <Phone className="h-3.5 w-3.5" />
            {formatPhone(member.noTelefon)}
          </a>
          <a
            href={`mailto:${member.email}`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-accent truncate"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{member.email}</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:bg-accent/30 hover:text-accent transition-colors"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full rounded-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

export default function DirektoriPage() {
  const { language, t } = useLanguage()
  const [bahagian, setBahagian] = useState<DirectoryBahagian[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null)

  useEffect(() => {
    fetch("/api/directory/bahagian", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setBahagian(Array.isArray(data) ? data : []))
      .catch(() => setBahagian([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return bahagian
    return bahagian
      .map((b) => ({
        ...b,
        members: b.members.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.jawatan.toLowerCase().includes(q) ||
            (m.unitCawangan && m.unitCawangan.toLowerCase().includes(q)) ||
            m.email.toLowerCase().includes(q) ||
            b.name.toLowerCase().includes(q)
        ),
      }))
      .filter((b) => b.members.length > 0 || b.name.toLowerCase().includes(q))
  }, [bahagian, search])

  return (
    <>
      <PageHeader
        title={t("directory.title")}
        subtitle={t("directory.subtitle")}
      />
      <section className="bg-primary-bg py-12 md:py-16">
        <div className="mx-auto max-w-[90rem] px-6">
          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("directory.searchPlaceholder")}
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={t("directory.searchPlaceholder")}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-24 text-center">
              <User className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium text-muted-foreground">
                {t("directory.empty")}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <Accordion type="multiple" className="w-full">
                {filtered.map((b) => (
                    <AccordionItem key={b.id} value={b.id} className="border-b border-border last:border-b-0">
                      <AccordionTrigger className="px-5 py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                        <div className="flex items-center justify-between text-left w-full">
                          <span className="font-semibold text-foreground">{b.name}</span>
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({b.members.length} {t("directory.members")})
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-5 pt-0">
                        <MemberList
                          members={b.members}
                          t={t}
                          onImageClick={(m) => setLightbox({ src: m.imageUrl, alt: m.name })}
                        />
                      </AccordionContent>
                    </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
