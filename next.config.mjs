/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem cache in dev — prevents heap OOM during cache serialization
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
