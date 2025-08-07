import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import ErrorBoundary from "@/components/ui/error-boundary";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AlgoViz Coach - Interactive Algorithm Learning",
  description: "Learn algorithms visually with step-by-step explanations and interactive visualizations. Perfect for technical interview preparation.",
  keywords: ["algorithms", "visualization", "learning", "programming", "interview prep"],
  authors: [{ name: "AlgoViz Coach Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <div className="relative min-h-screen">
          {/* top gradient accent */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-accent/25 to-transparent blur-2xl" />
          {/* page chrome */}
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}
