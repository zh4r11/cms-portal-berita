import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Foto unggahan disajikan oleh route /media, bukan dari /public.
    localPatterns: [{ pathname: "/media/**" }],
    // Thumbnail video YouTube bila video tidak punya thumbnail sendiri.
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
  experimental: {
    // forbidden() untuk modul yang tidak diberikan ke pengguna level user.
    authInterrupts: true,
    serverActions: {
      // Video unggahan maksimal 50 MB.
      bodySizeLimit: "55mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
