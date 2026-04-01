"use client"

import { useEffect, useRef } from "react"

// Use canonical page URL (not share link) - Page Plugin requires this format
// Resolved from share link: facebook.com/people/LIGS/61586889106536
const FACEBOOK_PAGE_URL = "https://www.facebook.com/61586889106536"

declare global {
  interface Window {
    fbAsyncInit?: () => void
    FB?: { init: (opts: { xfbml: boolean; version: string }) => void; XFBML?: { parse: () => void } }
  }
}

export function FacebookEmbed() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const initFb = () => {
      window.FB?.init({ xfbml: true, version: "v21.0" })
      window.FB?.XFBML?.parse()
    }

    if (window.FB) {
      initFb()
    } else {
      window.fbAsyncInit = initFb
      const script = document.createElement("script")
      script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v21.0"
      script.async = true
      script.defer = true
      script.crossOrigin = "anonymous"
      document.body.appendChild(script)
    }

    return () => {
      delete window.fbAsyncInit
    }
  }, [])

  return (
    <div ref={containerRef} className="flex min-h-[300px] w-full justify-center rounded-lg bg-muted/10">
      <div
        className="fb-page"
        data-href={FACEBOOK_PAGE_URL}
        data-tabs="timeline"
        data-width="340"
        data-height="350"
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
      />
      <noscript>
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          View our Facebook Page
        </a>
      </noscript>
    </div>
  )
}
