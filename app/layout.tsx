import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProviders } from "@/components/auth/providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7c3aed" },
    { media: "(prefers-color-scheme: dark)",  color: "#8b5cf6" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "ApplyGuru — Discover Events, Jobs & Opportunities",
    template: "%s | ApplyGuru",
  },
  description:
    "India's largest platform for volunteer events, college fests, workshops, webinars, summits, jobs, career guidance, and educational programs. Join 500K+ students & professionals.",
  keywords: [
    "events india", "volunteer events", "college events", "hackathons",
    "workshops", "webinars", "jobs", "internships", "career guidance",
    "government jobs", "career counseling", "educational programs",
  ],
  authors: [{ name: "ApplyGuru" }],
  creator: "ApplyGuru",
  metadataBase: new URL("https://applyguru.in"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://applyguru.in",
    title: "ApplyGuru — Discover Events, Jobs & Opportunities",
    description: "India's largest platform for volunteer events, jobs, workshops & more.",
    siteName: "ApplyGuru",
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyGuru",
    description: "India's largest platform for volunteer events, jobs, workshops & more.",
    creator: "@applyguru",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProviders>{children}</AuthProviders>
      </body>
    </html>
  );
}
