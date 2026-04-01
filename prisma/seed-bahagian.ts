import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

const dbUrl = new URL(process.env.DATABASE_URL!)
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: decodeURIComponent(dbUrl.username), // Decode just in case
  password: decodeURIComponent(dbUrl.password), // This turns %40 back into @
  database: dbUrl.pathname.slice(1),
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const bahagianData = [
    { name: "Ahli Lembaga Pengarah", slug: "ahli-lembaga-pengarah", orderIndex: 0 },
    { name: "Bahagian Pengurus Besar", slug: "bahagian-pengurus-besar", orderIndex: 1 },
    { name: "Bahagian Pentadbiran", slug: "bahagian-pentadbiran", orderIndex: 2 },
    { name: "Bahagian Pembelian Getah", slug: "bahagian-pembelian-getah", orderIndex: 3 },
    { name: "Bahagian Kemajuan Pekebun Kecil", slug: "bahagian-kemajuan-pekebun-kecil", orderIndex: 4 },
    { name: "Bahagian Kewangan", slug: "bahagian-kewangan", orderIndex: 5 },
    { name: "Bahagian Skim Penempatan Getah", slug: "bahagian-skim-penempatan-getah", orderIndex: 6 },
    { name: "Bahagian Pemprosesan dan Pemasaran", slug: "bahagian-pemprosesan-pemasaran", orderIndex: 7 },
  ]

  for (const b of bahagianData) {
    await prisma.bahagian.upsert({
      where: { slug: b.slug },
      update: { status: "published" },
      create: {
        name: b.name,
        slug: b.slug,
        shortDescription: `${b.name} - Maklumat akan dikemaskini.`,
        content: `<p>Kandungan untuk ${b.name} akan dikemaskini melalui CMS.</p>`,
        orderIndex: b.orderIndex,
        status: "published",
      },
    })
  }

  console.log("Bahagian seeded (" + bahagianData.length + " entries)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
