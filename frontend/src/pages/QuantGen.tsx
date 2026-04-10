import { useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import {
  Terminal,
  BarChart2,
  Home,
  Play,
  Save,
  Code2,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react'
import { Card, DataCard } from '@/components/ui'

export default function QuantGen() {
  return (
    <div className="flex h-full">
      {/* Sub-navigation for QuantGen */}
      <div className="w-56 border-r border-zinc-800/60 bg-surface p-6 shrink-0">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-lg font-semibold text-white">QuantGen</span>
          </div>
          <p className="text-xs text-zinc-500 pl-9">AI Strategy Builder</p>
        </div>

        <nav className="space-y-1">
          <NavLink
            to="/quantgen"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`
            }
          >
            <Home size={18} />
            <span>Home</span>
          </NavLink>
          <NavLink
            to="/quantgen/build"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`
            }
          >
            <Terminal size={18} />
            <span>Builder</span>
          </NavLink>
          <NavLink
            to="/quantgen/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
              }`
            }
          >
            <BarChart2 size={18} />
            <span>Dashboard</span>
          </NavLink>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<QuantGenHome />} />
          <Route path="build" element={<QuantGenBuilder />} />
          <Route path="dashboard" element={<QuantGenDashboard />} />
        </Routes>
      </div>
    </div>
  )
}

function QuantGenHome() {
  return (
    <div className="p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
            <Code2 className="w-4 h-4" />
            AI-Powered Strategy Builder
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Generate Trading Strategies with AI
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Describe your trading idea in plain English. QuantGen transforms it into backtested VectorBT code using real market data from PostgreSQL.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Builder Card */}
          <Card hover className="bg-gradient-purple border-purple-500/20 hover:border-purple-500/40 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 rounded-xl bg-surface-raised border border-zinc-800/50">
                <Terminal className="w-6 h-6 text-purple-400" />
              </div>
              <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">Strategy Builder</h3>
            <p className="text-base text-zinc-400 mb-6 leading-relaxed">
              Generate trading strategies using natural language prompts. AI creates VectorBT code automatically.
            </p>
            <NavLink
              to="/quantgen/build"
              className="inline-flex items-center gap-2 px-5 py-3 bg-purple-500 text-white rounded-xl text-sm font-medium hover:bg-purple-400 transition-colors"
            >
              <Play size={16} />
              Start Building
            </NavLink>
          </Card>

          {/* Dashboard Card */}
          <Card hover className="bg-surface border-zinc-800/60 hover:border-zinc-700 p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 rounded-xl bg-surface-raised border border-zinc-800/50">
                <BarChart2 className="w-6 h-6 text-purple-400" />
              </div>
              <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-white mb-3">Dashboard</h3>
            <p className="text-base text-zinc-400 mb-6 leading-relaxed">
              View backtest results, equity curves, and performance metrics for your saved strategies.
            </p>
            <NavLink
              to="/quantgen/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-800 text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              <BarChart2 size={16} />
              View Results
            </NavLink>
          </Card>
        </div>

        {/* Features */}
        <Card className="p-6">
          <h4 className="text-sm font-medium text-zinc-300 mb-4 uppercase tracking-wider">Features</h4>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Sparkles, text: 'AI-generated trading strategies from natural language' },
              { icon: TrendingUp, text: 'VectorBT backtesting with real market data' },
              { icon: Zap, text: 'Walk-forward optimization for parameter tuning' },
              { icon: Code2, text: 'PostgreSQL database integration (replaces yfinance)' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
                  <feature.icon className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm text-zinc-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function QuantGenBuilder() {
  const [prompt, setPrompt] = useState('')
  const [tickers, setTickers] = useState('AAPL')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          tickers: tickers.split(',').map(t => t.trim()),
          start_date: '2023-01-01',
          end_date: '2024-01-01'
        })
      })
      const data = await res.json()
      if (data.success && data.data?.code) {
        setCode(data.data.code)
      }
    } catch (err) {
      console.error('Generation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Terminal className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Strategy Builder</h2>
          <p className="text-sm text-zinc-500">Describe your strategy and generate VectorBT code</p>
        </div>
      </div>

      {/* Input Section */}
      <Card className="p-6 mb-6">
        <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-3 font-medium">
          Describe your strategy
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Create a momentum strategy that buys when price crosses above SMA 50 and sells when it crosses below..."
          className="w-full h-32 bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-base text-zinc-300 placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 resize-none transition-colors"
        />

        <div className="mt-6 grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-3 font-medium">
              Tickers (comma-separated)
            </label>
            <input
              type="text"
              value={tickers}
              onChange={(e) => setTickers(e.target.value)}
              placeholder="AAPL, MSFT, GOOGL"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-base text-zinc-300 placeholder-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20 transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`w-full py-3 rounded-xl text-base font-medium flex items-center justify-center gap-3 transition-all ${
                loading || !prompt.trim()
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-purple-500 text-white hover:bg-purple-400 shadow-lg shadow-purple-500/20'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Strategy
                </>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Code Editor */}
      <div className="flex-1 bg-surface border border-zinc-800/60 rounded-xl overflow-hidden flex flex-col">
        <div className="bg-zinc-900/80 px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Code2 className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-zinc-300 font-medium">Generated Strategy</span>
          </div>
          {code && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Python</span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">VectorBT</span>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto p-5 bg-zinc-950/30">
          <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
            {code || (
              <span className="text-zinc-600">
{`# Generated strategy code will appear here
#
# Example output:
#
# import vectorbt as vbt
# import pandas as pd
#
# def generate_signals(prices):
#     sma = prices.rolling(50).mean()
#     return (prices > sma).astype(int)
#
# Click "Generate Strategy" to start`}
              </span>
            )}
          </pre>
        </div>
      </div>

      {/* Actions */}
      {code && (
        <div className="flex gap-4 mt-6">
          <button className="flex items-center gap-2 px-5 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-base font-medium hover:bg-emerald-500/25 transition-colors">
            <Play size={18} />
            Run Backtest
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-base font-medium hover:bg-zinc-700 hover:border-zinc-600 transition-colors">
            <Save size={18} />
            Save Strategy
          </button>
        </div>
      )}
    </div>
  )
}

function QuantGenDashboard() {
  // Placeholder for when there are no backtest results
  const hasResults = false

  return (
    <div className="p-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <BarChart2 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Dashboard</h2>
          <p className="text-sm text-zinc-500">View backtest results and performance metrics</p>
        </div>
      </div>

      {hasResults ? (
        <div className="grid grid-cols-3 gap-6">
          {/* Placeholder for actual results */}
          <DataCard accentColor="apple">
            <p className="text-sm text-zinc-400">Total Return</p>
            <p className="text-2xl font-bold text-white">+45.2%</p>
          </DataCard>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
              <BarChart2 className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No backtest results yet</h3>
            <p className="text-sm text-zinc-500 mb-6">
              Generate and run a strategy to see results here
            </p>
            <NavLink
              to="/quantgen/build"
              className="inline-flex items-center gap-2 px-5 py-3 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/25 transition-colors"
            >
              <Terminal size={16} />
              Go to Builder
            </NavLink>
          </div>
        </Card>
      )}
    </div>
  )
}