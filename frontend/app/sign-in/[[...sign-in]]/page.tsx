"use client";

import React, { useState, useEffect } from "react";
import { SignIn } from "@clerk/nextjs";


export default function SignInPage() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const quotes = [
    {
      text: "The institutional-grade algorithmic trading suite driven by automated yFinance extraction pipelines.",
      author: "Core Architecture"
    },
    {
      text: "Deep-learning prediction terminal forecasting next-day volatility trajectories via Stacked LSTM networks.",
      author: "Predictive Engine"
    },
    {
      text: "Real-time Natural Language Processing aggregating macroeconomic market sentiment continuously.",
      author: "Market Pulse NLP"
    }
  ];

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <div className="flex min-h-screen w-full bg-[#000000] overflow-hidden fixed inset-0 z-[100]">
      
      {/* --- INJECTED CSS FOR FLOATING & FLAWLESS TRACER LINE --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes sweep {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .clerk-tracer-wrapper {
          position: relative;
          overflow: hidden;
          padding: 1px; /* The exact thickness of the border */
          border-radius: 0.75rem; 
        }
        .clerk-tracer-wrapper::before {
          content: '';
          position: absolute;
          top: 50%; 
          left: 50%;
          /* vmax guarantees the spinning gradient covers the box regardless of dimensions */
          width: 200vmax; 
          height: 200vmax;
          background: conic-gradient(from 0deg, transparent 75%, rgba(245, 158, 11, 1) 100%);
          /* Forces the rotation point to the absolute center of the box */
          transform-origin: center center;
          animation: sweep 4s linear infinite;
          z-index: 0;
        }
        .clerk-inner {
          position: relative;
          background: #050505;
          border-radius: calc(0.75rem - 1px);
          z-index: 10;
          width: 100%;
          height: 100%;
        }
      `}} />

      {/* =========================================
          LEFT PANEL: 70% FULL SCREEN INTEGRATION 
          ========================================= */}
      <div className="hidden lg:flex lg:w-[70%] relative flex-col items-center bg-[#020202]">
        
        {/* --- THE ENGINE ARCHITECTURE BACKGROUND --- */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="engine-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                {/* Diagonal Data Streams */}
                <path d="M 120 0 L 0 120" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="0.5" />
                <path d="M 0 0 L 120 120" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="0.5" />
                {/* Core Nodes */}
                <circle cx="60" cy="60" r="24" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                <circle cx="60" cy="60" r="8" fill="rgba(245, 158, 11, 0.1)" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
                {/* Connection Matrix */}
                <rect x="0" y="0" width="120" height="120" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#engine-pattern)" />
          </svg>
        </div>
        
        {/* Center Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

        {/* MAIN CONTAINER */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full py-16">
          
          <div className="flex-1" />

          {/* --- MASSIVE STACKED BRANDING --- */}
          <div className="flex flex-col items-center justify-center shrink-0">
            {/* Naked Floating Shard Logo */}
            <div 
              className="mb-8 flex items-center justify-center" 
              style={{ animation: 'float 6s ease-in-out infinite' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-24 h-24 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                <path d="M12 2L3 14l9 8 9-8-9-10z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
                <path d="M3 14l9-4 9 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
              </svg>
            </div>

            {/* Flat, Sharp Text */}
            <h1 className="text-[9rem] font-black tracking-tighter leading-none text-white drop-shadow-2xl">
              Tic<span className="text-amber-500">x</span>
            </h1>
            <span className="text-sm font-mono font-bold tracking-[0.4em] text-slate-500 uppercase mt-4">
              Quantitative Telemetry Engine
            </span>
          </div>

          {/* --- ROTATING SYSTEM INFO --- */}
          <div className="flex-1 flex flex-col justify-end w-full max-w-4xl px-10 pb-10">
            <div className="relative min-h-[120px] w-full flex items-center justify-center text-center">
              {mounted && quotes.map((quote, idx) => (
                <div 
                  key={idx}
                  className={`absolute w-full transition-all duration-1000 transform flex flex-col items-center ${
                    idx === quoteIndex 
                      ? "opacity-100 translate-y-0" 
                      : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                >
                  <p className="text-xl font-bold tracking-wide text-slate-300 leading-snug mb-4 max-w-2xl">
                    "{quote.text}"
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="w-8 h-[1px] bg-slate-700"></span>
                    <span className="text-xs font-mono tracking-widest text-amber-500 uppercase font-bold">
                      {quote.author}
                    </span>
                    <span className="w-8 h-[1px] bg-slate-700"></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================
          RIGHT PANEL: 30% DEEP BLACK CLERK AUTH 
          ========================================= */}
      <div className="w-full lg:w-[30%] flex items-center justify-center p-8 bg-[#000000] border-l border-slate-900 relative z-10 shadow-[-20px_0_50px_rgba(0,0,0,0.8)]">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/10 via-[#000000] to-[#000000] pointer-events-none z-0" />

        <div className="relative z-10 w-full max-w-md animate-in slide-in-from-right-12 fade-in duration-700">
          
          {/* THE PERFECT CLERK TRACER BORDER WRAPPER */}
          <div className="clerk-tracer-wrapper">
            <div className="clerk-inner pt-4">
              
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent border-none shadow-none w-full", 
                    headerTitle: "text-white font-black tracking-wider text-2xl uppercase",
                    headerSubtitle: "text-slate-500 font-mono text-xs mt-2",
                    socialButtonsBlockButton: "border border-slate-800 hover:bg-slate-900 bg-[#000000] text-white rounded-sm transition-all duration-300",
                    socialButtonsBlockButtonText: "font-bold text-xs tracking-wider",
                    dividerLine: "bg-slate-800",
                    dividerText: "text-slate-600 text-[10px] font-mono tracking-widest uppercase",
                    formFieldLabel: "text-slate-400 font-bold text-[10px] uppercase tracking-widest",
                    formFieldInput: "bg-[#000000] border border-slate-800 text-white rounded-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 h-10 transition-all",
                    formButtonPrimary: "bg-amber-500 hover:bg-amber-400 text-black font-black tracking-widest uppercase text-xs rounded-sm h-10 transition-colors",
                    footerActionText: "text-slate-500 text-xs",
                    footerActionLink: "text-amber-500 hover:text-amber-400 font-bold text-xs",
                    identityPreviewText: "text-white font-mono text-sm",
                    identityPreviewEditButtonIcon: "text-amber-500"
                  }
                }}
              />
              
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}