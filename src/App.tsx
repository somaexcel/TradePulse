import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  Wallet, 
  Bell, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  LayoutDashboard,
  LineChart as LineChartIcon,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getMarketAnalysis } from './services/gemini';
import { MarketAnalysis, Recommendation, MarketAsset } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_CHART_DATA = [
  { name: '09:00', value: 42000 },
  { name: '10:00', value: 42500 },
  { name: '11:00', value: 41800 },
  { name: '12:00', value: 43200 },
  { name: '13:00', value: 42900 },
  { name: '14:00', value: 44100 },
  { name: '15:00', value: 43800 },
];

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'safe' | 'volatile'>('all');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [notifications, setNotifications] = useState<string[]>([]);

  const syncMarket = async () => {
    setLoading(true);
    try {
      const data = await getMarketAnalysis();
      setAnalysis(data);
      // Simulate real-time notifications
      const newSignal = data.recommendations[0];
      if (newSignal) {
        setNotifications(prev => [`New ${newSignal.type.toUpperCase()} signal for ${newSignal.symbol}`, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncMarket();
  }, []);

  const filteredRecommendations = analysis?.recommendations.filter(rec => {
    const matchesBudget = budgetFilter === 'all' || rec.budgetCategory === budgetFilter;
    if (activeTab === 'safe') return matchesBudget && rec.riskLevel === 'low';
    if (activeTab === 'volatile') return matchesBudget && rec.riskLevel === 'high';
    return matchesBudget;
  }) || [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center bg-[#E4E3E0] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#141414] flex items-center justify-center rounded-sm">
            <TrendingUp className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif italic font-bold tracking-tight">TradePulse AI</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={syncMarket}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span className="text-xs font-mono uppercase tracking-widest">Sync Market</span>
          </button>
          
          <div className="relative">
            <Bell className="w-6 h-6 cursor-pointer" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Sidebar / Navigation */}
        <aside className="lg:col-span-2 border-r border-[#141414] p-6 space-y-8">
          <nav className="space-y-4">
            <p className="text-[10px] font-mono uppercase opacity-50 mb-4">Navigation</p>
            <NavItem 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Dashboard" 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')} 
            />
            <NavItem 
              icon={<Shield className="w-4 h-4" />} 
              label="Safe Mode" 
              active={activeTab === 'safe'} 
              onClick={() => setActiveTab('safe')} 
            />
            <NavItem 
              icon={<AlertTriangle className="w-4 h-4" />} 
              label="Volatility" 
              active={activeTab === 'volatile'} 
              onClick={() => setActiveTab('volatile')} 
            />
          </nav>

          <div className="space-y-4">
            <p className="text-[10px] font-mono uppercase opacity-50 mb-4">Budget Filter</p>
            <div className="flex flex-col gap-2">
              {['all', 'low', 'medium', 'high'].map((b) => (
                <button
                  key={b}
                  onClick={() => setBudgetFilter(b as any)}
                  className={cn(
                    "text-left px-3 py-2 text-xs font-mono uppercase transition-all border",
                    budgetFilter === b ? "bg-[#141414] text-[#E4E3E0] border-[#141414]" : "border-transparent hover:border-[#141414]"
                  )}
                >
                  {b} Budget
                </button>
              ))}
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="space-y-4">
              <p className="text-[10px] font-mono uppercase opacity-50 mb-4">Live Signals</p>
              <div className="space-y-2">
                {notifications.map((n, i) => (
                  <div key={i} className="text-[10px] font-mono p-2 border border-[#141414]/20 bg-white/50">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-7 border-r border-[#141414] overflow-y-auto max-h-[calc(100vh-89px)]">
          {/* Market Summary */}
          <section className="p-8 border-b border-[#141414]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-4xl font-serif italic mb-4">Market Pulse</h2>
                <p className="text-lg leading-relaxed opacity-80 max-w-xl">
                  {analysis?.summary || "Syncing real-time market data and generating AI analysis..."}
                </p>
              </div>
              <div className="w-64 h-32 hidden md:block">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={MOCK_CHART_DATA}>
                    <Line type="monotone" dataKey="value" stroke="#141414" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-[10px] font-mono text-center mt-2 opacity-50 uppercase tracking-widest">Global Index Trend</div>
              </div>
            </div>
          </section>

          {/* Recommendations Table */}
          <section className="p-0">
            <div className="grid grid-cols-6 p-4 border-b border-[#141414] bg-[#141414]/5">
              <div className="col-span-2 text-[10px] font-mono uppercase opacity-50">Asset</div>
              <div className="text-[10px] font-mono uppercase opacity-50">Signal</div>
              <div className="text-[10px] font-mono uppercase opacity-50">Target</div>
              <div className="text-[10px] font-mono uppercase opacity-50">Risk</div>
              <div className="text-[10px] font-mono uppercase opacity-50 text-right">Action</div>
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 p-6 border-b border-[#141414] animate-pulse">
                    <div className="col-span-2 h-4 bg-[#141414]/10 rounded w-3/4" />
                    <div className="h-4 bg-[#141414]/10 rounded w-1/2" />
                    <div className="h-4 bg-[#141414]/10 rounded w-1/2" />
                    <div className="h-4 bg-[#141414]/10 rounded w-1/2" />
                  </div>
                ))
              ) : (
                filteredRecommendations.map((rec, i) => (
                  <motion.div 
                    key={rec.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="data-row grid grid-cols-6 p-6 items-center"
                  >
                    <div className="col-span-2">
                      <div className="font-bold text-lg">{rec.symbol}</div>
                      <div className="text-xs opacity-60">{rec.asset}</div>
                    </div>
                    <div>
                      <span className={cn(
                        "px-2 py-1 text-[10px] font-mono uppercase border",
                        rec.type === 'buy' ? "border-green-600 text-green-600" : 
                        rec.type === 'sell' ? "border-red-600 text-red-600" : "border-gray-600"
                      )}>
                        {rec.type}
                      </span>
                    </div>
                    <div className="font-mono text-sm">${rec.targetPrice.toLocaleString()}</div>
                    <div>
                      <span className={cn(
                        "text-[10px] font-mono uppercase",
                        rec.riskLevel === 'high' ? "text-red-500" : 
                        rec.riskLevel === 'medium' ? "text-orange-500" : "text-green-500"
                      )}>
                        {rec.riskLevel}
                      </span>
                    </div>
                    <div className="text-right">
                      <button className="p-2 border border-current hover:bg-current hover:text-inherit transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="col-span-6 mt-4 text-xs opacity-70 italic font-serif">
                      " {rec.reason} " — {rec.timeframe}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Right Sidebar - Market Stats */}
        <aside className="lg:col-span-3 p-6 space-y-8 bg-[#141414]/5">
          <div>
            <h3 className="text-xl font-serif italic mb-6">Market Leaders</h3>
            <div className="space-y-4">
              {analysis?.topGainers.map((asset) => (
                <div key={asset.symbol} className="flex justify-between items-center p-3 border border-[#141414]/10 bg-white">
                  <div>
                    <div className="font-bold text-sm">{asset.symbol}</div>
                    <div className="text-[10px] font-mono uppercase opacity-50">{asset.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm">${asset.price.toLocaleString()}</div>
                    <div className={cn("text-[10px] font-mono", asset.change >= 0 ? "text-green-600" : "text-red-600")}>
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-serif italic mb-6">Safe Mode Picks</h3>
            <div className="space-y-4">
              {analysis?.safeOptions.map((asset) => (
                <div key={asset.symbol} className="flex justify-between items-center p-3 border border-green-600/20 bg-green-50/30">
                  <div>
                    <div className="font-bold text-sm">{asset.symbol}</div>
                    <div className="text-[10px] font-mono uppercase opacity-50">Secure Return</div>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-[#141414] text-[#E4E3E0] space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <h4 className="text-sm font-mono uppercase tracking-widest">Portfolio Value</h4>
            </div>
            <div className="text-3xl font-serif italic">$124,502.00</div>
            <div className="flex items-center gap-1 text-green-400 text-xs font-mono">
              <ArrowUpRight className="w-3 h-3" />
              +12.4% Today
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-sm transition-all border",
        active ? "bg-[#141414] text-[#E4E3E0] border-[#141414]" : "border-transparent hover:border-[#141414]"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}
