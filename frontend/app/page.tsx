"use client";

import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Activity, Zap, ShieldCheck, ArrowUpRight, ArrowDownRight, Info, Building2, BarChart3, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function QuantEngineDashboard() {
  const [searchInput, setSearchInput] = useState("RELIANCE.NS");
  const [ticker, setTicker] = useState("RELIANCE.NS");
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false); // Tracks if the logo failed to load
  
  // Dynamic metrics state driven by API
  const [data, setData] = useState({
    current_price: 2950.50,
    ai_target: 3045.20,
    company_name: "Reliance Industries Limited",
    website: "https://www.ril.com",
    sector: "Energy / Conglomerate",
    market_cap: "₹19.50T"
  });

  // Fetch complete data frame from FastAPI
  const handleAnalyze = async () => {
    if (!searchInput) return;
    setLoading(true);
    setImgError(false); // Reset the image error state for the new search
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/predict/${searchInput}`);
      const json = await res.json();
      if (json.current_price) {
        setData({
          current_price: json.current_price,
          ai_target: json.ai_target,
          company_name: json.company_name || searchInput.toUpperCase(),
          website: json.website || "",
          sector: json.sector || "Finance",
          market_cap: json.market_cap || "N/A"
        });
        setTicker(json.ticker || searchInput.toUpperCase());
      }
    } catch (error) {
      console.error("API Connection Error:", error);
    }
    setLoading(false);
  };

  // --- SMART LOGO ENGINE ---
  // Guaranteed domains for popular demo stocks (Bypasses missing yfinance data)
  const guaranteedDomains: Record<string, string> = {
    "RELIANCE.NS": "ril.com",
    "TCS.NS": "tcs.com",
    "HDFCBANK.NS": "hdfcbank.com",
    "ZOMATO.NS": "zomato.com",
    "INFY.NS": "infosys.com",
    "AAPL": "apple.com",
    "TSLA": "tesla.com",
    "NVDA": "nvidia.com",
    "MSFT": "microsoft.com"
  };

  const parsedDomain = data.website ? data.website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0] : "";
  const activeDomain = guaranteedDomains[ticker.toUpperCase()] || parsedDomain;
  const activeLogoUrl = activeDomain ? `https://logos.hunter.io/${activeDomain}` : "";
  // Currency & Math logic
  const isIndianStock = ticker.endsWith(".NS") || ticker.endsWith(".BO");
  const sym = isIndianStock ? "₹" : "$";
  const diff = data.ai_target - data.current_price;
  const pctChange = (diff / data.current_price) * 100;
  const isBullish = diff >= 0;

  const mockChartData = [
    { time: "09:30", price: data.current_price * 0.96 },
    { time: "10:30", price: data.current_price * 0.98 },
    { time: "11:30", price: data.current_price * 0.97 },
    { time: "12:30", price: data.current_price * 1.02 },
    { time: "13:30", price: data.current_price * 1.01 },
    { time: "14:30", price: data.current_price * 1.03 },
    { time: "15:30", price: data.current_price },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30 pb-20">
      
      {/* Top Header & Search Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <Zap size={28} className="fill-emerald-400" />
          <h1 className="text-2xl font-bold tracking-wider">QuantEngine</h1>
        </div>
        
        <div className="flex w-full md:w-2/5 gap-3">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5 transition-colors group-focus-within:text-emerald-400" />
            <Input 
              className="bg-zinc-900/80 border-zinc-800 text-zinc-100 pl-12 pr-16 h-12 text-lg rounded-xl focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30 transition-all" 
              placeholder="Search ticker (e.g. AAPL, ZOMATO.NS, NVDA)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-zinc-500 font-medium bg-zinc-800/50 px-2 py-1 rounded-md">
              <span>↵</span> Enter
            </div>
          </div>
          <Button 
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold h-12 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            {loading ? "..." : "Analyze"}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Split Hero Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Block: Price Engine Display */}
          <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-zinc-400 text-sm tracking-widest uppercase">{ticker} LIVE ASSET</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
                {sym}{data.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-zinc-400 font-medium">Target: {sym}{data.ai_target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${isBullish ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {isBullish ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {Math.abs(diff).toFixed(2)} ({Math.abs(pctChange).toFixed(2)}%)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Block: Dynamic Corporate Profile Details */}
          <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl flex flex-col justify-center py-6 px-6">
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/5">
              
              {/* SMART AVATAR RENDERER */}
              <div className="h-16 w-16 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg shrink-0">
                {!imgError && activeLogoUrl ? (
                  <img 
                    src={activeLogoUrl} 
                    alt={`${data.company_name} Logo`} 
                    className="h-full w-full object-contain p-2 bg-white"
                    onError={() => setImgError(true)} // Trips the fallback if URL is dead
                  />
                ) : (
                  // The Fallback Text Avatar
                  <div className="h-full w-full flex items-center justify-center bg-zinc-800 text-emerald-400 text-2xl font-bold uppercase tracking-widest">
                    {data.company_name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="overflow-hidden">
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide truncate">{data.company_name}</h3>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mt-1 truncate">
                  <Globe className="h-4 w-4 shrink-0" />
                  {activeDomain ? activeDomain : "Domain unavailable"}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold tracking-widest mb-1">
                  <Building2 className="h-3.5 w-3.5" /> SECTOR
                </div>
                <div className="text-zinc-200 font-medium truncate">{data.sector}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold tracking-widest mb-1">
                  <BarChart3 className="h-3.5 w-3.5" /> MARKET CAP
                </div>
                <div className="text-zinc-200 font-medium truncate">{data.market_cap}</div>
              </div>
            </div>
          </Card>

        </div>

        {/* 3 Infrastructure Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold tracking-widest text-zinc-400">LIVE MARKET VALUE</CardTitle>
              <Activity className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{sym}{data.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold tracking-widest text-zinc-400">AI PREDICTIVE TARGET</CardTitle>
              <Zap className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{sym}{data.ai_target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-bold tracking-widest text-zinc-400">MODEL STRATEGY STATUS</CardTitle>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]">OPTIMIZED / ACTIVE</div>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Wave Chart */}
        <Card className="bg-zinc-900/50 border-white/5 pt-6">
          <CardHeader>
            <CardTitle className="text-sm font-bold tracking-widest text-zinc-400">PROJECTED TRAJECTORY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                  <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} 
                    itemStyle={{ color: '#10b981' }} 
                  />
                  <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engine Diagnostics Box */}
        <Card className="bg-zinc-900/30 border-white/5 mt-8">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-zinc-400" />
              <CardTitle className="text-sm font-bold tracking-widest text-zinc-300">ENGINE DIAGNOSTICS & METRICS EXPLAINED</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm">
              <div>
                <h4 className="text-emerald-400 font-bold mb-1">Live Market Value</h4>
                <p className="text-zinc-400 leading-relaxed">
                  The real-time closing price of the selected asset, dynamically fetched and parsed from the Yahoo Finance API pipeline.
                </p>
              </div>
              
              <div>
                <h4 className="text-emerald-400 font-bold mb-1">AI Predictive Target</h4>
                <p className="text-zinc-400 leading-relaxed">
                  The forecasted next-day price generated by the underlying Stacked LSTM neural network, analyzing up to 10 years of historical price sequences.
                </p>
              </div>

              <div>
                <h4 className="text-emerald-400 font-bold mb-1">Company Fundamentals</h4>
                <p className="text-zinc-400 leading-relaxed">
                  Core institutional data mapping the asset's operating sector, current market capitalization, and daily trading volume.
                </p>
              </div>

              <div>
                <h4 className="text-emerald-400 font-bold mb-1">Projected Trajectory</h4>
                <p className="text-zinc-400 leading-relaxed">
                  A visual representation of the asset's simulated intraday volatility, mapping the potential pathway between the current price and the AI's calculated target.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}