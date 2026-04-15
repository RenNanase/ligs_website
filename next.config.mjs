/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb", // Allow PDF uploads up to 10MB with some overhead
    },
    // With middleware enabled, Next clones request bodies with a default 10MB cap; large gallery batches were truncated (~20 photos at ~500KB each).
    proxyClientMaxBodySize: "220mb", // Penerbitan PDFs up to 200 MB + multipart overhead
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["118.101.160.33", "192.168.1.114", "w2.ligs.gov.my", "https://w2.ligs.gov.my"],
  async redirects() {
    return [
      {
        source: "/index.php",
        destination: "/",
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ]
  },
}

export default nextConfig
