"use client";

import React, { useState, useEffect, useRef } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Activity, Zap, ShieldCheck, ArrowUpRight, ArrowDownRight, Building2, BarChart3, Globe, ServerOff, RefreshCcw, AlertTriangle, Target, Cpu, Layers, LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTicker } from "../context/TickerContext";

// --- SMART SEARCH DIRECTORY ---
const STOCK_DIRECTORY = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc. (Google)" },
  { symbol: "RELIANCE.NS", name: "Reliance Industries" },
  { symbol: "ZOMATO.NS", name: "Zomato Ltd." },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors" },
  { symbol: "TATAPOWER.NS", name: "Tata Power" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "INFY.NS", name: "Infosys Limited" },
  { symbol: "SBIN.NS", name: "State Bank of India" },
  { symbol: "ITC.NS", name: "ITC Limited" },
  { symbol: "PAYTM.NS", name: "One97 Communications (Paytm)" },
  { symbol: "SUZLON.NS", name: "Suzlon Energy" }
];

export default function QuantEngineDashboard() {
  const { globalTicker: ticker, setGlobalTicker: setTicker } = useTicker();
  const [searchInput, setSearchInput] = useState(ticker);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(STOCK_DIRECTORY);
  
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false); 
  const [searchError, setSearchError] = useState("");
  const [failedTicker, setFailedTicker] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [data, setData] = useState({
    current_price: 2950.50,
    ai_target: 3045.20,
    company_name: "Reliance Industries Limited",
    website: "https://www.ril.com",
    sector: "Energy / Conglomerate",
    market_cap: "₹19.50T"
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchInput.trim() === "") {
      setFilteredSuggestions([]);
      return;
    }
    const query = searchInput.toLowerCase();
    const results = STOCK_DIRECTORY.filter(stock => 
      stock.symbol.toLowerCase().includes(query) || 
      stock.name.toLowerCase().includes(query)
    ).slice(0, 5); 
    
    setFilteredSuggestions(results);
  }, [searchInput]);

  const handleSuggestionClick = (symbol: string) => {
    setSearchInput(symbol);
    setShowSuggestions(false);
    handleAnalyze(symbol);
  };

  const handleAnalyze = async (overrideTicker?: string) => {
    const queryToUse = overrideTicker || searchInput;
    if (!queryToUse) return;
    
    setLoading(true);
    setImgError(false);
    setSearchError(""); 
    setFailedTicker("");
    setShowSuggestions(false);
    
    let cleanQuery = queryToUse.trim().toUpperCase().replace(/\s+/g, '');
    let finalQuery = cleanQuery;

    const matchedStock = STOCK_DIRECTORY.find(
      s => s.name.toUpperCase().replace(/\s+/g, '') === cleanQuery || 
           s.symbol.toUpperCase() === cleanQuery
    );

    if (matchedStock) {
      finalQuery = matchedStock.symbol;
      setSearchInput(matchedStock.symbol); 
    } else {
      setSearchInput(queryToUse.toUpperCase());
    }

    const aliases: Record<string, string> = {
      "SBI": "SBIN.NS", "HDFC": "HDFCBANK.NS", "BAJAJFINANCE": "BAJFINANCE.NS",
      "TATAMOTOR": "TATAMOTORS.NS", "TATAPOWER": "TATAPOWER.NS"
    };
    if (aliases[finalQuery]) finalQuery = aliases[finalQuery];

    const indianBlueChips = ["ZOMATO", "RELIANCE", "TCS", "HDFCBANK", "INFY", "WIPRO", "ITC", "SUZLON", "PAYTM", "TATAMOTORS", "TATAPOWER", "SBIN"];
    if (indianBlueChips.includes(finalQuery)) {
      finalQuery = `${finalQuery}.NS`;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/predict/${finalQuery}`);
      
      if (!res.ok) {
        setSearchError(`Unable to resolve asset information.`);
        setFailedTicker(queryToUse); 
        setLoading(false);
        return;
      }

      const json = await res.json();
      if (json.current_price) {
        setData({
          current_price: json.current_price,
          ai_target: json.ai_target,
          company_name: json.company_name || finalQuery,
          website: json.website || "",
          sector: json.sector || "Finance",
          market_cap: json.market_cap || "N/A"
        });
        setTicker(json.ticker || finalQuery);
        setSearchInput(json.ticker || finalQuery); 
      }
    } catch (error) {
      console.error("API Connection Error:", error);
      setSearchError("Network interface offline. Verification required.");
      setFailedTicker(queryToUse);
    }
    setLoading(false);
  };

  const guaranteedDomains: Record<string, string> = {
    "RELIANCE.NS": "ril.com", "TCS.NS": "tcs.com", "HDFCBANK.NS": "hdfcbank.com",
    "ZOMATO.NS": "zomato.com", "INFY.NS": "infosys.com", "TATAMOTORS.NS": "tatamotors.com",
    "TATAPOWER.NS": "tatapower.com", "AAPL": "apple.com", "TSLA": "tesla.com", "NVDA": "nvidia.com", "MSFT": "microsoft.com"
  };

  const parsedDomain = data.website ? data.website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0] : "";
  const activeDomain = guaranteedDomains[ticker.toUpperCase()] || parsedDomain;
  const activeLogoUrl = activeDomain ? `https://logos.hunter.io/${activeDomain}` : "";

  const isIndianStock = ticker.endsWith(".NS") || ticker.endsWith(".BO");
  const sym = isIndianStock ? "₹" : "$";
  const diff = data.ai_target - data.current_price;
  const pctChange = (diff / data.current_price) * 100;
  const isBullish = diff >= 0;

  const mockChartData = [
    { time: "09:30", price: data.current_price * 0.96 }, { time: "10:30", price: data.current_price * 0.98 },
    { time: "11:30", price: data.current_price * 0.97 }, { time: "12:30", price: data.current_price * 1.02 },
    { time: "13:30", price: data.current_price * 1.01 }, { time: "14:30", price: data.current_price * 1.03 },
    { time: "15:30", price: data.current_price },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30 pb-20 flex flex-col">
      
      {/* --- NEW STYLISH PREMIUM HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 shrink-0 relative z-50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Zap size={24} className="text-emerald-400 fill-emerald-400/50" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm">
              QUANT<span className="text-white">ENGINE</span>
            </h1>
            <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase mt-0.5">
              Live Market Intelligence
            </p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex flex-col w-full md:w-2/5 gap-2" ref={searchRef}>
          <div className="flex w-full gap-3 relative">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5 transition-colors group-focus-within:text-emerald-400 z-10" />
              <Input 
                className={`bg-zinc-900 text-zinc-100 pl-12 pr-16 h-12 text-lg rounded-xl transition-all shadow-inner relative z-10 ${searchError ? 'border-red-500/50 focus-visible:ring-red-500/50' : 'border-zinc-800 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30'}`} 
                placeholder="Search company or ticker..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-zinc-500 font-medium bg-zinc-800/80 px-2 py-1 rounded-md z-10">
                <span>↵</span> Enter
              </div>

              {/* AUTOCORRECT SUGGESTION DROPDOWN */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {filteredSuggestions.map((stock) => (
                    <div 
                      key={stock.symbol}
                      onClick={() => handleSuggestionClick(stock.symbol)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/80 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                    >
                      <span className="font-medium text-zinc-200">{stock.name}</span>
                      <span className="text-xs font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{stock.symbol}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              onClick={() => handleAnalyze()}
              disabled={loading}
              className={`font-bold h-12 px-6 rounded-xl transition-all z-10 ${searchError ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}
            >
              {loading ? "..." : "Analyze"}
            </Button>
          </div>
        </div>
      </div>

      {/* --- REFINED PREMIUM ERROR TERMINAL --- */}
      {searchError ? (
        <div className="flex-1 flex items-center justify-center animate-in fade-in zoom-in-95 duration-300 relative z-10">
          <Card className="max-w-2xl w-full bg-[#120505]/90 border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.15)] relative overflow-hidden backdrop-blur-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-80" />
            <CardHeader className="text-center pb-2 pt-10">
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                <ServerOff className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-widest text-red-100">ASSET UNRESOLVED</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6 px-8 pb-8">
              <p className="text-red-200/80 text-center leading-relaxed text-sm">
                The requested timeline for <strong className="text-red-400">"{failedTicker}"</strong> could not be finalized. This occurs if market connections are temporarily restricted or the identifier requires additional parameters.
              </p>
              
              {/* CLEAN GUIDELINE BLOCK */}
              <div className="bg-red-950/30 p-5 rounded-xl border border-red-500/20 space-y-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-red-200 text-xs font-bold tracking-wider mb-2">SEARCH GUIDELINES</h4>
                    <p className="text-red-300/70 text-sm leading-relaxed">
                      Try writing the full, actual name of the company, or ensure you are using the correct official ticker symbol. If you are searching for regional equities, verify that the appropriate exchange suffix is included.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (I Understand & Retry) */}
              <div className="pt-6 border-t border-red-500/10 flex flex-col sm:flex-row items-center justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleAnalyze(failedTicker)} 
                  className="w-full sm:w-auto bg-[#0a0202] border-red-500/20 text-red-300 hover:text-red-200 hover:bg-red-500/10 h-11 text-xs transition-colors"
                >
                  <RefreshCcw className="h-3.5 w-3.5 mr-2" /> Retry Connection
                </Button>
                <Button 
                  onClick={() => setSearchError("")} 
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white h-11 text-sm font-bold px-8 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all"
                >
                  I Understand
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* --- MAIN DASHBOARD (Only visible when no error) --- */
        <div className="max-w-7xl mx-auto space-y-6 w-full animate-in fade-in duration-500 relative z-10">
          
          {/* Top Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-zinc-400 text-sm tracking-widest uppercase">{ticker} PERFORMANCE MATRIX</CardTitle>
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

            <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl flex flex-col justify-center py-6 px-6">
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/5">
                <div className="h-16 w-16 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg shrink-0">
                  {!imgError && activeLogoUrl ? (
                    <img src={activeLogoUrl} alt="Logo" className="h-full w-full object-contain p-2 bg-white" onError={() => setImgError(true)} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-zinc-800 text-emerald-400 text-2xl font-bold uppercase tracking-widest">
                      {data.company_name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide truncate">{data.company_name}</h3>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mt-1 truncate">
                    <Globe className="h-4 w-4 shrink-0" />
                    {activeDomain ? activeDomain : "Domain identifier protected"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold tracking-widest mb-1">
                    <Building2 className="h-3.5 w-3.5" /> SECTOR STRUCTURE
                  </div>
                  <div className="text-zinc-200 font-medium truncate">{data.sector}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-bold tracking-widest mb-1">
                    <BarChart3 className="h-3.5 w-3.5" /> MARKET CAPITALIZATION
                  </div>
                  <div className="text-zinc-200 font-medium truncate">{data.market_cap}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900/50 border-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold tracking-widest text-zinc-400">RECORDED MARKET VALUE</CardTitle>
                <Activity className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{sym}{data.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold tracking-widest text-zinc-400">PREDICTIVE TARGET TRAJECTORY</CardTitle>
                <Zap className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{sym}{data.ai_target.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold tracking-widest text-zinc-400">STRATEGY LAYER STATUS</CardTitle>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-emerald-400">OPTIMIZED / ACTIVE</div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="bg-zinc-900/50 border-white/5 pt-6">
            <CardHeader>
              <CardTitle className="text-sm font-bold tracking-widest text-zinc-400">TREND PROJECTION LINE</CardTitle>
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
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#10b981' }} />
                    <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* --- MODERN STYLISH FEATURES BLOCK --- */}
          <div className="pt-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-wider text-white">Engine Diagnostics</h2>
                <p className="text-zinc-500 text-sm mt-1">Core metrics and predictive layers explained.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <Card className="bg-zinc-900/40 border-white/5 hover:bg-zinc-900/80 transition-all duration-300 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-cyan-500/20" />
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Target size={20} />
                  </div>
                  <h4 className="text-zinc-200 font-bold mb-2 tracking-wide">Live Market Value</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                    Real-time closing price dynamically fetched and parsed from institutional API pipelines.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/40 border-white/5 hover:bg-zinc-900/80 transition-all duration-300 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Cpu size={20} />
                  </div>
                  <h4 className="text-zinc-200 font-bold mb-2 tracking-wide">Predictive Target</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                    Forecasted next-day trajectory generated by our underlying Stacked LSTM neural network.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/40 border-white/5 hover:bg-zinc-900/80 transition-all duration-300 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20" />
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                    <Layers size={20} />
                  </div>
                  <h4 className="text-zinc-200 font-bold mb-2 tracking-wide">Core Fundamentals</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                    Institutional mapping of the asset's macro sector, capital structure, and trading volume.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/40 border-white/5 hover:bg-zinc-900/80 transition-all duration-300 group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20" />
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                    <LineChart size={20} />
                  </div>
                  <h4 className="text-zinc-200 font-bold mb-2 tracking-wide">Trend Trajectory</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                    Visual matrix of simulated intraday volatility mapping the pathway to the AI's target.
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}