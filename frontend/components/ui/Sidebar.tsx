"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cpu, Activity, Zap } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Live Terminal", href: "/", icon: LayoutDashboard, tooltip: "Real-time AI Price Engine" },
    { name: "Robo-Advisor", href: "/robo-advisor", icon: Cpu, tooltip: "Autonomous Trading Agent" },
    { name: "Market Pulse", href: "/pulse", icon: Activity, tooltip: "Global Sentiment Analysis" },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-white/5 hidden md:flex flex-col h-screen sticky top-0 z-40">
      
      {/* Brand Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <Zap size={24} className="text-emerald-400 mr-2 fill-emerald-400" />
        <h1 className="text-xl font-bold tracking-wider text-zinc-100">QuantEngine</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-2 px-4 py-8 flex-1">
        <div className="text-xs font-bold text-zinc-500 tracking-widest mb-2 px-4">TRADING SUITE</div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div className="relative group">
                {/* Main Link Button */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-100'}`}>
                  <Icon size={20} className={isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-emerald-400 transition-colors'} />
                  <span className="font-semibold text-sm">{item.name}</span>
                  {/* Active Indicator Dot */}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                </div>

                {/* Cyberpunk Hover Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-zinc-800 text-emerald-400 text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 shadow-[0_0_15px_rgba(16,185,129,0.2)] whitespace-nowrap border border-white/5 z-50">
                  {item.tooltip}
                  {/* Tooltip Triangle Pointer */}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-[4px] border-y-transparent border-r-[4px] border-r-zinc-800" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Status / Bottom Area */}
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            ST
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-200">Admin Console</p>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}