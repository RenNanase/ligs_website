"use client"

import { HeroSection } from "@/components/sections/hero-section"
import { StatisticsSection } from "@/components/sections/statistics-section"
import { RubberPriceSection } from "@/components/sections/rubber-price-section"
import { MonthlyRubberPriceSection } from "@/components/sections/monthly-rubber-price-section"
import { ActivitySection } from "@/components/sections/activity-section"
import { AnnouncementSection } from "@/components/sections/announcement-section"
import { TendersSection } from "@/components/sections/tenders-section"
import { SocialMediaSection } from "@/components/sections/social-media-section"
import { AgensiBerkaitanSection } from "@/components/sections/agensi-berkaitan-section"
import { PerkhidmatanSection } from "@/components/sections/perkhidmatan-section"

export default function Page() {
  return (
    <>
      <HeroSection />
      <StatisticsSection />
      <AnnouncementSection />
      <ActivitySection />
      <RubberPriceSection />
      <MonthlyRubberPriceSection />
      <TendersSection />
      <SocialMediaSection />
      <AgensiBerkaitanSection />
      <PerkhidmatanSection />
    </>
  )
}
