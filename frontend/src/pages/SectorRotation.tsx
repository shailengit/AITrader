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
import { useTheme } from '../context/ThemeContext'
import { X } from 'lucide-react'

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
  const { isDarkMode } = useTheme()

  // Theme-aware colors
  const colors = {
    text: isDarkMode ? '#FAFAFA' : '#1d1d1f',
    muted: isDarkMode ? '#A1A1AA' : '#6e6e73',
    subtle: isDarkMode ? '#52525B' : '#86868b',
    surface: isDarkMode ? '#27272A' : '#f5f5f7',
    border: isDarkMode ? '#27272A' : '#d2d2d7',
    grid: isDarkMode ? '#27272A' : '#e5e5e7',
    tooltip: {
      bg: isDarkMode ? '#18181B' : '#ffffff',
      border: isDarkMode ? '#27272A' : '#d2d2d7',
    },
    negative: isDarkMode ? '#52525B' : '#9ca3af',
  }

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
          <p className="font-mono text-lg tracking-widest uppercase" style={{ color: colors.muted }}>Scanning Market Sectors...</p>
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
            <h1 className="text-2xl font-semibold" style={{ color: colors.text }}>Sector Rotation Scanner</h1>
            <p className="text-base" style={{ color: colors.muted }}>Identify momentum and rotation patterns</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm font-mono" style={{ color: colors.muted }}>
          <StatusBadge
            status={isDbConnected ? 'connected' : 'disconnected'}
            label={isDbConnected ? 'S&P 1500 Connected' : 'Demo Mode'}
          />
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-xl transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.surface}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Activity className={`w-5 h-5 ${loading ? 'animate-spin' : ''} text-emerald-500`} />
          </button>
          <span style={{ color: colors.muted }}>Last: {lastUpdated}</span>
        </div>
      </div>

      {/* Sector Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <Card variant="base" className="lg:col-span-2 p-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: colors.muted }}>
            Sector Acceleration Scan
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectors}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                <XAxis dataKey="ticker" stroke={colors.muted} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={colors.muted} fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={(val) => (val * 100).toFixed(0) + '%'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.tooltip.bg,
                    border: `1px solid ${colors.tooltip.border}`,
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
                      fill = colors.negative // Theme-aware for negative
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
        <Card
          className="p-8"
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.04) 100%)',
            border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.4)'}`
          }}
        >
          <p
            className="text-sm font-mono uppercase tracking-widest mb-3"
            style={{ color: isDarkMode ? 'rgba(16, 185, 129, 0.7)' : '#059669' }}
          >
            {getOrdinal(getLeaderboardPosition(selectedSector?.ticker || ''))} on Leaderboard
          </p>
          <h3 className="text-5xl font-bold mb-2" style={{ color: colors.text }}>{selectedSector?.ticker}</h3>
          <p className="text-lg mb-8" style={{ color: colors.muted }}>{selectedSector?.name}</p>

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
            <div className="pt-5" style={{ borderTop: `1px solid ${colors.border}` }}>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold" style={{ color: colors.text }}>Acceleration Spread</span>
                <span className="text-2xl font-mono text-emerald-500">+{formatPercent(selectedSector?.spread || 0)}</span>
              </div>
            </div>
          </div>

          <div
            className="mt-10 p-4 rounded-2xl flex items-center gap-4"
            style={{
              backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
              border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`
            }}
          >
            <CheckCircle2 className="w-6 h-6 shrink-0" style={{ color: isDarkMode ? '#10B981' : '#059669' }} />
            <p className="text-sm" style={{ color: isDarkMode ? 'rgba(16, 185, 129, 0.9)' : '#059669' }}>Momentum increasing. Sector primed for stock selection.</p>
          </div>
        </Card>
      </div>

      {/* Stock Leaders */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: colors.muted }}>
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
                className="border rounded-2xl p-7 overflow-hidden relative"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: isSqueezeTriggered ? 'rgba(16, 185, 129, 0.5)' : colors.border,
                  boxShadow: isSqueezeTriggered ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none'
                }}
              >
                {isSqueezeTriggered && (
                  <div
                    className="absolute top-0 right-0 text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-tight"
                    style={{ backgroundColor: '#10B981', color: '#ffffff' }}
                  >
                    Triggered
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-3xl font-bold leading-none mb-2" style={{ color: colors.text }}>{stock.ticker}</h4>
                    <p className="text-sm" style={{ color: colors.muted }}>{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono" style={{ color: colors.text }}>${stock.price.toFixed(2)}</p>
                    <p className="text-xs uppercase mt-1" style={{ color: colors.muted }}>Current Price</p>
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
                  <div
                    className="p-3 rounded-xl border flex flex-col items-center justify-center gap-2"
                    style={{
                      backgroundColor: isPriceBreakout ? 'rgba(16, 185, 129, 0.1)' : isDarkMode ? 'rgba(63, 63, 70, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: isPriceBreakout ? 'rgba(16, 185, 129, 0.4)' : colors.border
                    }}
                  >
                    <ArrowUpRight className={`w-5 h-5 ${isPriceBreakout ? 'text-emerald-500' : isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`} />
                    <span className={`text-xs uppercase font-bold ${isPriceBreakout ? 'text-emerald-500' : isDarkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>Price</span>
                  </div>
                  <div
                    className="p-3 rounded-xl border flex flex-col items-center justify-center gap-2"
                    style={{
                      backgroundColor: isVolumeSpike ? 'rgba(16, 185, 129, 0.1)' : isDarkMode ? 'rgba(63, 63, 70, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: isVolumeSpike ? 'rgba(16, 185, 129, 0.4)' : colors.border
                    }}
                  >
                    <Activity className={`w-5 h-5 ${isVolumeSpike ? 'text-emerald-500' : isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`} />
                    <span className={`text-xs uppercase font-bold ${isVolumeSpike ? 'text-emerald-500' : isDarkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>Volume</span>
                  </div>
                  <div
                    className="p-3 rounded-xl border flex flex-col items-center justify-center gap-2"
                    style={{
                      backgroundColor: stock.bb_expanding ? 'rgba(16, 185, 129, 0.1)' : isDarkMode ? 'rgba(63, 63, 70, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                      borderColor: stock.bb_expanding ? 'rgba(16, 185, 129, 0.4)' : colors.border
                    }}
                  >
                    <BarChart3 className={`w-5 h-5 ${stock.bb_expanding ? 'text-emerald-500' : isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`} />
                    <span className={`text-xs uppercase font-bold ${stock.bb_expanding ? 'text-emerald-500' : isDarkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>Bands</span>
                  </div>
                </div>

                <button
                  onClick={() => setAnalyzedStock(stock)}
                  className="w-full mt-6 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all"
                  style={{
                    backgroundColor: isSqueezeTriggered ? '#10B981' : isDarkMode ? '#27272A' : '#f5f5f7',
                    color: isSqueezeTriggered ? '#000' : isDarkMode ? '#A1A1AA' : '#6e6e73',
                  }}
                  onMouseEnter={(e) => {
                    if (isSqueezeTriggered) {
                      e.currentTarget.style.backgroundColor = '#34D399';
                    } else {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#3F3F46' : '#e5e5e7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSqueezeTriggered ? '#10B981' : isDarkMode ? '#27272A' : '#f5f5f7';
                  }}
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
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            style={{ backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-3xl p-10 max-w-lg w-full"
              style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-3xl font-bold" style={{ color: colors.text }}>{analyzedStock.ticker}</h3>
                  <p className="text-base mt-1" style={{ color: colors.muted }}>{analyzedStock.name}</p>
                </div>
                <button
                  onClick={() => setAnalyzedStock(null)}
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: colors.muted }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.text;
                    e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.muted;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <Card variant="raised" className="p-6 mb-6" style={{ backgroundColor: isDarkMode ? '#2a2a2d' : '#ffffff' }}>
                <h4 className="text-sm font-mono uppercase mb-4" style={{ color: colors.muted }}>Bollinger Bands (20, 2)</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: colors.muted }}>Upper Band</span>
                    <span className="text-base font-mono text-emerald-400">${analyzedStock.bb_upper.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: colors.muted }}>Middle (SMA20)</span>
                    <span className="text-base font-mono" style={{ color: colors.text }}>${analyzedStock.bb_middle.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: colors.muted }}>Lower Band</span>
                    <span className="text-base font-mono text-red-400">${analyzedStock.bb_lower.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                    <span className="text-sm" style={{ color: colors.muted }}>Current Price</span>
                    <span className="text-lg font-mono font-bold" style={{ color: colors.text }}>${analyzedStock.price.toFixed(2)}</span>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card
                  className="p-5"
                  style={{
                    backgroundColor: analyzedStock.price > (analyzedStock.sma50 || 0) ? 'rgba(16, 185, 129, 0.1)' : colors.surface,
                    borderColor: analyzedStock.price > (analyzedStock.sma50 || 0) ? 'rgba(16, 185, 129, 0.3)' : colors.border
                  }}
                >
                  <span className="text-xs uppercase" style={{ color: colors.muted }}>Price vs SMA50</span>
                  <p className={`text-base font-mono mt-2 ${analyzedStock.price > (analyzedStock.sma50 || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                    {analyzedStock.price > (analyzedStock.sma50 || 0) ? 'Above' : 'Below'} ${analyzedStock.sma50?.toFixed(2) || 'N/A'}
                  </p>
                </Card>
                <Card
                  className="p-5"
                  style={{
                    backgroundColor: analyzedStock.price > (analyzedStock.sma200 || 0) ? 'rgba(16, 185, 129, 0.1)' : colors.surface,
                    borderColor: analyzedStock.price > (analyzedStock.sma200 || 0) ? 'rgba(16, 185, 129, 0.3)' : colors.border
                  }}
                >
                  <span className="text-xs uppercase" style={{ color: colors.muted }}>Price vs SMA200</span>
                  <p className={`text-base font-mono mt-2 ${analyzedStock.price > (analyzedStock.sma200 || 0) ? 'text-emerald-400' : 'text-red-400'}`}>
                    {analyzedStock.price > (analyzedStock.sma200 || 0) ? 'Above' : 'Below'} ${analyzedStock.sma200?.toFixed(2) || 'N/A'}
                  </p>
                </Card>
              </div>

              <Card variant="raised" className="p-5" style={{ backgroundColor: isDarkMode ? '#2a2a2d' : '#ffffff' }}>
                <h4 className="text-sm font-mono uppercase mb-3" style={{ color: colors.muted }}>Setup Strength</h4>
                <div className="flex items-center gap-5">
                  <div
                    className="flex-1 h-4 rounded-full overflow-hidden"
                    style={{ backgroundColor: isDarkMode ? '#3f3f46' : '#e5e5e7' }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${getStrengthScore(analyzedStock)}%`,
                        background: getStrengthScore(analyzedStock) >= 75
                          ? 'linear-gradient(to right, #059669, #34d399)'
                          : getStrengthScore(analyzedStock) >= 50
                            ? 'linear-gradient(to right, #d97706, #fbbf24)'
                            : 'linear-gradient(to right, #dc2626, #f87171)'
                      }}
                    />
                  </div>
                  <span
                    className="text-xl font-mono font-bold"
                    style={{
                      color: getStrengthScore(analyzedStock) >= 75
                        ? '#34d399'
                        : getStrengthScore(analyzedStock) >= 50
                          ? '#fbbf24'
                          : '#f87171'
                    }}
                  >
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