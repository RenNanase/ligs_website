/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb", // Allow PDF uploads up to 10MB with some overhead
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
<<<<<<< HEAD
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
=======
  turbopack: {},
>>>>>>> 91866b5ba89e98143037e30abed31cce5d1e3e33
}

export default nextConfig
