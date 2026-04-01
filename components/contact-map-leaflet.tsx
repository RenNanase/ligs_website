"use client"

import { useEffect, useRef } from "react"
import { useLanguage } from "@/lib/language-context"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix default marker icon in Leaflet (broken in webpack/Next.js)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})
L.Marker.prototype.options.icon = DefaultIcon

interface Props {
  location: { lat: number; lng: number }
  company: {
    nameFull: string
    address: string
    phone: string
    email: string
  }
  directionsUrl: string
  googleMapsUrl: string
}

export function ContactMapLeaflet({ location, company, directionsUrl }: Props) {
  const { language, t } = useLanguage()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  const directionsLabel = language === "en" ? "Get Directions" : "Dapatkan Arahan"

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const container = mapContainerRef.current

    const map = L.map(container, {
      center: [location.lat, location.lng],
      zoom: 16,
      scrollWheelZoom: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const popupContent = `
      <div style="min-width: 220px; padding: 4px; font-family: system-ui, sans-serif">
        <h3 style="font-weight: 600; font-size: 1rem; margin: 0 0 8px 0; color: #1a1a1a">${company.nameFull}</h3>
        <p style="font-size: 0.875rem; color: #666; margin: 0 0 8px 0; line-height: 1.5">${company.address}</p>
        <p style="font-size: 0.875rem; color: #666; margin: 0 0 8px 0">📞 ${company.phone}</p>
        <p style="font-size: 0.875rem; color: #666; margin: 0 0 12px 0">✉️ ${company.email}</p>
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 8px 12px; border-radius: 8px; background: #0f766e; color: #fff; font-size: 0.875rem; font-weight: 500; text-decoration: none">${directionsLabel}</a>
      </div>
    `

    L.marker([location.lat, location.lng], { title: t("contact.map.markerLabel") })
      .bindPopup(popupContent)
      .addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- location/company/directions are static; creating map once avoids reuse errors
  }, [])

  return (
    <div
      ref={mapContainerRef}
      className="relative z-0 h-[300px] w-full overflow-hidden rounded-xl border border-border shadow-lg sm:h-[400px] [&_.leaflet-container]:rounded-xl"
      style={{ minHeight: 300 }}
      role="application"
      aria-label={t("contact.map.ariaLabel")}
    />
  )
}
