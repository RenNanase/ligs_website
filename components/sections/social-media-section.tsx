"use client"

import { useLanguage } from "@/lib/language-context"
import { Youtube, Facebook, Video } from "lucide-react"
import Link from "next/link"

// Dummy social media data
const socialMediaLinks = [
  {
    id: "youtube",
    name: "YouTube",
    icon: Youtube,
    url: "https://youtube.com/@placeholder",
    color: "bg-red-500 hover:bg-red-600",
    description: { en: "Watch our latest videos and tutorials", ms: "Tonton video dan tutorial terkini kami" },
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Video,
    url: "https://tiktok.com/@placeholder",
    color: "bg-black hover:bg-gray-800",
    description: { en: "Follow us for quick tips and updates", ms: "Ikuti kami untuk tip pantas dan kemas kini" },
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Facebook,
    url: "https://facebook.com/placeholder",
    color: "bg-blue-600 hover:bg-blue-700",
    description: { en: "Connect with our community", ms: "Berhubung dengan komuniti kami" },
  },
]

export function SocialMediaSection() {
  const { language, t } = useLanguage()

  return (
    <section className="bg-card py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-heading text-3xl font-bold text-card-foreground md:text-4xl">
            {t("social.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t("social.subtitle")}
          </p>
        </div>

        {/* Social Media Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {socialMediaLinks.map((platform) => {
            const Icon = platform.icon
            const description = language === "en" ? platform.description.en : platform.description.ms

            return (
              <Link
                key={platform.id}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="flex h-full flex-col items-center rounded-2xl border border-border bg-background p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg">
                  {/* Icon */}
                  <div
                    className={`mb-5 flex h-20 w-20 items-center justify-center rounded-2xl ${platform.color} transition-all group-hover:scale-110`}
                  >
                    <Icon className="h-10 w-10 text-white" />
                  </div>

                  {/* Platform Name */}
                  <h3 className="mb-2 text-xl font-bold text-foreground">
                    {platform.name}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 text-sm text-muted-foreground">
                    {description}
                  </p>

                  {/* Follow Button */}
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors group-hover:text-accent">
                      {t("social.follow")}
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Optional: Recent Posts Preview Section - Placeholder for future */}
        <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {language === "en"
              ? "Recent posts from our social media will be displayed here"
              : "Siaran terkini dari media sosial kami akan dipaparkan di sini"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground/70">
            {language === "en"
              ? "(This feature will be integrated with API in future updates)"
              : "(Ciri ini akan diintegrasikan dengan API dalam kemas kini akan datang)"}
          </p>
        </div>
      </div>
    </section>
  )
}
