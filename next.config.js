/** @type {import('next').NextConfig} */

function apiImagePattern() {
  const raw = process.env.NEXT_PUBLIC_API_BASE || "https://api.akustikkontrol.com.tr/api";
  try {
    const u = new URL(raw);
    return {
      protocol: u.protocol.replace(":", ""),
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/media/**",
    };
  } catch {
    return { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/media/**" };
  }
}

const nextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "null", "*.cursor.sh", "*.cursor.com"],
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "https://api.akustikkontrol.com.tr/admin/",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "https://api.akustikkontrol.com.tr/admin/:path*",
        permanent: false,
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      apiImagePattern(),
      { protocol: "https", hostname: "api.akustikkontrol.com.tr", pathname: "/media/**" },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

module.exports = nextConfig;

// Skip OpenNext/workerd during `next dev` so the Cursor preview is a plain Next server.
