"use client";

import React, { createContext, useContext, useState } from "react";

// 1. Define the shape of our global memory
interface TickerContextType {
  globalTicker: string;
  setGlobalTicker: (ticker: string) => void;
}

// 2. Create the Context (The Brain)
const TickerContext = createContext<TickerContextType | undefined>(undefined);

// 3. Create the Provider (The wrapper that shares the memory)
export function TickerProvider({ children }: { children: React.ReactNode }) {
  const [globalTicker, setGlobalTicker] = useState("RELIANCE.NS");

  return (
    <TickerContext.Provider value={{ globalTicker, setGlobalTicker }}>
      {children}
    </TickerContext.Provider>
  );
}

// 4. Create a custom hook so pages can easily tap into the Brain
export function useTicker() {
  const context = useContext(TickerContext);
  if (context === undefined) {
    throw new Error("useTicker must be used within a TickerProvider");
  }
  return context;
}