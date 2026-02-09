import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import GlobalHeader from "./GlobalHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tonehouse AI",
  description: "Powered by OpenAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}>
        <Providers>
          <div className="min-h-screen bg-[url('/home/hero.jpg')] bg-cover bg-center">
            <div className="min-h-screen bg-zinc-950/80 text-zinc-50">
              <GlobalHeader />
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
