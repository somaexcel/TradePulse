export interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  type: 'stock' | 'crypto';
  volatility: 'low' | 'medium' | 'high';
}

export interface Recommendation {
  asset: string;
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  reason: string;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  budgetCategory: 'low' | 'medium' | 'high';
}

export interface MarketAnalysis {
  summary: string;
  recommendations: Recommendation[];
  topGainers: MarketAsset[];
  highVolatility: MarketAsset[];
  safeOptions: MarketAsset[];
}
