"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Cpu, LineChart, Settings } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Live Terminal", href: "/", icon: <Activity size={18} /> },
    { name: "Robo-Advisor", href: "/robo-advisor", icon: <Cpu size={18} /> },
    { name: "Market Pulse", href: "/pulse", icon: <LineChart size={18} /> },
  ];

  return (
    <aside className="w-[280px] bg-[#030405] border-r border-slate-800/60 h-full flex flex-col shrink-0 relative z-50 transition-all">
      
      {/* --- AMBER GLOW & GEOMETRIC SHARD LOGO --- */}
      <div className="h-[120px] flex items-center px-6 border-b border-slate-800/60 relative overflow-hidden group cursor-default">
        {/* Subtle flow background glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-colors duration-1000 pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          
          {/* 1. The Geometric Shard Emblem */}
          <div className="relative h-12 w-12 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-700 rounded-lg bg-slate-900/50 border border-slate-800 overflow-hidden">
            {/* Subtle flow gradient inside the shard container */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
            
            {/* Custom 3D Shard SVG */}
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 relative z-10 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.4)] group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-700">
              <path d="M12 2L3 14l9 8 9-8-9-10z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
              <path d="M3 14l9-4 9 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
            </svg>
          </div>

          {/* 2. The Dominant Typographic Name */}
          <div className="flex flex-col pt-1">
            <h2 className="text-4xl font-black tracking-tighter text-white leading-none drop-shadow-md">
              TICK<span className="text-amber-500">X</span>
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-slate-500 uppercase group-hover:text-amber-500/70 transition-colors duration-700">
                Data Engine
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        <div className="text-[10px] font-mono font-bold tracking-[0.2em] text-slate-600 mb-4 px-2 uppercase">
          Trading Suite
        </div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-3.5 rounded-sm transition-all duration-500 group ${
                isActive 
                  ? "bg-slate-900 border border-slate-800 text-white shadow-[inset_2px_0_0_0_#f59e0b]" // amber-500 hex
                  : "text-slate-400 hover:bg-slate-900/50 hover:text-slate-200"
              }`}>
                <div className={`${isActive ? "text-amber-500" : "text-slate-500 group-hover:text-slate-400"} transition-colors duration-500`}>
                  {item.icon}
                </div>
                <span className="text-sm font-bold tracking-wide">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* --- BOTTOM ADMIN AREA --- */}
      <div className="p-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3 px-3 py-3 rounded-sm text-slate-500 hover:text-white hover:bg-slate-900/50 transition-colors duration-500 cursor-pointer mb-2">
          <Settings size={18} />
          <span className="text-sm font-bold tracking-wide">System Config</span>
        </div>
        
        <div className="px-3 flex items-center gap-3 pt-2">
          <div className="h-8 w-8 rounded-sm bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-xs font-bold text-white">AD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">Admin Console</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Keeping the online status green, as it's a universal UI standard for "connected" */}
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
      </div>
      
    </aside>
  );
}