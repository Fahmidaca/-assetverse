import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | AssetVerse",
    default: "AssetVerse – Corporate HR & Asset Management",
  },
  description:
    "AssetVerse is the modern SaaS platform for corporate HR teams to manage office assets and employee assignments effortlessly.",
  keywords: "asset management, HR software, corporate tools, inventory management",
  openGraph: {
    title: "AssetVerse – Corporate HR & Asset Management",
    description: "Manage office assets, track assignments, and empower your team.",
    type: "website",
    url: SITE_URL,
    siteName: "AssetVerse",
  },
  twitter: {
    card: "summary_large_image",
    title: "AssetVerse – Corporate HR & Asset Management",
    description: "Manage office assets, track assignments, and empower your team.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="assetverse">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: "#1f2937", color: "#fff", borderRadius: "12px" },
            success: { style: { background: "#065f46", color: "#fff" } },
            error: { style: { background: "#7f1d1d", color: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
