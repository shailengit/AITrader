import { useState, useEffect } from "react";
import {
  Search,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  BarChart2,
  Sparkles,
  ChevronDown,
  Zap,
  BarChart3,
  SlidersHorizontal,
  Bot,
  Play,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScanResult {
  ticker: string;
  signal?: string;
  fundamental_catalyst?: string;
  close?: number;
  data_date?: string;
  sma_20?: number;
  sma_50?: number;
  rsi?: number;
  macd?: number;
  volume?: number;
}

interface ScanStatus {
  scan_id: string;
  mode: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  use_ai: boolean;
  results_count: number;
  has_ai_report: boolean;
  error?: string;
}

interface ScreenerMode {
  id: string;
  name: string;
  description: string;
  agents: string[];
  supports_backtesting: boolean;
}

export default function StockScreener() {
  const [modes, setModes] = useState<ScreenerMode[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>("dormant_giant");
  const [useAi, setUseAi] = useState(true);
  const [cutoffDate, setCutoffDate] = useState<string>("");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [scanStatus, setScanStatus] = useState<ScanStatus | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [, setLogs] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    squeeze_threshold: 1.15,
    accumulation_threshold: 0.005,
    volume_threshold: 1.5,
  });

  useEffect(() => {
    fetch("/api/screener/modes")
      .then((res) => res.json())
      .then((data) => setModes(data.modes))
      .catch((err) => console.error("Failed to fetch modes:", err));
  }, []);

  const startScan = async () => {
    setIsScanning(true);
    setError(null);
    setResults([]);
    setAiReport(null);
    setShowReport(false);
    setLogs([]);

    try {
      const res = await fetch("/api/screener/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          use_ai: useAi,
          cutoff_date: cutoffDate || undefined,
          prompt: customPrompt || undefined,
          max_results: 50,
          filters: selectedMode === "dormant_giant" ? filters : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to start scan");

      const data = await res.json();
      pollScanStatus(data.scan_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsScanning(false);
    }
  };

  const pollScanStatus = async (id: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/screener/status/${id}`);
        const data = await res.json();

        setScanStatus(data);
        if (data.logs) setLogs(data.logs);

        if (data.status === "running") {
          setTimeout(poll, 1000);
        } else if (data.status === "completed") {
          setIsScanning(false);
          fetchResults(id);
        } else if (data.status === "failed") {
          setIsScanning(false);
          setError(data.error || "Scan failed");
        }
      } catch (err) {
        setIsScanning(false);
        setError("Failed to get scan status");
      }
    };
    poll();
  };

  const fetchResults = async (id: string) => {
    try {
      const res = await fetch(`/api/screener/results/${id}`);
      const data = await res.json();
      setResults(data.results || []);

      if (data.has_ai_report) {
        const reportRes = await fetch(`/api/screener/ai-report/${id}`);
        const reportData = await reportRes.json();
        setAiReport(reportData.ai_report);
      }
    } catch (err) {
      console.error("Failed to fetch results:", err);
    }
  };

  const selectedModeInfo = modes.find((m) => m.id === selectedMode);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Background Effects - Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.03), transparent, transparent)'
          }}
        />
        {/* Floating orbs */}
        <div
          className="absolute top-20 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-20 animate-float"
          style={{ background: 'rgba(16, 185, 129, 0.15)' }}
        />
        <div
          className="absolute top-40 right-1/4 w-48 h-48 rounded-full blur-[100px] opacity-15 animate-float"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            animationDelay: '2s'
          }}
        />
        <div
          className="absolute top-60 right-1/3 w-32 h-32 rounded-full blur-[80px] opacity-10"
          style={{ background: 'rgba(16, 185, 129, 0.1)' }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 w-full flex justify-center pt-32 pb-16 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center"
        >
          <div className="flex justify-center mb-8">
            <div
              className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 border"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.2)'
              }}
            >
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-base text-emerald-400/80 font-medium">
                Multi-Agent Intelligence
              </span>
            </div>
          </div>

          <h1
            className="text-7xl font-bold mb-6 tracking-tight text-center"
            style={{
              color: '#FAFAFA',
              letterSpacing: '-0.04em'
            }}
          >
            AI Stock Screener
          </h1>

          <p
            className="text-2xl max-w-3xl mx-auto leading-relaxed text-center"
            style={{ color: '#A1A1AA' }}
          >
            Advanced technical and fundamental analysis powered by intelligent
            agents
          </p>
        </motion.div>
      </div>

      {/* Configuration Section */}
      <div className="relative z-10 w-full flex justify-center px-8 py-10 pb-20">
        <div style={{ maxWidth: 1600, width: '100%', margin: '0 auto' }}>
          {/* Mode Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex flex-col items-center text-center gap-4 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(16, 185, 129, 0.1)' }}
              >
                <Play className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white text-center">
                  Select Mode
                </h2>
                <p className="text-base text-zinc-500 mt-1 text-center">
                  Choose your screening strategy
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {modes.map((mode) => {
                const isSelected = selectedMode === mode.id;
                const Icon = mode.id === "dormant_giant" ? Zap : BarChart3;

                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`relative p-8 rounded-3xl text-center transition-all duration-300 border ${
                      isSelected
                        ? "bg-surface border-emerald-500/50 shadow-glow"
                        : "bg-surface/50 border-zinc-800 hover:bg-surface hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-6">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-emerald-500/10" : "bg-zinc-800/50"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 ${isSelected ? "text-emerald-500" : "text-zinc-500"}`}
                        />
                      </div>

                      <div className="w-full">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h3 className={`text-2xl font-bold text-center ${isSelected ? "text-white" : "text-zinc-300"}`}>
                            {mode.name}
                          </h3>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-black" />
                            </div>
                          )}
                        </div>

                        <p className="text-base text-zinc-400 leading-relaxed mb-4 text-center">
                          {mode.description}
                        </p>

                        <div className="flex flex-wrap justify-center gap-2">
                          {mode.agents.slice(0, 4).map((agent) => (
                            <span
                              key={agent}
                              className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                                isSelected
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-zinc-800 text-zinc-500 border border-zinc-700"
                              }`}
                            >
                              {agent}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Settings Grid */}
          <div className="grid xl:grid-cols-3 gap-8 mt-16">
            {/* AI Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="xl:col-span-2 bg-surface border border-zinc-800 rounded-3xl p-8"
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                  >
                    <Bot className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white text-center">
                      AI Analysis
                    </h3>
                  </div>
                </div>
                <p className="text-base text-zinc-500 text-center">
                  Multi-agent interpretation for deeper insights
                </p>

                <button
                  type="button"
                  role="switch"
                  aria-checked={useAi}
                  onClick={() => setUseAi(!useAi)}
                  className={`relative w-16 h-9 rounded-full transition-colors ${
                    useAi ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-7 h-7 rounded-full bg-black transition-transform ${
                      useAi ? "translate-x-8" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {useAi && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3 text-center">
                    Custom Instructions
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={
                      selectedMode === "dormant_giant"
                        ? "Begin the daily Dormant Giant screening workflow..."
                        : "Find me 5 Small or Mid Cap stocks in an uptrend..."
                    }
                    className="w-full h-32 bg-black/50 border border-zinc-800 rounded-xl p-4 text-lg text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none resize-none"
                  />
                </div>
              )}

              {scanStatus && scanStatus.status === "running" && (
                <div className="mt-6 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                  <div className="flex justify-between text-base mb-3">
                    <span className="text-zinc-400">Analyzing stocks</span>
                    <span className="font-bold text-white">{scanStatus.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scanStatus.progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Filters Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {selectedMode === "dormant_giant" && (
                <div className="bg-surface border border-zinc-800 rounded-3xl p-8">
                  <div className="flex flex-col items-center text-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
                      <SlidersHorizontal className="w-7 h-7 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white text-center">
                        Sensitivity
                      </h3>
                      <p className="text-sm text-zinc-500 text-center">
                        Adjust thresholds
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {[
                      {
                        key: "squeeze_threshold",
                        label: "Squeeze",
                        min: 1,
                        max: 2,
                        step: 0.01,
                      },
                      {
                        key: "accumulation_threshold",
                        label: "Accumulation",
                        min: 0.001,
                        max: 0.02,
                        step: 0.001,
                      },
                      {
                        key: "volume_threshold",
                        label: "Volume",
                        min: 1,
                        max: 3,
                        step: 0.1,
                      },
                    ].map((slider) => (
                      <div key={slider.key}>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-base font-medium text-zinc-300 text-center">
                            {slider.label}
                          </span>
                          <span className="text-base font-bold text-white">
                            {filters[slider.key as keyof typeof filters]}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={slider.min}
                          max={slider.max}
                          step={slider.step}
                          value={filters[slider.key as keyof typeof filters]}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              [slider.key]: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-2.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between mt-2 text-xs text-zinc-600">
                          <span>{slider.min}</span>
                          <span>{slider.max}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedMode === "quant_strategy" &&
                selectedModeInfo?.supports_backtesting && (
                  <div className="bg-surface border border-zinc-800 rounded-3xl p-8">
                    <label className="block text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                      Backtest Cutoff Date
                    </label>
                    <input
                      type="date"
                      value={cutoffDate}
                      onChange={(e) => setCutoffDate(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-lg text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none"
                    />
                  </div>
                )}

              <button
                onClick={startScan}
                disabled={isScanning}
                className={`w-full py-5 px-8 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-3 ${
                  isScanning
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-emerald-500 text-black hover:bg-emerald-400 active:bg-emerald-600 shadow-glow hover:shadow-lg"
                }`}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-6 h-6" />
                    <span>Start {useAi ? "AI " : ""}Screen</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Empty State */}
          {!scanStatus && !isScanning && results.length === 0 && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-20 text-center pb-8"
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(39, 39, 42, 0.5)' }}
              >
                <Search className="w-12 h-12 text-zinc-600" />
              </div>
              <p className="text-2xl text-zinc-300 font-bold mb-2">
                Ready to scan
              </p>
              <p className="text-lg text-zinc-500">
                Configure settings and click Start to begin analysis
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {(results.length > 0 || aiReport) && (
        <div className="relative z-10 w-full flex justify-center bg-black/50 py-20 border-t border-zinc-800">
          <div style={{ maxWidth: 1600, width: '100%', margin: '0 auto', padding: '0 32px' }}>
            {/* AI Report */}
            <AnimatePresence>
              {aiReport && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-12"
                >
                  <div className="bg-surface border border-zinc-800 rounded-3xl p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                        >
                          <Cpu className="w-7 h-7 text-emerald-500" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white text-center">
                            AI Analysis Report
                          </h2>
                        </div>
                      </div>
                      <p className="text-base text-zinc-500 text-center">
                        Generated by multi-agent team
                      </p>
                      <button
                        onClick={() => setShowReport(!showReport)}
                        className="flex items-center justify-center gap-2 text-base text-emerald-400 hover:text-emerald-300 px-4 py-2 mx-auto mt-4"
                      >
                        {showReport ? "Hide" : "Show"}
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${showReport ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {showReport && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-black/50 rounded-2xl p-6 border border-zinc-800">
                            <pre className="whitespace-pre-wrap text-base text-zinc-300 font-mono leading-relaxed">
                              {aiReport}
                            </pre>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Grid */}
            <AnimatePresence>
              {results.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex flex-col items-center text-center mb-8">
                    <h2 className="text-3xl font-bold text-white text-center mb-4">
                      {results.length} stocks found
                    </h2>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="text-base font-medium">
                        Analysis complete
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.ticker}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-surface border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-colors text-center"
                      >
                        <div className="flex flex-col items-center mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white text-center">
                              {result.ticker}
                            </h3>
                            {result.signal && (
                              <span className="text-base text-emerald-400 text-center block">
                                {result.signal}
                              </span>
                            )}
                          </div>
                          <TrendingUp className="w-6 h-6 text-zinc-600 mt-2" />
                        </div>

                        {result.close && (
                          <p className="text-3xl font-bold text-white mb-4 text-center">
                            ${result.close.toFixed(2)}
                          </p>
                        )}

                        {result.fundamental_catalyst && (
                          <div
                            className="mb-4 p-4 rounded-xl border"
                            style={{
                              background: 'rgba(16, 185, 129, 0.05)',
                              borderColor: 'rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            <p className="text-base text-emerald-400 text-center">
                              {result.fundamental_catalyst}
                            </p>
                          </div>
                        )}

                        {(result.sma_20 || result.rsi) && (
                          <div className="grid grid-cols-2 gap-4 text-base">
                            {result.sma_20 && (
                              <div className="text-zinc-400 text-center">
                                <span className="text-zinc-600 block text-sm mb-1 text-center">
                                  SMA(20)
                                </span>
                                <span className="text-white font-bold text-center block">
                                  {result.sma_20.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {result.rsi && (
                              <div className="text-zinc-400 text-center">
                                <span className="text-zinc-600 block text-sm mb-1 text-center">
                                  RSI
                                </span>
                                <span className="text-white font-bold text-center block">
                                  {result.rsi.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-center gap-2 text-sm text-zinc-500">
                          <BarChart2 className="w-5 h-5" />
                          <span>Technical + Fundamental</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 text-lg font-medium"
          >
            <AlertCircle className="w-6 h-6" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
