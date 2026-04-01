"use client"

import { useLanguage } from "@/lib/language-context"
import { YoutubeEmbed } from "./youtube-embed"
import { FacebookEmbed } from "./facebook-embed"
import { TiktokEmbed } from "./tiktok-embed"
import { Youtube, Facebook } from "lucide-react"
import Link from "next/link"

/** Simple TikTok-style icon (Lucide has no brand icons) */
function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  )
}

const platforms = [
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    url: "https://www.youtube.com/@lembagaindustrigetahsabaho4672",
    color: "text-red-500",
    border: "border-red-500",
    header: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    url: "https://www.facebook.com/61586889106536",
    color: "text-[#1877F2]",
    border: "border-[#1877F2]",
    header: "bg-[#1877F2]/5 dark:bg-[#1877F2]/10 border-[#1877F2]/30 dark:border-[#1877F2]/20",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: TiktokIcon,
    url: "https://www.tiktok.com/@kentalansikarapsabah",
    color: "text-black dark:text-white",
    border: "border-zinc-800 dark:border-zinc-600",
    header: "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700",
  },
] as const

export function SocialMediaSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-primary-bg py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-heading text-3xl font-bold text-card-foreground md:text-4xl">
            {t("social.title")}
          </h2>
         
        </div>

        {/* Embedded content grid */}
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          {platforms.map((platform) => {
            const Icon = platform.icon
            const Embed =
              platform.id === "youtube"
                ? YoutubeEmbed
                : platform.id === "facebook"
                  ? FacebookEmbed
                  : TiktokEmbed
            return (
              <article
                key={platform.id}
                className={`flex flex-col overflow-hidden rounded-2xl border-2 bg-white ${platform.border} shadow-sm transition-all hover:shadow-md hover:border-accent/50`}
              >
                {/* Compact card header */}
                <div className={`flex items-center justify-between gap-2 border-b px-3 py-2 ${platform.header}`}>
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className={`h-4 w-4 shrink-0 ${platform.color}`} aria-hidden />
                    <h3 className="truncate text-sm font-medium text-foreground">{platform.name}</h3>
                  </div>
                  <Link
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("social.follow")} on ${platform.name}`}
                    className="shrink-0 text-xs font-medium text-primary transition-colors hover:text-accent hover:underline"
                  >
                    {t("social.follow")}
                  </Link>
                </div>
                {/* Embed area */}
                <div className="flex min-h-[320px] flex-1 flex-col p-4">
                  <Embed />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
