"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TickerContextType {
  selectedTicker: string | null;
  setSelectedTicker: (ticker: string | null) => void;
}

const TickerContext = createContext<TickerContextType | undefined>(undefined);

export function TickerProvider({ children }: { children: React.ReactNode }) {
  // We initialize with NULL so the app knows we haven't picked anything yet.
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  return (
    <TickerContext.Provider value={{ selectedTicker, setSelectedTicker }}>
      {children}
    </TickerContext.Provider>
  );
}

export function useTicker() {
  const context = useContext(TickerContext);
  if (context === undefined) {
    throw new Error("useTicker must be used within a TickerProvider");
  }
  return context;
}