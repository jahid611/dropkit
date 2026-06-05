import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Formats modernes : Next sert de l'AVIF/WebP redimensionné à la place des JPEG bruts.
    formats: ["image/avif", "image/webp"],
    // Cache long des images optimisées (assets versionnés/immutables côté /public).
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
