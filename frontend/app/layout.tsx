import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/ui/Sidebar"; 
import { TickerProvider } from "../context/TickerContext"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TickX | Architecture",
  description: "Advanced Quantitative Trading Suite",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark selection:bg-cyan-500/30">
      <body className={`${inter.className} bg-[#020202] text-zinc-100 flex h-screen overflow-hidden`}>
        <TickerProvider>
          {/* The new TickX Sidebar */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-y-auto relative custom-scrollbar pt-16 md:pt-0">
            
            {/* The Page Content (NEXUS, Robo-Advisor, etc.) */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* --- THE GLOBAL TICKX FOOTER --- */}
            <footer className="w-full border-t border-zinc-800/60 bg-[#050505] py-4 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono tracking-[0.2em] text-zinc-600 uppercase z-50 relative mt-auto">
              <div className="mb-2 md:mb-0">
                © {new Date().getFullYear()} TickX Quantitative Systems. All rights reserved.
              </div>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> 
                  Data Feeds Operational
                </span>
                <span className="text-zinc-700">v2.4.0-build</span>
              </div>
            </footer>

          </div>
        </TickerProvider>
      </body>
    </html>
  );
}