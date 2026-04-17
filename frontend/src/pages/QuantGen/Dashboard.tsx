import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, ArrowLeft, Trash2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { CandleStickChart } from '@/components/quantgen/CandleStickChart';
import { IndicatorPanel } from '@/components/quantgen/IndicatorPanel';
import OptimizationResults from '@/components/quantgen/OptimizationResults';
import { Card } from '@/components/ui';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}

const MetricCard = ({ label, value, sub, positive }: MetricCardProps) => {
  const { isDarkMode } = useTheme();
  const colors = {
    text: isDarkMode ? '#FAFAFA' : '#1d1d1f',
    muted: isDarkMode ? '#A1A1AA' : '#6e6e73',
    surface: isDarkMode ? '#27272A' : '#ffffff',
    border: isDarkMode ? '#3F3F46' : '#d2d2d7',
    positive: isDarkMode ? '#34d399' : '#059669',
    negative: isDarkMode ? '#f43f5e' : '#dc2626',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-6 shadow-sm flex flex-col justify-between"
      style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
    >
      <div className="text-sm uppercase tracking-wider font-semibold" style={{ color: colors.muted }}>{label}</div>
      <div className="text-3xl font-bold mt-2 tracking-tight" style={{ color: colors.text }}>{value}</div>
      {sub && (
        <div
          className="text-xs mt-2 font-medium flex items-center gap-1"
          style={{ color: positive ? colors.positive : colors.negative }}
        >
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {sub}
        </div>
      )}
    </motion.div>
  );
};

interface Trade {
  time: number;
  price: number;
  type: 'buy' | 'sell';
  size?: number;
  pnl?: number;
}

interface OHLCV {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface EquityPoint {
  time: number;
  value: number;
}

interface ChartIndicator {
  name: string;
  type: string;
  data: { time: number; value: number }[];
  color?: string;
}

interface PanelIndicator {
  name: string;
  type: string;
  params: Record<string, string | number>;
}

interface HeatmapRow {
  metric: number;
  [key: string]: number | string;
}

interface WFOWindow {
  window: number;
  train_start: string;
  train_end: string;
  best_param: string;
  train_metric: number;
  test_metric: number;
}

interface OptimizationData {
  mode: 'simple' | 'wfo' | 'true_wfo';
  heatmap?: HeatmapRow[];
  windows?: WFOWindow[];
  oos_equity?: EquityPoint[];
  max_windows?: number;
  stats?: Record<string, number | string>;
  trades?: Trade[];
}

interface DashboardData {
  stats: Record<string, number | string>;
  equity: EquityPoint[];
  ohlcv: OHLCV[];
  optimization: OptimizationData | null;
  output: string;
  drawdownData: Array<{
    time: string;
    drawdown: number;
    bench_drawdown: number;
  }>;
  trades: Trade[];
  indicators: PanelIndicator[];
}

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const colors = {
    text: isDarkMode ? '#FAFAFA' : '#1d1d1f',
    muted: isDarkMode ? '#A1A1AA' : '#6e6e73',
    surface: isDarkMode ? '#27272A' : '#ffffff',
    surfaceAlt: isDarkMode ? '#1A1A1D' : '#f5f5f7',
    border: isDarkMode ? '#3F3F46' : '#d2d2d7',
  };

  // Lazy load initial state from localStorage
  const [data] = useState<DashboardData>(() => {
    try {
      const storedRunData = localStorage.getItem('lastRunData');
      if (storedRunData) {
        const parsed = JSON.parse(storedRunData);
        let drawdownData: DashboardData['drawdownData'] = [];
        if (parsed.drawdown) {
          const dd = parsed.drawdown;
          const bdd = parsed.benchmark_drawdown || {};
          const allDates = new Set([...Object.keys(dd), ...Object.keys(bdd)]);
          const sortedDates = Array.from(allDates).sort((a, b) => parseFloat(a) - parseFloat(b));
          drawdownData = sortedDates.map((dateStr) => {
            // Convert Unix timestamp to Date object for proper formatting
            const ts = parseFloat(dateStr);
            const date = new Date(ts * 1000);
            return {
              time: ts,  // Keep as Unix timestamp for chart
              dateStr: date.toISOString().split('T')[0],  // Human-readable date string
              drawdown: dd[dateStr] ? parseFloat(dd[dateStr]) : 0,
              bench_drawdown: bdd[dateStr] ? parseFloat(bdd[dateStr]) : 0,
            };
          });
        }
        return {
          stats: parsed.stats || {},
          equity: parsed.equity || [],
          ohlcv: parsed.ohlcv || [],
          optimization: parsed.optimization || null,
          output: parsed.output || '',
          drawdownData,
          trades: parsed.trades || [],
          indicators: parsed.indicators || [],
        };
      }

      // Legacy Fallback
      const storedStats = localStorage.getItem('lastRunStats');
      if (storedStats) {
        const eq = localStorage.getItem('lastRunEquity');
        return {
          stats: JSON.parse(storedStats),
          equity: eq ? JSON.parse(eq) : [],
          ohlcv: [],
          optimization: null,
          output: '',
          drawdownData: [],
          trades: [],
          indicators: [],
        };
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
    // Default empty state
    return {
      stats: {},
      equity: [],
      ohlcv: [],
      optimization: null,
      output: '',
      drawdownData: [],
      trades: [],
      indicators: [],
    };
  });

  const { stats, equity, ohlcv, drawdownData, optimization, output, trades, indicators } = data;

  // State for selected indicators
  const [selIndicators, setSelIndicators] = useState<Record<string, boolean>>({});

  // Initialize selected indicators when indicators change
  useState(() => {
    if (indicators && indicators.length > 0) {
      const initial: Record<string, boolean> = {};
      indicators.forEach((ind) => {
        initial[ind.name] = true;
      });
      setSelIndicators(initial);
    }
  });

  // Handler for toggling indicators
  const handleIndicatorToggle = (indicatorName: string) => {
    setSelIndicators((prev) => ({
      ...prev,
      [indicatorName]: !prev[indicatorName],
    }));
  };

  // When optimization data exists, use trades from the best run
  let bestTrades = trades;
  if (optimization && typeof optimization === 'object') {
    if (optimization.trades && Array.isArray(optimization.trades) && optimization.trades.length > 0) {
      bestTrades = optimization.trades;
    }
  }

  // When optimization data exists, use the best run's stats
  let bestStats = stats;
  if (optimization && typeof optimization === 'object') {
    if (optimization.stats && Object.keys(optimization.stats).length > 0) {
      bestStats = optimization.stats;
    }
  }

  // Calculate benchmark (buy and hold) equity curve from OHLCV data
  const equityWithBenchmark = useMemo(() => {
    if (!ohlcv || ohlcv.length === 0 || !equity || equity.length === 0) {
      return equity;
    }

    try {
      const startValue = equity[0]?.value || 10000;
      const closePrices = ohlcv.map((d) => d.close);
      const benchmark = [1];

      for (let i = 1; i < closePrices.length; i++) {
        const dailyReturn = (closePrices[i] - closePrices[i - 1]) / closePrices[i - 1];
        benchmark.push(benchmark[i - 1] * (1 + dailyReturn));
      }

      return equity.map((item, index) => ({
        ...item,
        benchmark: benchmark[index] ? benchmark[index] * startValue : benchmark[benchmark.length - 1] * startValue,
      }));
    } catch (e) {
      console.error('Failed to calculate benchmark:', e);
      return equity;
    }
  }, [ohlcv, equity]);

  // Helper to extract value with fallback keys
  const getVal = (keys: string[]) => {
    if (!bestStats) return undefined;
    for (const k of keys) {
      if (bestStats[k] !== undefined) return bestStats[k];
    }
    return undefined;
  };

  const fmtPct = (val: number | string | undefined) => {
    if (val === undefined || val === null) return 'N/A';
    if (typeof val === 'string' && val.includes('%')) return val;

    const v = parseFloat(val as string);
    if (isNaN(v)) return String(val);
    return `${v.toFixed(2)}%`;
  };

  const fmtNum = (val: number | string | undefined) =>
    val !== undefined && val !== null ? parseFloat(val as string).toFixed(2) : 'N/A';

  const totalReturn = getVal(['Total Return [%]', 'Total Return']);
  const benchmarkReturn = getVal(['Benchmark Return [%]', 'Benchmark Return', 'Benchmark Total Return [%]', 'Benchmark Total Return']);
  const maxDD = getVal(['Max Drawdown [%]', 'Max Drawdown']);
  const maxDDBench = getVal(['Benchmark Max Drawdown [%]', 'Benchmark Max Drawdown', 'Benchmark Max Drawdown [%] ']);
  const sharpe = getVal(['Sharpe Ratio', 'Sharpe']);
  const sharpeBench = getVal(['Benchmark Sharpe Ratio', 'Benchmark Sharpe', 'Benchmark Sharpe Ratio ']);
  const winRate = getVal(['Win Rate [%]', 'Win Rate']);
  const totalTrades = getVal(['Total Trades']);
  const startDt = getVal(['Start', 'Start Date']);
  const endDt = getVal(['End', 'End Date']);

  // Comparisons
  const benchVal = parseFloat((benchmarkReturn as string) || '0');
  const stratVal = parseFloat((totalReturn as string) || '0');
  const beatingBench = stratVal > benchVal;

  const stratSharpe = parseFloat((sharpe as string) || '0');
  const benchSharpeVal = parseFloat((sharpeBench as string) || '0');
  const beatingSharpe = stratSharpe > benchSharpeVal;

  const estratDD = parseFloat((maxDD as string) || '0');
  const ebenchDD = parseFloat((maxDDBench as string) || '0');
  const betterDD = estratDD < ebenchDD;

  // True WFO may not have equity array populated, but has optimization.oos_equity or optimization.windows
  const hasOptimizationData = optimization && (
    (optimization.oos_equity && optimization.oos_equity.length > 0) ||
    (optimization.windows && optimization.windows.length > 0)
  );
  const hasData = equity && equity.length > 0 || hasOptimizationData;

  const clearResults = () => {
    localStorage.removeItem('lastRunData');
    localStorage.removeItem('lastRunStats');
    localStorage.removeItem('lastRunEquity');
    window.location.reload();
  };

  if (!hasData) {
    return (
      <div className="relative min-h-full flex items-center justify-center" style={{ backgroundColor: colors.surfaceAlt }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>No Results Yet</h2>
          <p className="mb-8" style={{ color: colors.muted }}>Run a backtest or optimization to see results here.</p>
          <NavLink
            to="/quantgen/build"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors text-white"
            style={{ backgroundColor: isDarkMode ? '#10B981' : '#059669' }}
          >
            <ArrowLeft size={18} />
            Go to Builder
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full" style={{ backgroundColor: colors.surfaceAlt }}>
      <div
        className="relative z-10"
        style={{ paddingTop: '24px', paddingBottom: '96px', paddingLeft: '80px', paddingRight: '80px' }}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: colors.text }}>Performance Analysis</h1>
              <p className="mt-1" style={{ color: colors.muted }}>
                Period: {String(startDt || '').split(' ')[0]} - {String(endDt || '').split(' ')[0]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-sm px-3 py-1 rounded-full font-mono"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`,
                  color: isDarkMode ? '#34d399' : '#059669'
                }}
              >
                {optimization
                  ? optimization.mode === 'true_wfo'
                    ? 'True WFO Strategy'
                    : optimization.mode === 'wfo'
                      ? 'WFO Strategy'
                      : 'Optimized Strategy'
                  : 'Backtest Results'}
              </span>
              <button
                onClick={clearResults}
                className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors"
                style={{ color: '#f43f5e' }}
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
          </div>

          {/* Optimization Results (Top Priority if Available) */}
          {optimization && (
            <div className="mb-8">
              <OptimizationResults data={optimization} />
              <div className="my-8" style={{ borderTop: `1px solid ${colors.border}` }} />
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.muted }}>Backtest Details (Best / Last Run)</h2>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: '24px' }}>
            <MetricCard
              label="Total Return"
              value={fmtPct(totalReturn)}
              sub={`vs Bench: ${fmtPct(benchmarkReturn)}`}
              positive={beatingBench}
            />
            <MetricCard
              label="Sharpe Ratio"
              value={fmtNum(sharpe)}
              sub={`vs Bench: ${fmtNum(sharpeBench)}`}
              positive={beatingSharpe}
            />
            <MetricCard
              label="Max Drawdown"
              value={fmtPct(maxDD)}
              sub={`vs Bench: ${fmtPct(maxDDBench)}`}
              positive={betterDD}
            />
            <MetricCard
              label="Win Rate"
              value={fmtPct(winRate)}
              sub={`${totalTrades || 0} Trades`}
              positive={parseFloat((winRate as string) || '0') > 50}
            />
          </div>

          {/* Two Column Layout: Charts on Left, Stats on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '32px' }}>
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 flex flex-col" style={{ gap: '32px' }}>
              {/* Price Action Chart */}
              <Card className="flex flex-col p-6" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: isDarkMode ? '#E4E4E7' : '#1d1d1f' }}>
                  <DollarSign size={16} style={{ color: isDarkMode ? '#34d399' : '#059669' }} /> Price Action & Volume
                </h3>

                {/* Indicator Panel */}
                {indicators && indicators.length > 0 && (
                  <IndicatorPanel
                    indicators={indicators}
                    selectedIndicators={selIndicators}
                    onToggle={handleIndicatorToggle}
                  />
                )}

                <div
                  className="w-full rounded-lg overflow-hidden relative"
                  style={{ backgroundColor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)', height: '400px' }}
                >
                  {ohlcv && ohlcv.length > 0 ? (
                    (() => {
                      // Convert trades to expected format
                      // Handle both 'time' (Unix timestamp) and 'date' (ISO string) formats
                      const chartTrades = bestTrades.map((t) => {
                        // Convert date string to Unix timestamp if needed
                        const timeVal = t.time !== undefined ? t.time : (t.date ? new Date(t.date).getTime() / 1000 : 0);
                        return {
                          time: timeVal,
                          price: t.price,
                          type: t.action === 'BUY' ? 'buy' : (t.action === 'SELL' ? 'sell' : t.type),
                          size: t.size || 0,
                          pnl: t.pnl || 0,
                        };
                      });

                      // Convert indicators to chart format
                      const chartIndicators: ChartIndicator[] = indicators
                        .filter((ind) => selIndicators[ind.name] !== false)
                        .map((ind) => ({
                          name: ind.name,
                          type: ind.type,
                          data: [], // Indicators panel only shows info, data comes from code execution
                          color: `hsl(${(ind.name.length * 137.508) % 360}, 70%, 50%)`,
                        }));

                      return (
                        <CandleStickChart
                          data={ohlcv}
                          trades={chartTrades}
                          indicators={chartIndicators}
                          height={400}
                        />
                      );
                    })()
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ color: colors.muted }}>
                      No OHLCV Data. Please re-run strategy.
                    </div>
                  )}
                </div>
              </Card>

              {/* Equity Curve */}
              <Card className="flex flex-col p-6" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: isDarkMode ? '#E4E4E7' : '#1d1d1f' }}>
                  <Activity size={16} style={{ color: isDarkMode ? '#34d399' : '#059669' }} /> Equity Curve
                </h3>
                <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
                  <ResponsiveContainer width="99%" height="100%" minWidth={100} minHeight={100}>
                    <AreaChart data={equityWithBenchmark} syncId="sharedXAxis">
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorBench" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} opacity={0.3} vertical={false} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: colors.muted }}
                        tickFormatter={(v) => {
                          if (typeof v === 'string') {
                            return v.split(' ')[0];
                          }
                          return new Date(v * 1000).toISOString().split('T')[0];
                        }}
                        minTickGap={50}
                      />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: colors.muted }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderRadius: '8px',
                          border: `1px solid ${colors.border}`
                        }}
                        itemStyle={{ color: colors.text }}
                        labelStyle={{ color: colors.muted }}
                        labelFormatter={(label) => {
                          if (typeof label === 'string') return label.split(' ')[0];
                          return new Date(label * 1000).toISOString().split('T')[0];
                        }}
                        formatter={(value) => [Number(value).toFixed(2), '']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVal)"
                        name="Strategy"
                      />
                      {ohlcv && ohlcv.length > 0 && (
                        <Area
                          type="monotone"
                          dataKey="benchmark"
                          stroke="#22c55e"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorBench)"
                          name="Buy & Hold"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Drawdown Analysis */}
              <Card className="flex flex-col p-6" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3
                  className="font-bold mb-4 flex items-center gap-2"
                  style={{ color: '#f43f5e' }}
                >
                  <TrendingDown size={16} /> Max Drawdown Analysis
                </h3>
                <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
                  <ResponsiveContainer width="99%" height="100%" minWidth={100} minHeight={100}>
                    <AreaChart data={drawdownData} syncId="sharedXAxis">
                      <defs>
                        <linearGradient id="colorDD" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} opacity={0.3} vertical={false} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: colors.muted }}
                        tickFormatter={(v) => {
                          // v is already Unix timestamp in seconds
                          return new Date(v * 1000).toISOString().split('T')[0];
                        }}
                        minTickGap={50}
                      />
                      <YAxis tick={{ fontSize: 10, fill: colors.muted }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderRadius: '8px',
                          border: `1px solid ${colors.border}`
                        }}
                        labelStyle={{ color: colors.muted }}
                        labelFormatter={(label) => {
                          return new Date(label * 1000).toISOString().split('T')[0];
                        }}
                        formatter={(value) => [Number(value).toFixed(2), '']}
                      />
                      <Area
                        type="monotone"
                        dataKey="drawdown"
                        name="Strategy DD%"
                        stroke="#f43f5e"
                        fill="url(#colorDD)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="bench_drawdown"
                        name="Benchmark DD%"
                        stroke="#9ca3af"
                        fill="transparent"
                        strokeDasharray="3 3"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Right Column - Stats */}
            <div className="flex flex-col" style={{ gap: '24px' }}>
              {/* Detailed Stats Table */}
              <Card className="flex flex-col p-6" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 className="font-bold mb-4" style={{ color: isDarkMode ? '#E4E4E7' : '#1d1d1f' }}>Detailed Statistics</h3>
                <div className="space-y-0 text-sm">
                  {Object.entries(stats).map(
                    ([k, v], i) =>
                      k !== 'Total Return' &&
                      k !== 'Sharpe Ratio' && (
                        <div
                          key={k}
                          className="flex justify-between py-2"
                          style={{
                            borderBottom: `1px solid ${colors.border}`,
                            backgroundColor: i % 2 === 0 ? (isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)') : 'transparent'
                          }}
                        >
                          <span style={{ color: colors.muted }}>{k}</span>
                          <span className="font-mono font-medium" style={{ color: colors.text }}>
                            {typeof v === 'number' ? v.toFixed(2) : String(v)}
                          </span>
                        </div>
                      ),
                  )}
                </div>
              </Card>

              {/* Debug / Raw Data */}
              <Card className="p-4" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                <details>
                  <summary
                    className="text-xs font-bold uppercase cursor-pointer"
                    style={{ color: colors.muted }}
                  >
                    Raw Data & Logs
                  </summary>
                  <div className="flex flex-col gap-4 mt-4">
                    <div>
                      <h4 className="text-xs font-bold mb-2" style={{ color: colors.muted }}>Stats JSON</h4>
                      <pre
                        className="p-4 rounded-lg overflow-x-auto text-xs font-mono"
                        style={{
                          backgroundColor: isDarkMode ? '#09090B' : '#f5f5f7',
                          color: colors.muted,
                          height: '300px'
                        }}
                      >
                        {JSON.stringify(stats || {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold mb-2" style={{ color: colors.muted }}>Execution Log</h4>
                      <pre
                        className="p-4 rounded-lg overflow-x-auto text-xs font-mono whitespace-pre-wrap"
                        style={{
                          backgroundColor: isDarkMode ? '#09090B' : '#f5f5f7',
                          color: isDarkMode ? '#34d399' : '#059669',
                          height: '300px'
                        }}
                      >
                        {output || 'No output logs captured.'}
                      </pre>
                    </div>
                  </div>
                </details>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
