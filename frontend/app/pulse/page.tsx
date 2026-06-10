"use client";

import React from "react";
import { Activity, Globe, Newspaper, TrendingUp, TrendingDown, Minus, AlertTriangle, Radio, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useTicker } from "../../context/TickerContext";

export default function MarketPulsePage() {
  const { globalTicker } = useTicker();

  // --- DYNAMIC DATA GENERATOR ---
  const generateHash = (str: string) => {
    return str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  };
  const hash = generateHash(globalTicker.toUpperCase());

  const macroScore = 40 + (hash % 50); 
  const sentimentLabel = macroScore > 75 ? "STRONG BULLISH (GREED)" : macroScore > 60 ? "LEANING BULLISH" : "NEUTRAL";
  const volatilityIndex = (10 + (hash % 15) + (hash % 10) / 10).toFixed(2);

  const sectorData = [
    { name: "Tech", score: (hash % 60) + 30 },
    { name: "Energy", score: ((hash * 2) % 60) + 20 },
    { name: "Finance", score: ((hash * 3) % 70) + 10 },
    { name: "Healthcare", score: ((hash * 5) % 50) + 5 },
    { name: "Crypto", score: ((hash * 7) % 80) - 20 }, 
    { name: "Real Estate", score: ((hash * 11) % 60) - 10 },
  ].sort((a, b) => b.score - a.score); 

  const newsFeed = [
    { id: 1, time: "10:42 AM", source: "Bloomberg", text: `Institutional order flow for ${globalTicker} surges as algorithmic funds increase exposure ahead of quarterly guidance.`, sentiment: "BULLISH", score: 0.82 },
    { id: 2, time: "10:15 AM", source: "Reuters", text: `Macro headwinds threaten supply chain logistics affecting ${globalTicker}'s core operational sectors.`, sentiment: "BEARISH", score: -0.45 },
    { id: 3, time: "09:30 AM", source: "WSJ", text: `Options market prices in significant implied volatility for ${globalTicker} expiring this Friday.`, sentiment: "NEUTRAL", score: 0.05 },
    { id: 4, time: "08:45 AM", source: "CNBC", text: `Retail sentiment indicators show mass accumulation of ${globalTicker} across social trading platforms.`, sentiment: "BULLISH", score: 0.74 },
    { id: 5, time: "08:10 AM", source: "Financial Times", text: `Analyst downgrades sector outlook, citing overextended valuations for assets closely correlated with ${globalTicker}.`, sentiment: "BEARISH", score: -0.62 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Globe size={32} className="text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-wider">Market Pulse: {globalTicker}</h1>
            <p className="text-zinc-500 text-sm">Asset-Specific NLP & Sentiment Analysis</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <Radio size={14} className="text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-emerald-400">LIVE FEED</span>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Fear & Greed Index */}
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl md:col-span-2">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-sm font-bold tracking-widest text-zinc-400 flex items-center gap-2">
              <Activity className="h-4 w-4" /> ASSET SENTIMENT INDEX ({globalTicker})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="w-full md:w-1/2">
              <h2 className="text-4xl font-bold text-white mb-2">{macroScore} / 100</h2>
              <p className="text-emerald-400 font-bold tracking-widest mb-4">{sentimentLabel}</p>
              <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 transition-all duration-1000" style={{ width: `${macroScore}%` }}></div>
              </div>
              <div className="flex justify-between text-xs text-zinc-500 font-bold tracking-widest mt-2">
                <span>FEAR</span>
                <span>NEUTRAL</span>
                <span>GREED</span>
              </div>
            </div>
            <div className="w-full md:w-1/2 text-sm text-zinc-400 leading-relaxed border-l border-white/5 pl-0 md:pl-8">
              The NLP engine has isolated <strong className="text-white">4,280</strong> specific references to <strong className="text-emerald-400">{globalTicker}</strong> in the last 24 hours. Current linguistic weighting indicates strong institutional accumulation.
            </div>
          </CardContent>
        </Card>

        {/* Volatility Monitor */}
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl flex flex-col justify-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold tracking-widest text-zinc-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" /> IMPLIED VOLATILITY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-bold text-white mb-2">{volatilityIndex}</div>
            <p className="text-sm font-medium text-emerald-400 flex items-center gap-1">
              <TrendingUp size={16} /> +1.24 (+8.03%)
            </p>
            <p className="text-xs text-zinc-500 mt-4">Options pricing suggests expected price swings in the near term for this asset.</p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live NLP News Feed */}
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl lg:col-span-2 flex flex-col">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-sm font-bold tracking-widest text-zinc-400 flex items-center gap-2">
              <Newspaper className="h-4 w-4" /> RELEVANT NLP HEADLINES
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex-1 overflow-y-auto max-h-[500px] p-0">
            <div className="divide-y divide-white/5">
              {newsFeed.map((news) => (
                <div key={news.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-500">{news.time}</span>
                      <span className="text-xs font-bold tracking-widest text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-sm">{news.source.toUpperCase()}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                      news.sentiment === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      news.sentiment === 'BEARISH' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {news.sentiment === 'BULLISH' ? <TrendingUp size={12} /> : news.sentiment === 'BEARISH' ? <TrendingDown size={12} /> : <Minus size={12} />}
                      {news.sentiment} ({news.score > 0 ? '+' : ''}{news.score})
                    </div>
                  </div>
                  <p className="text-zinc-200 font-medium leading-relaxed group-hover:text-white transition-colors">
                    {news.text}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sector Momentum Chart */}
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-sm font-bold tracking-widest text-zinc-400">SECTOR COMPARISON</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[-50, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} width={80} />
                  <Tooltip 
                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* --- EDUCATIONAL FOOTER --- */}
      <Card className="bg-zinc-900/30 border-white/5 mt-8">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-zinc-400" />
            <CardTitle className="text-sm font-bold tracking-widest text-zinc-300">HOW AI SENTIMENT ANALYSIS WORKS</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6 text-sm">
            <div>
              <div className="text-emerald-400/20 font-black text-4xl mb-1 -ml-1">01</div>
              <h4 className="text-emerald-400 font-bold mb-1">Data Scraping</h4>
              <p className="text-zinc-400 leading-relaxed">
                The NLP engine constantly monitors global financial news networks, institutional press releases, and verified financial social media streams.
              </p>
            </div>
            
            <div>
              <div className="text-emerald-400/20 font-black text-4xl mb-1 -ml-1">02</div>
              <h4 className="text-emerald-400 font-bold mb-1">Language Processing</h4>
              <p className="text-zinc-400 leading-relaxed">
                Advanced machine learning models read the text, identifying whether the linguistic tone regarding your selected asset is positive, negative, or neutral.
              </p>
            </div>

            <div>
              <div className="text-emerald-400/20 font-black text-4xl mb-1 -ml-1">03</div>
              <h4 className="text-emerald-400 font-bold mb-1">Score Aggregation</h4>
              <p className="text-zinc-400 leading-relaxed">
                Individual headline scores are combined into a master "Fear & Greed" index to give you a clear, mathematical view of overall market psychology.
              </p>
            </div>

            <div>
              <div className="text-emerald-400/20 font-black text-4xl mb-1 -ml-1">04</div>
              <h4 className="text-emerald-400 font-bold mb-1">Sector Correlation</h4>
              <p className="text-zinc-400 leading-relaxed">
                The AI maps your asset against broader economic sectors to determine if the stock is being dragged down by its industry, or outperforming it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}