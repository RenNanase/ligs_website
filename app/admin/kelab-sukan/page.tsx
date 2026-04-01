"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KelabSukanNewsSection } from "./news-section"
import { KelabSukanIntroSection } from "./intro-section"
import { KelabSukanPresidentsSection } from "./presidents-section"
import { Newspaper, FileText, Users } from "lucide-react"

export default function AdminKelabSukanPage() {
  const { t } = useLanguage()

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("admin.manage.kelabSukan")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage Kelab Sukan page content: News, Introduction, and President History
        </p>
      </div>

      <Tabs defaultValue="news" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="news" className="gap-2">
            <Newspaper className="h-4 w-4" />
            {t("admin.kelabSukan.news")}
          </TabsTrigger>
          <TabsTrigger value="intro" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("admin.kelabSukan.intro")}
          </TabsTrigger>
          <TabsTrigger value="presidents" className="gap-2">
            <Users className="h-4 w-4" />
            {t("admin.kelabSukan.presidents")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="news">
          <KelabSukanNewsSection />
        </TabsContent>
        <TabsContent value="intro">
          <KelabSukanIntroSection />
        </TabsContent>
        <TabsContent value="presidents">
          <KelabSukanPresidentsSection />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
