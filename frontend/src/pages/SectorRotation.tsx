import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/Badge'
import { ProgressMetric } from '../components/ui/Metric'

interface Sector {
  ticker: string
  name: string
  perf_3m: number
  perf_6m: number
  spread: number
  is_real_data: boolean
}

interface Stock {
  ticker: string
  name: string
  price: number
  perf_3m: number
  sector_perf_3m: number
  volume_today: number
  volume_avg_20d: number
  high_10d: number
  bb_expanding: boolean
  bb_upper: number
  bb_middle: number
  bb_lower: number
  sma50: number | null
  sma200: number | null
  is_real_data: boolean
}

export default function SectorRotation() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [analyzedStock, setAnalyzedStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDbConnected, setIsDbConnected] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    checkDbStatus()
    fetchSectors()
  }, [])

  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status')
      const data = await res.json()
      setIsDbConnected(data.connected)
    } catch {
      setIsDbConnected(false)
    }
  }

  const handleRefresh = () => {
    checkDbStatus()
    fetchSectors()
    setLastUpdated(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    if (selectedSector) {
      fetchStocks(selectedSector.ticker)
    }
  }, [selectedSector])

  const fetchSectors = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/sectors')
      if (!res.ok) throw new Error('Failed to fetch sectors')
      const data = await res.json()
      setSectors(data)
      if (data.length > 0) {
        setSelectedSector(data[0])
      }
    } catch (err) {
      console.error('Failed to fetch sectors:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStocks = async (sectorTicker: string) => {
    try {
      const res = await fetch(`/api/stocks/${sectorTicker}`)
      if (!res.ok) throw new Error('Failed to fetch stocks')
      const data = await res.json()
      setStocks(data)
    } catch (err) {
      console.error(err)
    }
  }

  const formatPercent = (val: number) => (val * 100).toFixed(2) + '%'

  const getOrdinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }

  const getLeaderboardPosition = (ticker: string): number => {
    return sectors.findIndex(s => s.ticker === ticker) + 1
  }

  const getStrengthScore = (stock: Stock): number => {
    let score = 0
    if (stock.bb_expanding) score += 25
    const isPriceBreakout = stock.price > stock.high_10d
    if (isPriceBreakout) score += 25
    if (stock.price > (stock.sma50 || 0)) score += 25
    if (stock.price > (stock.sma200 || 0)) score += 25
    return score
  }

  if (loading && sectors.length === 0) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <Activity className="w-16 h-16 text-emerald-500 animate-pulse" />
          <p className="text-zinc-400 font-mono text-lg tracking-widest uppercase">Scanning Market Sectors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 rounded-xl p-3">
            <TrendingUp className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Sector Rotation Scanner</h1>
            <p className="text-base text-zinc-500">Identify momentum and rotation patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm font-mono text-zinc-400">
          <StatusBadge
            status={isDbConnected ? 'connected' : 'disconnected'}
            label={isDbConnected ? 'S&P 1500 Connected' : 'Demo Mode'}
          />
          <button onClick={handleRefresh} className="p-2.5 hover:bg-zinc-800 rounded-xl transition-colors">
            <Activity className={`w-5 h-5 ${loading ? 'animate-spin' : ''} text-emerald-500`} />
          </button>
          <span className="text-zinc-500">Last: {lastUpdated}</span>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <Card variant="base" className="lg:col-span-2 p-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            Sector Acceleration Scan
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="ticker" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={(val) => (val * 100).toFixed(0) + '%'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }}
                />
                <Bar dataKey="spread" radius={[6, 6, 0, 0]}>
                  {sectors.map((entry) => {
                    const isSelected = selectedSector?.ticker === entry.ticker
                    let fill = '#34d399' // Default emerald-400
                    if (isSelected) {
                      fill = '#10b981' // Emerald-500 for selected
                    } else if (entry.spread <= 0) {
                      fill = '#52525B' // Zinc-600 for negative
                    }
                    return (
                      <Cell
                        key={`cell-${entry.ticker}`}
                        fill={fill}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedSector(entry)}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Selected Sector Details */}
        <Card className="bg-gradient-emerald border-emerald-500/20 p-8">
          <p className="text-sm font-mono text-emerald-500/70 uppercase tracking-widest mb-3">
            {getOrdinal(getLeaderboardPosition(selectedSector?.ticker || ''))} on Leaderboard
          </p>
          <h3 className="text-5xl font-bold text-white mb-2">{selectedSector?.ticker}</h3>
          <p className="text-zinc-400 text-lg mb-8">{selectedSector?.name}</p>

          <div className="space-y-5">
            <ProgressMetric
              value={(selectedSector?.perf_3m || 0) * 100}
              label="3M Performance"
              progress={Math.min(100, Math.max(0, (selectedSector?.perf_3m || 0) * 1000))}
              progressColor="emerald"
              suffix="%"
            />
            <ProgressMetric
              value={(selectedSector?.perf_6m || 0) * 100}
              label="6M Performance"
              progress={Math.min(100, Math.max(0, (selectedSector?.perf_6m || 0) * 500))}
              progressColor="zinc"
              suffix="%"
            />
            <div className="pt-5 border-t border-zinc-800">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-zinc-200 font-semibold">Acceleration Spread</span>
                <span className="text-2xl font-mono text-emerald-500">+{formatPercent(selectedSector?.spread || 0)}</span>
              </div>
            </div>
          </div>

          <div className="mt-10 p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-200/80">Momentum increasing. Sector primed for stock selection.</p>
          </div>
        </Card>
      </div>

      {/* Stock Leaders */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 mb-6">
          Momentum Leaders in {selectedSector?.ticker}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((stock) => {
            const volumeRatio = stock.volume_today / stock.volume_avg_20d
            const isVolumeSpike = volumeRatio > 1.5
            const isPriceBreakout = stock.price > stock.high_10d
            const isSqueezeTriggered = isVolumeSpike && isPriceBreakout && stock.bb_expanding

            return (
              <motion.div
                key={stock.ticker}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-surface border rounded-2xl p-7 overflow-hidden relative ${
                  isSqueezeTriggered
                    ? 'border-emerald-500/50 shadow-glow'
                    : 'border-zinc-800/60'
                }`}
              >
                {isSqueezeTriggered && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-tight">
                    Triggered
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-3xl font-bold text-white leading-none mb-2">{stock.ticker}</h4>
                    <p className="text-zinc-500 text-sm">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono text-white">${stock.price.toFixed(2)}</p>
                    <p className="text-xs text-zinc-500 uppercase mt-1">Current Price</p>
                  </div>
                </div>

                <ProgressMetric
                  value={(stock.perf_3m - stock.sector_perf_3m) * 100}
                  label="3M Outperformance"
                  progress={Math.min(100, Math.max(0, ((stock.perf_3m - stock.sector_perf_3m) * 100 + 50)))}
                  progressColor="emerald"
                  suffix={`% vs ${selectedSector?.ticker}`}
                />

                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 ${
                    isPriceBreakout
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-zinc-800/30 border-zinc-700/30'
                  }`}>
                    <ArrowUpRight className={`w-5 h-5 ${isPriceBreakout ? 'text-emerald-500' : 'text-zinc-600'}`} />
                    <span className={`text-xs uppercase font-bold ${isPriceBreakout ? 'text-emerald-500' : 'text-zinc-600'}`}>Price</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 ${
                    isVolumeSpike
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-zinc-800/30 border-zinc-700/30'
                  }`}>
                    <Activity className={`w-5 h-5 ${isVolumeSpike ? 'text-emerald-500' : 'text-zinc-600'}`} />
                    <span className={`text-xs uppercase font-bold ${isVolumeSpike ? 'text-emerald-500' : 'text-zinc-600'}`}>Volume</span>
                  </div>
                  <div className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 ${
                    stock.bb_expanding
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-zinc-800/30 border-zinc-700/30'
                  }`}>
                    <BarChart3 className={`w-5 h-5 ${stock.bb_expanding ? 'text-emerald-500' : 'text-zinc-600'}`} />
                    <span className={`text-xs uppercase font-bold ${stock.bb_expanding ? 'text-emerald-500' : 'text-zinc-600'}`}>Bands</span>
                  </div>
                </div>

                <button
                  onClick={() => setAnalyzedStock(stock)}
                  className={`w-full mt-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                    isSqueezeTriggered
                      ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  Analyze Setup
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {analyzedStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAnalyzedStock(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-zinc-700 rounded-3xl p-10 max-w-lg w-full"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-bold">{analyzedStock.ticker}</h3>
                  <p className="text-zinc-400 text-base mt-1">{analyzedStock.name}</p>
                </div>
                <button onClick={() => setAnalyzedStock(null)} className="text-zinc-500 hover:text-white text-xl">
                  ✕
                </button>
              </div>

              <Card variant="raised" className="p-6 mb-6">
                <h4 className="text-sm font-mono text-zinc-500 uppercase mb-4">Bollinger Bands (20, 2)</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Upper Band</span>
                    <span className="text-base font-mono text-emerald-400">${analyzedStock.bb_upper.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Middle (SMA20)</span>
                    <span className="text-base font-mono text-white">${analyzedStock.bb_middle.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-zinc-400">Lower Band</span>
                    <span className="text-base font-mono text-red-400">${analyzedStock.bb_lower.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-zinc-700">
                    <span className="text-sm text-zinc-300">Current Price</span>
                    <span className="text-lg font-mono text-white font-bold">${analyzedStock.price.toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className={`p-5 ${analyzedStock.price > (analyzedStock.sma50 || 0) ? 'bg-emerald-500/10 border-emerald-500/30' : ''}`}>
                  <span className="text-xs text-zinc-500 uppercase">Price vs SMA50</span>
                  <p className={`text-base font-mono mt-2 ${analyzedStock.price > (analyzedStock.sma50 || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                    {analyzedStock.price > (analyzedStock.sma50 || 0) ? 'Above' : 'Below'} ${analyzedStock.sma50?.toFixed(2) || 'N/A'}
                  </p>
                </Card>
                <Card className={`p-5 ${analyzedStock.price > (analyzedStock.sma200 || 0) ? 'bg-emerald-500/10 border-emerald-500/30' : ''}`}>
                  <span className="text-xs text-zinc-500 uppercase">Price vs SMA200</span>
                  <p className={`text-base font-mono mt-2 ${analyzedStock.price > (analyzedStock.sma200 || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                    {analyzedStock.price > (analyzedStock.sma200 || 0) ? 'Above' : 'Below'} ${analyzedStock.sma200?.toFixed(2) || 'N/A'}
                  </p>
                </Card>
              </div>

              <Card variant="raised" className="p-5">
                <h4 className="text-sm font-mono text-zinc-500 uppercase mb-3">Setup Strength</h4>
                <div className="flex items-center gap-5">
                  <div className="flex-1 bg-zinc-700 h-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        getStrengthScore(analyzedStock) >= 75
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                          : getStrengthScore(analyzedStock) >= 50
                            ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                            : 'bg-gradient-to-r from-red-600 to-red-400'
                      }`}
                      style={{ width: `${getStrengthScore(analyzedStock)}%` }}
                    />
                  </div>
                  <span className={`text-xl font-mono font-bold ${
                    getStrengthScore(analyzedStock) >= 75
                      ? 'text-emerald-400'
                      : getStrengthScore(analyzedStock) >= 50
                        ? 'text-amber-400'
                        : 'text-red-400'
                  }`}>
                    {getStrengthScore(analyzedStock)}%
                  </span>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}