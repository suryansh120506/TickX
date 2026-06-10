"use client";

import React, { useState } from "react";
import { Cpu, Wallet, ShieldAlert, Play, Square, Activity, Terminal, ArrowRightLeft, Info, CheckCircle2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTicker } from "../../context/TickerContext";

export default function RoboAdvisorPage() {
  const { globalTicker: targetAsset, setGlobalTicker: setTargetAsset } = useTicker();
  const [isActive, setIsActive] = useState(false);
  const [riskLevel, setRiskLevel] = useState("Moderate");
  
  // Controls the dark blur overlay tutorial
  const [showTutorial, setShowTutorial] = useState(true);

  // Simulated Paper Ledger State
  const ledger = {
    totalValue: 102450.00,
    cash: 42450.00,
    pnl: 2450.00,
    pnlPct: 2.45
  };

  // Simulated live execution logs for the UI
  const [logs, setLogs] = useState([
    { time: "10:30:12", type: "SYSTEM", msg: "RL Agent initialized. Waiting for parameters." },
    { time: "10:30:15", type: "DATA", msg: "Paper trading ledger synced. Cash: ₹100,000" }
  ]);

  const toggleAgent = () => {
    setIsActive(!isActive);
    const timeNow = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    if (!isActive) {
      setLogs(prev => [...prev, { time: timeNow, type: "START", msg: `Engaging RL model on ${targetAsset} [Risk: ${riskLevel}]` }]);
    } else {
      setLogs(prev => [...prev, { time: timeNow, type: "STOP", msg: "Agent disengaged. Closing open sockets." }]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8 font-sans selection:bg-emerald-500/30 pb-20 relative">
      
      {/* --- THE ONBOARDING OVERLAY MODAL --- */}
      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-500">
          <Card className="max-w-2xl w-full bg-zinc-900 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative overflow-hidden">
            {/* Glowing top border accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Cpu className="h-6 w-6 text-emerald-400" />
                </div>
                <CardTitle className="text-2xl font-bold tracking-wider text-white">ROBO-ADVISOR INITIALIZATION</CardTitle>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Welcome to the Autonomous Trading Sandbox. This module utilizes advanced Reinforcement Learning to analyze real-time market data and execute simulated trades. You are currently operating in a risk-free paper trading environment with a starting virtual balance of ₹100,000.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">1. Select Target Asset</h4>
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Input the specific stock ticker you want the AI to monitor. The engine will instantly connect to the live order book for this asset.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">2. Set Risk Parameters</h4>
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Adjust the trading strategy. 'Conservative' strictly protects your capital with tight stop-losses, while 'Aggressive' allows the AI to chase high-volatility rewards.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-wide">3. Deploy & Monitor</h4>
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed">Once deployed, the agent operates autonomously. Watch the execution terminal to see live market evaluations and instant Buy/Sell triggers.</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setShowTutorial(false)}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold text-sm tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all mt-4"
              >
                ACKNOWLEDGE & BEGIN SEQUENCE
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      {/* ------------------------------------ */}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Cpu size={32} className="text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-wider">Autonomous Robo-Advisor</h1>
            <p className="text-zinc-500 text-sm">Reinforcement Learning Agent & Paper Trading Ledger</p>
          </div>
        </div>
        
        {/* Info button to recall the tutorial */}
        <Button 
          variant="outline" 
          onClick={() => setShowTutorial(true)}
          className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30"
        >
          <Info className="h-4 w-4 mr-2" />
          Info
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RL COMMAND CONSOLE (Left side) */}
        <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl lg:col-span-1">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-sm font-bold tracking-widest text-zinc-400 flex items-center gap-2">
              <Activity className="h-4 w-4" /> AGENT COMMAND CENTER
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            {/* Status Indicator */}
            <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-xl border border-white/5">
              <span className="text-sm font-bold text-zinc-400">CORE STATUS</span>
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                </div>
                <span className={`font-bold tracking-wide ${isActive ? 'text-emerald-500' : 'text-yellow-500'}`}>
                  {isActive ? 'ACTIVE / TRADING' : 'STANDBY MODE'}
                </span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 tracking-widest mb-2 block">TARGET ASSET</label>
                <Input 
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500/50 h-12" 
                  value={targetAsset}
                  onChange={(e) => setTargetAsset(e.target.value.toUpperCase())}
                  disabled={isActive}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-500 tracking-widest mb-2 block">STRATEGY PARAMETER</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Conservative', 'Moderate', 'Aggressive'].map((level) => (
                    <button
                      key={level}
                      disabled={isActive}
                      onClick={() => setRiskLevel(level)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                        riskLevel === level 
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 disabled:opacity-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Big Action Button */}
            <Button 
              onClick={toggleAgent}
              className={`w-full h-14 text-lg font-bold tracking-widest transition-all ${
                isActive 
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
              }`}
            >
              {isActive ? <><Square className="mr-2 h-5 w-5 fill-current" /> DISENGAGE AGENT</> : <><Play className="mr-2 h-5 w-5 fill-current" /> DEPLOY AGENT</>}
            </Button>
            
          </CardContent>
        </Card>

        {/* LEDGER & TERMINAL (Right side) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Paper Ledger Stats */}
          <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-bold tracking-widest text-zinc-400 flex items-center gap-2">
                <Wallet className="h-4 w-4" /> LIVE PAPER LEDGER
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-zinc-500 text-xs font-bold tracking-widest mb-1">TOTAL PORTFOLIO</p>
                  <p className="text-3xl font-bold text-white">₹{ledger.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-bold tracking-widest mb-1">AVAILABLE CASH</p>
                  <p className="text-3xl font-bold text-zinc-300">₹{ledger.cash.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-bold tracking-widest mb-1">NET PnL</p>
                  <p className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
                    +₹{ledger.pnl.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    <span className="text-sm bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">+{ledger.pnlPct}%</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Positions Table */}
          <Card className="bg-zinc-900/50 border-white/5 backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-sm font-bold tracking-widest text-zinc-400 flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" /> ACTIVE POSITIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 bg-zinc-950/50 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-bold tracking-widest">ASSET</th>
                      <th className="px-6 py-4 font-bold tracking-widest">SHARES</th>
                      <th className="px-6 py-4 font-bold tracking-widest">AVG PRICE</th>
                      <th className="px-6 py-4 font-bold tracking-widest">CURRENT PRICE</th>
                      <th className="px-6 py-4 font-bold tracking-widest text-right">RETURN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">RELIANCE.NS</td>
                      <td className="px-6 py-4 text-zinc-300">20</td>
                      <td className="px-6 py-4 text-zinc-300">₹2,850.00</td>
                      <td className="px-6 py-4 text-zinc-300">₹2,950.50</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">+3.52%</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">TCS.NS</td>
                      <td className="px-6 py-4 text-zinc-300">5</td>
                      <td className="px-6 py-4 text-zinc-300">₹3,900.00</td>
                      <td className="px-6 py-4 text-zinc-300">₹3,980.00</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400">+2.05%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Execution Terminal */}
          <Card className="bg-[#050505] border-white/5 backdrop-blur-xl font-mono">
            <CardHeader className="border-b border-white/5 pb-3 bg-zinc-900/30">
              <CardTitle className="text-xs font-bold tracking-widest text-zinc-500 flex items-center gap-2">
                <Terminal className="h-4 w-4" /> AGENT EXECUTION LOG
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-48 overflow-y-auto">
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="text-sm flex gap-3">
                    <span className="text-zinc-600">[{log.time}]</span>
                    <span className={`w-16 font-bold ${
                      log.type === 'START' ? 'text-emerald-500' : 
                      log.type === 'STOP' ? 'text-red-500' : 
                      log.type === 'BUY' ? 'text-cyan-500' :
                      log.type === 'SELL' ? 'text-purple-500' : 'text-zinc-500'
                    }`}>
                      {log.type}
                    </span>
                    <span className={log.type === 'START' ? 'text-emerald-400' : 'text-zinc-300'}>{log.msg}</span>
                  </div>
                ))}
                {isActive && (
                  <div className="text-sm flex gap-3 animate-pulse">
                    <span className="text-zinc-600">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                    <span className="w-16 font-bold text-yellow-500">SCAN</span>
                    <span className="text-zinc-500">Evaluating conditions for {targetAsset}...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* --- EDUCATIONAL FOOTER --- */}
      <Card className="bg-zinc-900/30 border-white/5 mt-8">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-zinc-400" />
            <CardTitle className="text-sm font-bold tracking-widest text-zinc-300">HOW PAPER TRADING WORKS</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6 text-sm">
            <div>
              <div className="text-emerald-400/20 font-black text-4xl mb-1 -ml-1">01</div>
              <h4 className="text-emerald-400 font-bold mb-1">Market Sync</h4>
              <p className="text-zinc-400 leading-relaxed">
                The terminal connects directly to the live exchange API, streaming real-time order books and price action directly to your dashboard.
              </p>
            </div>
            
            <div>
              <div className="text-emerald-400/20 font-black text-4xl mb-1 -ml-1">02</div>
              <h4 className="text-emerald-400 font-bold mb-1">AI Evaluation</h4>
              <p className="text-zinc-400 leading-relaxed">
                The Robo-Advisor scans the data through its predictive model, analyzing historical patterns to identify optimal entry and exit points.
              </p>
            </div>

            <div>
              <div className="text-emerald-400/20 font-black text-4xl mb-1 -ml-1">03</div>
              <h4 className="text-emerald-400 font-bold mb-1">Simulated Execution</h4>
              <p className="text-zinc-400 leading-relaxed">
                When a signal triggers, the agent "buys" or "sells" shares using your virtual ₹100,000 balance. No real capital is ever at risk.
              </p>
            </div>

            <div>
              <div className="text-emerald-400/20 font-black text-4xl mb-1 -ml-1">04</div>
              <h4 className="text-emerald-400 font-bold mb-1">PnL Tracking</h4>
              <p className="text-zinc-400 leading-relaxed">
                Your virtual portfolio updates in real-time as the live market moves, allowing you to safely test the AI's profitability over time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}