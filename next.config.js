/** @type {import('next').NextConfig} */

function apiImagePattern() {
  const raw = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";
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
