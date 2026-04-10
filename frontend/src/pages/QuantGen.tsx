import { useState } from 'react'
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  Terminal,
  BarChart2,
  Home,
  Play,
  Save,
  Code2,
  Sparkles,
  TrendingUp,
  Zap,
  GitBranch,
  Settings,
  Target,
  Layers,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Download,
  Share2,
  Trash2,
  Award,
  Percent,
  TrendingDown,
  Activity,
} from 'lucide-react'
import { Card } from '@/components/ui'

// Types
interface Strategy {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  status: 'draft' | 'backtested' | 'optimized' | 'live'
  metrics?: {
    totalReturn: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
  }
}

interface BacktestResult {
  id: string
  strategyId: string
  strategyName: string
  date: string
  metrics: {
    totalReturn: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
    trades: number
  }
  equityCurve: { date: string; value: number }[]
}

// Mock data for demonstration
const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'SMA Crossover Momentum',
    description: 'Buy when price crosses above SMA 50, sell when below',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    status: 'optimized',
    metrics: {
      totalReturn: 45.2,
      sharpeRatio: 1.35,
      maxDrawdown: -12.3,
      winRate: 58.4,
    },
  },
  {
    id: '2',
    name: 'Bollinger Band Squeeze',
    description: 'Enter on volatility contraction breakout',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-22',
    status: 'backtested',
    metrics: {
      totalReturn: 28.7,
      sharpeRatio: 1.12,
      maxDrawdown: -8.5,
      winRate: 52.1,
    },
  },
  {
    id: '3',
    name: 'RSI Mean Reversion',
    description: 'Buy oversold, sell overbought with volume confirmation',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
    status: 'draft',
  },
]

const mockBacktestResults: BacktestResult[] = [
  {
    id: 'bt1',
    strategyId: '1',
    strategyName: 'SMA Crossover Momentum',
    date: '2024-01-20',
    metrics: {
      totalReturn: 45.2,
      sharpeRatio: 1.35,
      maxDrawdown: -12.3,
      winRate: 58.4,
      trades: 127,
    },
    equityCurve: Array.from({ length: 100 }, (_, i) => ({
      date: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 10000 + Math.sin(i * 0.1) * 2000 + i * 150 + Math.random() * 500,
    })),
  },
]

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
}

export default function QuantGen() {
  const location = useLocation()
  const isHome = location.pathname === '/quantgen'

  return (
    <div className="flex h-full bg-canvas">
      {/* Sub-navigation for QuantGen */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 border-r border-zinc-800/60 bg-surface/50 backdrop-blur-sm p-6 shrink-0"
      >
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-lg font-semibold text-white">QuantGen</span>
              <p className="text-xs text-zinc-500">AI Strategy Builder</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1.5">
          <NavItem to="/quantgen" end icon={Home} label="Home" />
          <NavItem to="/quantgen/build" icon={Terminal} label="Builder" />
          <NavItem to="/quantgen/dashboard" icon={BarChart2} label="Dashboard" />
          <NavItem to="/quantgen/library" icon={Layers} label="Library" />
        </nav>

        {isHome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Quick Tip</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Use natural language to describe your strategy. AI will generate VectorBT code automatically.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<QuantGenHome />} />
          <Route path="build" element={<QuantGenBuilder />} />
          <Route path="dashboard" element={<QuantGenDashboard />} />
          <Route path="library" element={<QuantGenLibrary />} />
        </Routes>
      </div>
    </div>
  )
}

function NavItem({ to, end, icon: Icon, label }: { to: string; end?: boolean; icon: any; label: string }) {
  const location = useLocation()
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to)

  return (
    <NavLink
      to={to}
      end={end}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
          : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"
        />
      )}
    </NavLink>
  )
}

// ==================== HOME PAGE ====================
function QuantGenHome() {
  return (
    <div className="relative min-h-full">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.03), transparent, transparent)',
          }}
        />
        <div
          className="absolute top-20 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-20"
          style={{ background: 'rgba(16, 185, 129, 0.15)' }}
        />
        <div
          className="absolute top-40 right-1/4 w-48 h-48 rounded-full blur-[100px] opacity-15"
          style={{ background: 'rgba(16, 185, 129, 0.1)' }}
        />
      </div>

      <div className="relative z-10" style={{ paddingTop: '96px', paddingBottom: '96px', paddingLeft: '80px', paddingRight: '80px' }}>
        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div variants={fadeInUp} className="text-center" style={{ marginBottom: '120px' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
              style={{ marginBottom: '40px' }}
            >
              <Code2 className="w-4 h-4" />
              AI-Powered Strategy Builder
            </motion.div>

            <h1 className="text-5xl font-bold text-white tracking-tight" style={{ marginBottom: '40px' }}>
              Generate Trading Strategies
              <br />
              <span className="text-emerald-400">with Natural Language</span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed" style={{ marginBottom: '60px' }}>
              Describe your trading idea in plain English. QuantGen transforms it into backtested VectorBT code using
              real market data from PostgreSQL.
            </p>

            {/* Main Actions */}
            <motion.div variants={fadeInUp} className="grid md:grid-cols-2" style={{ gap: '80px', marginTop: '60px' }}>
            {/* Builder Card */}
            <Card
              hover
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20 p-10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors" />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-surface-raised border border-zinc-800/50">
                    <Terminal className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:bg-emerald-500/20 transition-colors">
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-white" style={{ marginBottom: '24px' }}>Strategy Builder</h3>
                <p className="text-base text-zinc-400 leading-relaxed" style={{ marginBottom: '48px' }}>
                  Generate trading strategies using natural language prompts. AI creates VectorBT code automatically with
                  full backtesting support.
                </p>

                <NavLink
                  to="/quantgen/build"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Play size={18} />
                  Start Building
                </NavLink>
              </div>
            </Card>

            {/* Dashboard Card */}
            <Card hover className="group relative overflow-hidden bg-surface border-zinc-800/60 p-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-500/5 rounded-full blur-3xl group-hover:bg-zinc-500/10 transition-colors" />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-4 rounded-2xl bg-surface-raised border border-zinc-800/50">
                    <BarChart2 className="w-7 h-7 text-zinc-400" />
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-800/50 group-hover:bg-zinc-700/50 transition-colors">
                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-white" style={{ marginBottom: '24px' }}>Dashboard</h3>
                <p className="text-base text-zinc-400 leading-relaxed" style={{ marginBottom: '48px' }}>
                  View backtest results, equity curves, and performance metrics for your saved strategies.
                </p>

                <NavLink
                  to="/quantgen/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-colors"
                >
                  <BarChart2 size={18} />
                  View Results
                </NavLink>
              </div>
            </Card>
          </motion.div>

          </motion.div>

          {/* Features Grid */}
          <motion.div variants={fadeInUp} style={{ marginTop: '120px' }}>
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest text-center" style={{ marginBottom: '60px' }}>
              Platform Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4" style={{ gap: '60px' }}>
              {[
                { icon: Sparkles, title: 'AI Generation', desc: 'Natural language to code' },
                { icon: TrendingUp, title: 'VectorBT', desc: 'Professional backtesting' },
                { icon: Target, title: 'Optimization', desc: 'Walk-forward parameter tuning' },
                { icon: Layers, title: 'PostgreSQL', desc: 'Real market data integration' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="p-6 rounded-2xl bg-surface border border-zinc-800/60 hover:border-zinc-700 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-emerald-500/10 w-fit mb-4">
                    <feature.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-sm text-zinc-500">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div variants={fadeInUp} className="grid grid-cols-4" style={{ gap: '60px', marginTop: '120px' }}>
            {[
              { value: '3', label: 'Strategies', suffix: 'Created' },
              { value: '12', label: 'Backtests', suffix: 'Run' },
              { value: '45%', label: 'Avg Return', suffix: 'YTD' },
              { value: '1.35', label: 'Avg Sharpe', suffix: 'Ratio' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-surface border border-zinc-800/60">
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-zinc-500">
                  {stat.label} <span className="text-zinc-600">{stat.suffix}</span>
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// ==================== BUILDER PAGE ====================
function QuantGenBuilder() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [tickers, setTickers] = useState('AAPL, MSFT, GOOGL')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'prompt' | 'code' | 'settings'>('prompt')
  const [backtestLoading, setBacktestLoading] = useState(false)
  const [, setBacktestResults] = useState<BacktestResult | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const generatedCode = `import vectorbt as vbt
import pandas as pd
import numpy as np
from datetime import datetime

# Strategy: ${prompt.slice(0, 50)}...

def generate_signals(prices, fast=50, slow=200):
    """
    Generate buy/sell signals based on moving average crossover.
    """
    sma_fast = prices.rolling(fast).mean()
    sma_slow = prices.rolling(slow).mean()

    # Generate entries and exits
    entries = sma_fast > sma_slow
    exits = sma_fast < sma_slow

    return entries, exits

# Load data from PostgreSQL
tickers = [${tickers.split(',').map((t) => `'${t.trim()}'`).join(', ')}]
start_date = '2023-01-01'
end_date = '2024-01-01'

# Fetch data using the data service
prices = get_data_from_db(tickers, start_date, end_date)

# Generate signals
entries, exits = generate_signals(prices)

# Run backtest
portfolio = vbt.Portfolio.from_signals(
    prices,
    entries=entries,
    exits=exits,
    init_cash=10000,
    fees=0.001,
    slippage=0.001
)

# Print metrics
print(f"Total Return: {portfolio.total_return():.2%}")
print(f"Sharpe Ratio: {portfolio.sharpe_ratio():.2f}")
print(f"Max Drawdown: {portfolio.max_drawdown():.2%}")

# Plot results
portfolio.plot().show()`

    setCode(generatedCode)
    setActiveTab('code')
    setLoading(false)
  }

  const handleRunBacktest = async () => {
    if (!code) return
    setBacktestLoading(true)

    // Simulate backtest execution
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Generate mock backtest results
    const results: BacktestResult = {
      id: 'bt' + Date.now(),
      strategyId: 'generated',
      strategyName: prompt.slice(0, 30) + '...',
      date: new Date().toISOString().split('T')[0],
      metrics: {
        totalReturn: 45.2 + Math.random() * 20 - 10,
        sharpeRatio: 1.35 + Math.random() * 0.5 - 0.25,
        maxDrawdown: -12.3 + Math.random() * 5 - 2.5,
        winRate: 58.4 + Math.random() * 10 - 5,
        trades: Math.floor(100 + Math.random() * 50),
      },
      equityCurve: Array.from({ length: 100 }, (_, i) => ({
        date: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 10000 + Math.sin(i * 0.1) * 2000 + i * 150 + Math.random() * 500,
      })),
    }

    setBacktestResults(results)
    setBacktestLoading(false)

    // Navigate to Dashboard after backtest completes
    navigate('/quantgen/dashboard')
  }

  return (
    <div className="h-full overflow-auto">
      {/* Background Effects - Matching Home Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.03), transparent, transparent)',
          }}
        />
        <div
          className="absolute top-20 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-20"
          style={{ background: 'rgba(16, 185, 129, 0.15)' }}
        />
        <div
          className="absolute top-40 right-1/4 w-48 h-48 rounded-full blur-[100px] opacity-15"
          style={{ background: 'rgba(16, 185, 129, 0.1)' }}
        />
      </div>

      <div className="relative z-10" style={{ paddingTop: '96px', paddingBottom: '96px', paddingLeft: '80px', paddingRight: '80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header Section */}
          <div style={{ marginBottom: '80px' }} className="text-center">
            <div className="flex justify-center" style={{ marginBottom: '40px' }}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
              >
                <Terminal className="w-4 h-4" />
                AI Strategy Builder
              </motion.div>
            </div>

            <h1 className="text-4xl font-bold text-white tracking-tight" style={{ marginBottom: '32px' }}>
              Strategy Builder
            </h1>
            <p className="text-lg text-zinc-400 mx-auto leading-relaxed" style={{ marginBottom: '48px', textAlign: 'justify', textAlignLast: 'center', maxWidth: '900px' }}>
              Generate and edit VectorBT strategies using natural language. AI transforms your ideas into backtested code.
            </p>

            {/* Action Buttons - Centered below text */}
            <div className="flex items-center justify-center gap-4">
              {code && (
                <>
                  <button
                    onClick={handleRunBacktest}
                    disabled={backtestLoading}
                    className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    {backtestLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        Run Backtest
                      </>
                    )}
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-colors">
                    <Save size={18} />
                    Save Strategy
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-5" style={{ gap: '48px' }}>
            {/* Left Panel - Configuration */}
            <Card className="lg:col-span-2 p-10 flex flex-col" style={{ minHeight: '700px' }}>
          {/* Tabs */}
          <div className="flex border-b border-zinc-800/60" style={{ marginBottom: '32px' }}>
            {[
              { id: 'prompt', icon: Sparkles, label: 'Prompt' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'prompt' | 'settings')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-emerald-400 border-b-2 border-emerald-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto" style={{ paddingLeft: '8px', paddingRight: '8px' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'prompt' && (
                <motion.div
                  key="prompt"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
                >
                  <div>
                    <label className="block text-sm font-medium text-zinc-400" style={{ marginBottom: '12px' }}>
                      Describe your strategy
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., Create a momentum strategy that buys when price crosses above SMA 50 and sells when it crosses below..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 resize-none transition-colors"
                      style={{ height: '160px' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400" style={{ marginBottom: '12px' }}>
                      Tickers (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={tickers}
                      onChange={(e) => setTickers(e.target.value)}
                      placeholder="AAPL, MSFT, GOOGL"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    style={{ marginTop: '8px', paddingTop: '14px', paddingBottom: '14px', opacity: loading || !prompt.trim() ? 0.5 : 1 }}
                    className="w-full rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Generate Strategy
                      </>
                    )}
                  </button>

                  {/* Quick Prompts */}
                  <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(63, 63, 70, 0.6)' }}>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider" style={{ marginBottom: '16px' }}>Quick Prompts</p>
                    <div className="space-y-3">
                      {[
                        { label: 'SMA crossover momentum strategy', icon: TrendingUp },
                        { label: 'Bollinger Band squeeze breakout', icon: Activity },
                        { label: 'RSI mean reversion with volume', icon: Percent },
                      ].map((suggestion) => (
                        <button
                          key={suggestion.label}
                          onClick={() => setPrompt(suggestion.label)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-sm text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-300 hover:border-zinc-700 transition-all text-left"
                        >
                          <suggestion.icon className="w-4 h-4 text-emerald-500/70" />
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Model</label>
                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none">
                      <option>Claude 3.5 Sonnet</option>
                      <option>GPT-4 Turbo</option>
                      <option>Llama 3 70B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Date Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        defaultValue="2023-01-01"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                      />
                      <input
                        type="date"
                        defaultValue="2024-01-01"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Initial Cash</label>
                    <input
                      type="number"
                      defaultValue={10000}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-3">Fees (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      defaultValue={0.001}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Right Panel - Code Editor */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden p-0" style={{ minHeight: '700px' }}>
          {/* Editor Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-800/60 bg-surface/50">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <Code2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm text-zinc-300 font-medium">Generated Strategy</span>
              {code && (
                <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Python
                </span>
              )}
            </div>
            {code && (
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors text-sm">
                  <Download size={16} />
                  Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors text-sm">
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            )}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden bg-zinc-950/50">
            {code ? (
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                  fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-surface border border-zinc-800/60 flex items-center justify-center mx-auto" style={{ marginBottom: '24px' }}>
                    <Code2 className="w-10 h-10 text-emerald-500/30" />
                  </div>
                  <p className="text-zinc-400 text-base font-medium" style={{ marginBottom: '8px' }}>No code generated yet</p>
                  <p className="text-zinc-500 text-sm">Describe your strategy to get started</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  </div>
</div>
  )
}

// ==================== DASHBOARD PAGE ====================
function QuantGenDashboard() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
  const hasResults = mockBacktestResults.length > 0

  return (
    <div className="p-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <BarChart2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Dashboard</h2>
              <p className="text-sm text-zinc-500">View backtest results and performance metrics</p>
            </div>
          </div>

          <NavLink
            to="/quantgen/build"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-400 transition-colors"
          >
            <PlusIcon size={16} />
            New Strategy
          </NavLink>
        </div>

        {!hasResults ? (
          // Empty State
          <Card className="p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <BarChart2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No backtest results yet</h3>
              <p className="text-sm text-zinc-500 mb-12">Generate and run a strategy to see performance metrics and equity curves</p>
              <NavLink
                to="/quantgen/build"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <Terminal size={16} />
                Go to Builder
              </NavLink>
            </div>
          </Card>
        ) : (
          // Results View
          <div className="space-y-16 pt-8">
            {/* Strategy Selector */}
            <div className="flex items-center gap-12 overflow-x-auto pb-2">
              {mockStrategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-xl border whitespace-nowrap transition-all ${
                    selectedStrategy === strategy.id
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : 'bg-surface border-zinc-800/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <GitBranch size={16} />
                  <span className="font-medium">{strategy.name}</span>
                  {strategy.status === 'optimized' && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      Optimized
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-4 gap-12">
              <MetricCard
                title="Total Return"
                value="+45.2%"
                icon={TrendingUp}
                color="emerald"
                trend="+12.3% vs last month"
              />
              <MetricCard
                title="Sharpe Ratio"
                value="1.35"
                icon={Award}
                color="emerald"
                trend="Above average"
              />
              <MetricCard
                title="Max Drawdown"
                value="-12.3%"
                icon={TrendingDown}
                color="red"
                trend="Within acceptable range"
              />
              <MetricCard
                title="Win Rate"
                value="58.4%"
                icon={Percent}
                color="blue"
                trend="127 trades executed"
              />
            </div>

            {/* Equity Curve Chart */}
            <div className="grid lg:grid-cols-3 gap-12">
              <Card className="lg:col-span-2 p-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Equity Curve</h3>
                    <p className="text-sm text-zinc-500">Portfolio value over time</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors">
                      <Download size={16} />
                    </button>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="h-64 flex items-end justify-between gap-2">
                  {mockBacktestResults[0]?.equityCurve.slice(-30).map((point, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-emerald-500/20 rounded-t-sm hover:bg-emerald-500/40 transition-colors relative group"
                      style={{ height: `${((point.value - 10000) / 5000) * 60 + 20}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${point.value.toFixed(0)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-zinc-500">
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { action: 'Backtest completed', strategy: 'SMA Crossover', time: '2 hours ago', icon: CheckCircle2 },
                    { action: 'Strategy optimized', strategy: 'Bollinger Squeeze', time: '5 hours ago', icon: Activity },
                    { action: 'Strategy created', strategy: 'RSI Mean Reversion', time: '1 day ago', icon: GitBranch },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <item.icon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{item.action}</p>
                        <p className="text-xs text-zinc-500 truncate">{item.strategy}</p>
                      </div>
                      <span className="text-xs text-zinc-600">{item.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Trades Table */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
                <button className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500 uppercase tracking-wider">
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium">Ticker</th>
                      <th className="pb-4 font-medium">Action</th>
                      <th className="pb-4 font-medium">Price</th>
                      <th className="pb-4 font-medium">PnL</th>
                      <th className="pb-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { date: '2024-01-15', ticker: 'AAPL', action: 'BUY', price: 185.5, pnl: null, status: 'Open' },
                      { date: '2024-01-14', ticker: 'MSFT', action: 'SELL', price: 415.2, pnl: 2.3, status: 'Closed' },
                      { date: '2024-01-13', ticker: 'GOOGL', action: 'BUY', price: 141.8, pnl: null, status: 'Open' },
                      { date: '2024-01-12', ticker: 'NVDA', action: 'SELL', price: 548.5, pnl: -1.2, status: 'Closed' },
                    ].map((trade, i) => (
                      <tr key={i} className="border-t border-zinc-800/60">
                        <td className="py-4 text-zinc-400">{trade.date}</td>
                        <td className="py-4 text-white font-medium">{trade.ticker}</td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trade.action === 'BUY'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {trade.action}
                          </span>
                        </td>
                        <td className="py-4 text-zinc-300">${trade.price.toFixed(2)}</td>
                        <td className="py-4">
                          {trade.pnl !== null ? (
                            <span className={trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                              {trade.pnl >= 0 ? '+' : ''}
                              {trade.pnl.toFixed(2)}%
                            </span>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className="text-xs text-zinc-500">{trade.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ==================== LIBRARY PAGE ====================
function QuantGenLibrary() {
  return (
    <div className="p-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Strategy Library</h2>
              <p className="text-sm text-zinc-500">Manage your saved strategies</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search strategies..."
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-300 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none w-64"
            />
          </div>
        </div>

        {/* Strategy Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {mockStrategies.map((strategy) => (
            <Card key={strategy.id} hover className="p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Code2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Download size={14} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{strategy.name}</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{strategy.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    strategy.status === 'optimized'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : strategy.status === 'backtested'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {strategy.status.charAt(0).toUpperCase() + strategy.status.slice(1)}
                </span>
              </div>

              {strategy.metrics && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/60">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Return</p>
                    <p className="text-sm font-medium text-emerald-400">+{strategy.metrics.totalReturn}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Sharpe</p>
                    <p className="text-sm font-medium text-white">{strategy.metrics.sharpeRatio}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800/60">
                <span className="text-xs text-zinc-600">
                  Updated {new Date(strategy.updatedAt).toLocaleDateString()}
                </span>
                <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View Details</button>
              </div>
            </Card>
          ))}

          {/* Add New Card */}
          <NavLink to="/quantgen/build">
            <Card className="p-6 h-full border-dashed border-zinc-700 hover:border-emerald-500/30 bg-transparent hover:bg-emerald-500/5 transition-all flex flex-col items-center justify-center text-center min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <PlusIcon className="w-6 h-6 text-zinc-500" />
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">Create New Strategy</h3>
              <p className="text-sm text-zinc-600">Start building with AI assistance</p>
            </Card>
          </NavLink>
        </div>
      </motion.div>
    </div>
  )
}

// ==================== HELPER COMPONENTS ====================

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string
  value: string
  icon: any
  color: string
  trend: string
}) {
  const colorClasses: Record<string, { bg: string; text: string }> = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  }

  const colors = colorClasses[color] || colorClasses.emerald

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>
      <p className="text-sm text-zinc-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white mb-2">{value}</p>
      <p className="text-xs text-zinc-600">{trend}</p>
    </Card>
  )
}

function PlusIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}
