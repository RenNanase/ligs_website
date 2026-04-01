"use client"

import { useLanguage } from "@/lib/language-context"
import { MapPin, Navigation } from "lucide-react"
import dynamic from "next/dynamic"

// Wisma Pertanian Sabah, Kota Kinabalu
const LOCATION = {
  lat: 5.956993273957183,
  lng: 116.080278606587,
}
const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Wisma+Pertanian+Sabah/@5.9568812,116.0778861,17z"
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`

const COMPANY = {
  nameFull: "Lembaga Industri Getah Sabah",
  address: "Wisma Pertanian Sabah, Jalan Tasik, Luyang, 88632 Kota Kinabalu, Sabah, Malaysia",
  phone: "+60 88-262 233",
  email: "info@ligs.gov.my",
}

// Dynamic import to avoid SSR issues with Leaflet
const LeafletMap = dynamic(
  () => import("./contact-map-leaflet").then((m) => m.ContactMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[300px] w-full items-center justify-center rounded-xl border border-border bg-muted/50 sm:h-[400px]"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    ),
  }
)

export function ContactMap() {
  const { t } = useLanguage()
  return (
    <section
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
      aria-labelledby="contact-map-heading"
      aria-describedby="contact-map-alt"
    >
      <h2
        id="contact-map-heading"
        className="mb-4 font-heading text-xl font-semibold text-foreground"
      >
        <MapPin className="mr-2 inline-block h-5 w-5 align-middle text-primary" />
        {t("contact.map.title")}
      </h2>
      <LeafletMap
        location={LOCATION}
        company={COMPANY}
        directionsUrl={DIRECTIONS_URL}
        googleMapsUrl={GOOGLE_MAPS_URL}
      />
      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Navigation className="h-4 w-4" />
        {t("contact.map.getDirections")}
      </a>
    </section>
  )
}
