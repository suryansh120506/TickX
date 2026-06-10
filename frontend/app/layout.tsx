import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/ui/Sidebar"
import { TickerProvider } from "../context/TickerContext"; // Import the Brain

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuantEngine | Terminal",
  description: "AI-Powered Institutional Trading Suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark selection:bg-emerald-500/30">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 flex h-screen overflow-hidden`}>
        {/* Wrap everything inside the TickerProvider */}
        <TickerProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto relative">
            {children}
          </main>
        </TickerProvider>
      </body>
    </html>
  );
}