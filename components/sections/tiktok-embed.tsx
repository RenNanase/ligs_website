"use client"

import { useEffect, useState, useRef } from "react"

export function TiktokEmbed() {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch("/api/social-embeds/tiktok")
        if (!res.ok) throw new Error("Failed to load")
        const data = (await res.json()) as { html?: string }
        if (cancelled || !data?.html) return
        setHtml(data.html)
      } catch (e) {
        if (!cancelled) setError("Could not load TikTok embed")
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!html || !containerRef.current || scriptLoaded.current) return
    containerRef.current.innerHTML = html
    const script = document.createElement("script")
    script.src = "https://www.tiktok.com/embed.js"
    script.async = true
    document.body.appendChild(script)
    scriptLoaded.current = true
  }, [html])

  if (error) {
    return (
      <a
        href="https://www.tiktok.com/@kentalansikarapsabah"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[300px] flex-1 items-center justify-center rounded-lg bg-muted/10 text-muted-foreground transition-colors hover:bg-accent/20 hover:text-accent"
      >
        View our TikTok profile
      </a>
    )
  }

  if (!html) {
    return (
      <div className="flex min-h-[300px] flex-1 items-center justify-center rounded-lg bg-muted/10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="tiktok-embed-container min-h-[300px] flex-1 [&_blockquote]:!max-w-full rounded-lg [&_iframe]:rounded-lg"
    />
  )
}
