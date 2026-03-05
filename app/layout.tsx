import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import GlobalHeader from "./components/GlobalHeader";
import Footer from "./components/Footer";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coach.tonehouse.sg"),
  title: {
    default: "Tonehouse Coach",
    template: "%s | Tonehouse Coach",
  },
  description:
    "Tonehouse Coach helps musicians build better practice habits with clear, structured systems.",
  verification: {
    google: "ncC_F8SNFam05n79s1asCLVSZDWEQdHx9x9ZcDotQq0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-950 text-zinc-100`}
      >
        <Providers>

          {/* Tonehouse Floating Logo — DESKTOP ONLY */}
          <div className="hidden lg:block fixed left-6 top-10 z-50">
            <Link href="/" aria-label="Go to home">
              <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 backdrop-blur-md hover:bg-zinc-900/80 transition">
                <img
                  src="/tonehouse-logo.png"
                  alt="Tonehouse"
                  className="h-16 w-16 opacity-95"
                />
              </div>
            </Link>
          </div>

          <GlobalHeader />

          <main className="min-h-screen">{children}</main>

          <Footer />

        </Providers>
      </body>
    </html>
  );
}