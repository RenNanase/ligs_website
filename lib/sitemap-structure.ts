/**
 * Sitemap structure: Home > Category > Sub-page
 * Items use labelKey (translation key) or label (literal). Keywords for search.
 * Dynamic items (bahagian) are injected at runtime.
 */
export interface SitemapLink {
  href: string
  labelKey?: string
  label?: string
  keywords?: string[]
  external?: boolean
}

export interface SitemapCategory {
  categoryKey: string
  items: SitemapLink[]
}

export function buildSitemapCategories(bahagian: { slug: string; name: string }[]): SitemapCategory[] {
  const bahagianItems: SitemapLink[] = bahagian.map((b) => ({
    href: `/bahagian/${b.slug}`,
    label: b.name,
    keywords: [b.name.toLowerCase()],
  }))

  return [
    {
      categoryKey: "nav.home",
      items: [{ href: "/", labelKey: "nav.home", keywords: ["home", "utama", "laman utama"] }],
    },
    {
      categoryKey: "nav.corpinfo",
      items: [
        { href: "/info-korporat/tentang-kami", labelKey: "nav.corpinfo.about", keywords: ["about", "tentang"] },
        { href: "/info-korporat/visi-misi", labelKey: "nav.corpinfo.vision", keywords: ["vision", "mission", "visi", "misi"] },
        { href: "/info-korporat/carta-organisasi", labelKey: "nav.corpinfo.cartaOrganisasi", keywords: ["chart", "organisation", "carta", "organisasi"] },
        ...bahagianItems,
        { href: "/direktori", labelKey: "nav.corpinfo.direktori", keywords: ["directory", "direktori"] },
        { href: "/info-korporat/lagu-ligs", labelKey: "nav.corpinfo.laguLigs", keywords: ["song", "lagu"] },
      ],
    },
    {
      categoryKey: "nav.perkhidmatan",
      items: [{ href: "/perkhidmatan", labelKey: "nav.perkhidmatan", keywords: ["services", "perkhidmatan"] }],
    },
    {
      categoryKey: "nav.pekebun",
      items: [
        { href: "https://bmt.ligs.gov.my", labelKey: "nav.pekebun.semakanBantuan", external: true, keywords: ["aid", "bantuan", "monsoon"] },
        { href: "https://apps.ligs.gov.my/pk_sales", labelKey: "nav.pekebun.penyataPenjualan", external: true, keywords: ["sales", "penjualan"] },
      ],
    },
    {
      categoryKey: "nav.pencapaian",
      items: [{ href: "/pencapaian", labelKey: "nav.pencapaian", keywords: ["achievements", "pencapaian"] }],
    },
    {
      categoryKey: "nav.integriti",
      items: [{ href: "/integriti", labelKey: "nav.integriti", keywords: ["integrity", "integriti"] }],
    },
    {
      categoryKey: "nav.kakitangan",
      items: [
        { href: "/kakitangan", labelKey: "nav.kakitangan", keywords: ["staff", "kakitangan"] },
        { href: "/kakitangan/e-pekeliling", labelKey: "nav.kakitangan.ePekeliling", keywords: ["circular", "pekeliling"] },
        { href: "/kakitangan/pautan-kakitangan", labelKey: "nav.kakitangan.pautan", keywords: ["links", "pautan"] },
      ],
    },
    {
      categoryKey: "nav.kelabSukan",
      items: [{ href: "/kelab-sukan", labelKey: "nav.kelabSukan", keywords: ["sports", "sukan"] }],
    },
    {
      categoryKey: "nav.orangAwam",
      items: [
        { href: "/orang-awam", labelKey: "nav.orangAwam", keywords: ["public", "awam"] },
        { href: "/tenders", labelKey: "nav.orangAwam.tender", keywords: ["tender", "procurement"] },
        { href: "/jawatan-kosong", labelKey: "nav.orangAwam.jawatanKosong", keywords: ["vacancy", "job", "jawatan"] },
        { href: "/akal", labelKey: "nav.akal.form", keywords: ["akal", "anugerah", "kecemerlangan", "akademik", "spm"] },
        { href: "/kalender", labelKey: "nav.orangAwam.kalender", keywords: ["calendar", "kalender"] },
      ],
    },
    {
      categoryKey: "nav.media",
      items: [
        { href: "/news", labelKey: "nav.media.news", keywords: ["news", "berita"] },
        { href: "/announcements", labelKey: "nav.media.announcements", keywords: ["announcements", "pengumuman"] },
        { href: "/gallery", labelKey: "nav.media.gallery", keywords: ["gallery", "galeri"] },
        { href: "/penerbitan", labelKey: "nav.media.penerbitan", keywords: ["publications", "penerbitan"] },
        { href: "/arkib", labelKey: "nav.media.arkib", keywords: ["archive", "arkib"] },
      ],
    },
    {
      categoryKey: "sitemap.utility",
      items: [
        { href: "/soalan-lazim", labelKey: "nav.faq", keywords: ["faq", "soalan", "lazim"] },
        { href: "/contact", labelKey: "nav.contact", keywords: ["contact", "hubungi"] },
        { href: "/feedback", labelKey: "nav.feedback", keywords: ["feedback", "maklum"] },
        { href: "/kepuasan-pelanggan", labelKey: "nav.kepuasanPelanggan", keywords: ["kepuasan", "pelanggan", "survey"] },
        { href: "/kepuasan-staf", labelKey: "nav.kepuasanStaf", keywords: ["kepuasan", "staf", "staff", "survey"] },
      ],
    },
    {
      categoryKey: "footer.policies",
      items: [
        { href: "/privasi", labelKey: "footer.privasi", keywords: ["privacy", "privasi"] },
        { href: "/dasar-keselamatan", labelKey: "footer.dasarKeselamatan", keywords: ["security", "keselamatan"] },
        { href: "/penafian", labelKey: "footer.penafian", keywords: ["disclaimer", "penafian"] },
        { href: "/notis-hak-cipta", labelKey: "footer.notisHakCipta", keywords: ["copyright", "hak cipta"] },
      ],
    },
  ]
}
