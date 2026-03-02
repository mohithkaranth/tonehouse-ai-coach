import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import GlobalHeader from "./components/GlobalHeader";
import Footer from "./components/Footer";

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
    default: "Tonehouse AI Coach",
    template: "%s | Tonehouse AI Coach",
  },
  description:
    "Tonehouse AI Coach helps musicians build better practice habits with clear, structured systems.",
  verification: {
    google: "ncC_F8SNFam05n79s1asCLVSZDWEQdHx9x9ZcDotQq0",
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
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-zinc-950 text-zinc-100`}
      >
        <Providers>
          <GlobalHeader />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
