// Interface for a dream symbol and its meaning
export interface SymbolismItem {
  symbol: string;
  meaning: string;
}

// Interface for dream analysis
export interface Analysis {
  symbolism: SymbolismItem[];
  emotional: string;
  advice: string;
}

// Interface for a saved dream
export interface SavedDream {
  id: string;
  createdAt: string;
  dream: string;
  mood: string;
  analysis: string;
  symbols: SymbolismItem[];
} 