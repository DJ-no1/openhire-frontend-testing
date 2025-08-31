import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenHire - AI-Powered Recruitment Platform | Smart Hiring Solutions",
  description: "Transform your recruitment with OpenHire's AI-powered platform. Smart job matching, automated screening, and intelligent hiring tools for modern businesses.",
  keywords: "AI recruitment, job matching, automated hiring, smart recruitment platform, AI resume screening, talent acquisition",
  openGraph: {
    title: "OpenHire - AI-Powered Recruitment Platform",
    description: "Revolutionary AI recruitment platform connecting top talent with amazing opportunities.",
    type: "website",
    url: "https://openhire.com",
    siteName: "OpenHire",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenHire - AI-Powered Recruitment",
    description: "Transform recruitment with AI-powered smart hiring solutions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
