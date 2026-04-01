"use client"

import { AdminLayout } from "@/components/admin-layout"
import { useLanguage } from "@/lib/language-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerkhidmatanSection } from "./perkhidmatan-section"
import { Users, TreePine, Globe } from "lucide-react"

export default function AdminPerkhidmatanPage() {
  const { t } = useLanguage()

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          {t("admin.manage.perkhidmatan")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage services by section: Kakitangan, Pekebun Kecil, Orang Awam
        </p>
      </div>

      <Tabs defaultValue="kakitangan" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="kakitangan" className="gap-2">
            <Users className="h-4 w-4" />
            {t("perkhidmatan.section.kakitangan")}
          </TabsTrigger>
          <TabsTrigger value="pekebun" className="gap-2">
            <TreePine className="h-4 w-4" />
            {t("perkhidmatan.section.pekebun")}
          </TabsTrigger>
          <TabsTrigger value="orang_awam" className="gap-2">
            <Globe className="h-4 w-4" />
            {t("perkhidmatan.section.orang_awam")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kakitangan">
          <PerkhidmatanSection section="kakitangan" titleKey="perkhidmatan.section.kakitangan" />
        </TabsContent>
        <TabsContent value="pekebun">
          <PerkhidmatanSection section="pekebun" titleKey="perkhidmatan.section.pekebun" />
        </TabsContent>
        <TabsContent value="orang_awam">
          <PerkhidmatanSection section="orang_awam" titleKey="perkhidmatan.section.orang_awam" />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}
