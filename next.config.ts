import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "img.daisyui.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "**.ibb.co" },
    ],
  },
  // Keep mongodb-memory-server out of the server bundle — it's only used in dev
  // when MONGODB_URI is a placeholder. In production it's never resolved.
  serverExternalPackages: ["mongodb-memory-server"],
};

export default nextConfig;
