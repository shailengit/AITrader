import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Map as MapIcon, List as ListIcon, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useMemo, useRef, useEffect } from 'react';

interface WFOWindow {
  window: number;
  train_start: string;
  train_end: string;
  test_start?: string;
  test_end?: string;
  best_param: string;
  train_metric: number;
  test_metric: number;
}

interface HeatmapRow {
  metric: number;
  [key: string]: number | string;
}

interface OptimizationData {
  mode: 'simple' | 'wfo' | 'true_wfo';
  heatmap?: HeatmapRow[];
  windows?: WFOWindow[];
  oos_equity?: { time: number; value: number }[];
  max_windows?: number;
}

interface OptimizationResultsProps {
  data: OptimizationData;
}

export default function OptimizationResults({ data }: OptimizationResultsProps) {
  if (!data) return null;

  const { mode, heatmap, windows, oos_equity, max_windows } = data;

  // Helper to format generic metric
  const fmt = (val: number | string) => (typeof val === 'number' ? val.toFixed(3) : val);

  // State for WFO table
  const [showAllWindows, setShowAllWindows] = useState(false);
  const DEFAULT_WINDOW_LIMIT = 100;
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Calculate which windows to show
  const displayWindows = useMemo(() => {
    if (!windows) return [];
    if (showAllWindows) return windows;
    return windows.slice(0, DEFAULT_WINDOW_LIMIT);
  }, [windows, showAllWindows]);

  // Calculate actual test range for each window
  const getTestRange = (w: WFOWindow) => {
    if (w.test_start && w.test_end) {
      return `${w.test_start} → ${w.test_end}`;
    }
    // Fallback: calculate from train dates if test dates not provided
    return 'Next Day';
  };

  // Virtual scroll handler - render only visible rows
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const ROW_HEIGHT = 40; // approximate row height in pixels

  useEffect(() => {
    if (!tableContainerRef.current || !showAllWindows) return;

    const container = tableContainerRef.current;
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const start = Math.floor(scrollTop / ROW_HEIGHT);
      const end = Math.min(
        start + Math.ceil(containerHeight / ROW_HEIGHT) + 10,
        windows?.length || 0
      );
      setVisibleRange({ start: Math.max(0, start - 5), end });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    return () => container.removeEventListener('scroll', handleScroll);
  }, [showAllWindows, windows?.length]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <h2 className="text-2xl font-bold tracking-tight text-emerald-400">
          {mode === 'wfo' || mode === 'true_wfo' ? 'Walk-Forward Analysis' : 'Optimization Results'}
        </h2>
      </motion.div>

      {/* WFO: Max Windows Info */}
      {(mode === 'wfo' || mode === 'true_wfo') && max_windows && (
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg p-3 text-sm text-zinc-400">
          <span className="font-semibold">Max Possible Windows:</span> {max_windows} |{' '}
          <span className="font-semibold">Windows Used:</span> {windows?.length || 0}
          {windows && windows.length < max_windows && (
            <span className="text-amber-500 ml-2">(capped from config)</span>
          )}
        </div>
      )}

      {/* WFO: Stitched Equity Curve */}
      {(mode === 'wfo' || mode === 'true_wfo') && oos_equity && (
        <div className="bg-surface border border-zinc-800/60 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-zinc-200">
            <TrendingUp size={16} className="text-emerald-400" /> Out-of-Sample
            Equity (Stitched)
          </h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart data={oos_equity}>
                <defs>
                  <linearGradient id="colorOOS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  opacity={0.3}
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  tickFormatter={(v) => {
                    // Handle both numeric timestamps (seconds) and ISO strings
                    if (typeof v === 'number') {
                      return new Date(v * 1000).toISOString().split('T')[0];
                    }
                    return String(v).split('T')[0];
                  }}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  minTickGap={50}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                  labelFormatter={(v) => {
                    // Handle both numeric timestamps (seconds) and ISO strings
                    if (typeof v === 'number') {
                      return new Date(v * 1000).toISOString().split('T')[0];
                    }
                    return String(v).split('T')[0];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  fill="url(#colorOOS)"
                  strokeWidth={2}
                  name="OOS Equity"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* WFO: Window Stats Table */}
      {(mode === 'wfo' || mode === 'true_wfo') && windows && (
        <div className="bg-surface border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-zinc-200">
              <ListIcon size={16} /> Walk-Forward Windows
              <span className="text-xs font-normal text-zinc-500 ml-2">
                ({windows.length} total)
              </span>
            </div>
            <button
              onClick={() => setShowAllWindows(!showAllWindows)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors"
            >
              {showAllWindows ? (
                <>
                  <EyeOff size={14} /> Show First {DEFAULT_WINDOW_LIMIT}
                </>
              ) : (
                <>
                  <Eye size={14} /> Show All {windows.length > DEFAULT_WINDOW_LIMIT && `(${windows.length})`}
                </>
              )}
            </button>
          </div>

          {/* Info banner when not showing all */}
          {!showAllWindows && windows.length > DEFAULT_WINDOW_LIMIT && (
            <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
              <span>Showing first {DEFAULT_WINDOW_LIMIT} of {windows.length} windows.</span>
              <button
                onClick={() => setShowAllWindows(true)}
                className="underline hover:text-amber-300"
              >
                Show all
              </button>
            </div>
          )}

          <div
            ref={tableContainerRef}
            className="overflow-x-auto overflow-y-auto"
            style={{
              maxHeight: showAllWindows ? '500px' : '400px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(148, 163, 184, 0.5) transparent',
            }}
          >
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left w-16">Window</th>
                  <th className="p-3 text-left">Train Range</th>
                  <th className="p-3 text-left">Test Range</th>
                  <th className="p-3 text-left">Best Param</th>
                  <th className="p-3 text-right">Train Metric</th>
                  <th className="p-3 text-right">Test Metric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {showAllWindows ? (
                  // Virtual scrolling for large datasets
                  <>
                    {/* Spacer for top padding */}
                    <tr style={{ height: `${visibleRange.start * ROW_HEIGHT}px` }} />
                    {windows.slice(visibleRange.start, visibleRange.end).map((w, idx) => {
                      const actualIndex = visibleRange.start + idx;
                      return (
                        <tr
                          key={actualIndex}
                          className="hover:bg-zinc-900/30"
                          style={{ height: `${ROW_HEIGHT}px` }}
                        >
                          <td className="p-3 font-mono text-zinc-300">{w.window}</td>
                          <td className="p-3 text-zinc-300">
                            {w.train_start} → {w.train_end}
                          </td>
                          <td className="p-3 text-zinc-400 text-xs">
                            {getTestRange(w)}
                          </td>
                          <td className="p-3 font-mono text-emerald-400 text-xs">{w.best_param}</td>
                          <td className="p-3 text-right text-zinc-300">{fmt(w.train_metric)}</td>
                          <td
                            className={`p-3 text-right font-bold ${w.test_metric > 0 ? 'text-emerald-400' : 'text-rose-500'}`}
                          >
                            {fmt(w.test_metric)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Spacer for bottom padding */}
                    <tr style={{ height: `${(windows.length - visibleRange.end) * ROW_HEIGHT}px` }} />
                  </>
                ) : (
                  // Standard display for limited view
                  displayWindows.map((w, i) => (
                    <tr key={i} className="hover:bg-zinc-900/30">
                      <td className="p-3 font-mono text-zinc-300">{w.window}</td>
                      <td className="p-3 text-zinc-300">
                        {w.train_start} → {w.train_end}
                      </td>
                      <td className="p-3 text-zinc-400 text-xs">
                        {getTestRange(w)}
                      </td>
                      <td className="p-3 font-mono text-emerald-400 text-xs">{w.best_param}</td>
                      <td className="p-3 text-right text-zinc-300">{fmt(w.train_metric)}</td>
                      <td
                        className={`p-3 text-right font-bold ${w.test_metric > 0 ? 'text-emerald-400' : 'text-rose-500'}`}
                      >
                        {fmt(w.test_metric)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-900/30 text-xs text-zinc-500 flex justify-between items-center">
            <span>
              Showing {showAllWindows ? 'all' : displayWindows.length} of {windows.length} windows
            </span>
            {windows.length > DEFAULT_WINDOW_LIMIT && !showAllWindows && (
              <button
                onClick={() => setShowAllWindows(true)}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Show all {windows.length} windows →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Simple Mode: Heatmap */}
      {mode === 'simple' &&
        heatmap &&
        (() => {
          // Sort heatmap by metric descending (best to worst)
          const sortedHeatmap = [...heatmap].sort((a, b) => (b.metric || 0) - (a.metric || 0));

          // Format metric as percentage
          const fmtPercent = (val: number) => {
            if (typeof val !== 'number' || isNaN(val)) return 'N/A';
            return (val * 100).toFixed(2) + '%';
          };

          return (
            <div className="bg-surface border border-zinc-800/60 rounded-xl overflow-hidden shadow-sm max-h-[500px] flex flex-col">
              <div className="p-4 border-b border-zinc-800/60 bg-zinc-900/50 flex items-center gap-2 font-semibold text-zinc-200">
                <MapIcon size={16} /> Parameter Heatmap (Sorted Best &rarr; Worst)
              </div>
              <div className="overflow-y-auto flex-1 p-0">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500 font-semibold sticky top-0">
                    <tr>
                      <th className="p-3 text-left w-12">#</th>
                      {Object.keys(sortedHeatmap[0] || {})
                        .filter((k) => k !== 'metric')
                        .map((k) => (
                          <th key={k} className="p-3 text-left">
                            {k}
                          </th>
                        ))}
                      <th className="p-3 text-right">Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {sortedHeatmap.slice(0, 100).map((row, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-zinc-900/30 ${i === 0 ? 'bg-emerald-500/10' : ''}`}
                      >
                        <td className="p-3 text-zinc-500 font-mono text-xs">{i + 1}</td>
                        {Object.entries(row)
                          .filter(([k]) => k !== 'metric')
                          .map(([k, v]) => (
                            <td key={k} className="p-3 font-mono text-zinc-300">
                              {v as string}
                            </td>
                          ))}
                        <td
                          className={`p-3 text-right font-bold ${row.metric >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}
                        >
                          {fmtPercent(row.metric)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sortedHeatmap.length > 100 && (
                <div className="p-2 text-center text-xs text-zinc-500 border-t border-zinc-800/60">
                  Showing top 100 of {sortedHeatmap.length} combinations
                </div>
              )}
            </div>
          );
        })()}
    </div>
  );
}
