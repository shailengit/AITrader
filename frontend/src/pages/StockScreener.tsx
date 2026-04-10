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
    <div className="min-h-screen bg-black">
      {/* Hero Section - Full Width with Large Typography for Retina */}
      <div className="bg-black text-center pt-32 pb-20 px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-5 py-2.5 mb-8">
            <Sparkles className="w-5 h-5 text-[#0071e3]" />
            <span className="text-base text-white/80 font-medium">
              Multi-Agent Intelligence
            </span>
          </div>

          <h1 className="text-7xl font-bold text-white mb-6 tracking-tight">
            AI Stock Screener
          </h1>

          <p className="text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
            Advanced technical and fundamental analysis powered by intelligent
            agents
          </p>
        </motion.div>
      </div>

      {/* Configuration Section - Full Width for High Res */}
      <div className="bg-[#f5f5f7]">
        <div className="max-w-[1600px] mx-auto px-12 py-16">
          {/* Mode Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#0071e3]/10 flex items-center justify-center">
                <Play className="w-7 h-7 text-[#0071e3]" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[#1d1d1f]">
                  Select Mode
                </h2>
                <p className="text-base text-[rgba(0,0,0,0.64)] mt-1">
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
                    className={`relative p-8 rounded-3xl text-left transition-all duration-300 ${
                      isSelected
                        ? "bg-white shadow-xl ring-2 ring-[#0071e3]"
                        : "bg-white/70 hover:bg-white shadow-lg"
                    }`}
                  >
                    <div className="flex items-start gap-6">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#0071e3]/10" : "bg-[#f5f5f7]"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 ${isSelected ? "text-[#0071e3]" : "text-[#1d1d1f]/40"}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3
                            className={`text-2xl font-bold ${isSelected ? "text-[#1d1d1f]" : "text-[rgba(0,0,0,0.8)]"}`}
                          >
                            {mode.name}
                          </h3>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#0071e3] flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            </div>
                          )}
                        </div>

                        <p className="text-base text-[rgba(0,0,0,0.64)] leading-relaxed mb-4">
                          {mode.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {mode.agents.slice(0, 4).map((agent) => (
                            <span
                              key={agent}
                              className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                                isSelected
                                  ? "bg-[#0071e3]/10 text-[#0066cc]"
                                  : "bg-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.48)]"
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

          {/* Settings Grid - 3 Column Layout */}
          <div className="grid xl:grid-cols-3 gap-8">
            {/* AI Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="xl:col-span-2 bg-white rounded-3xl p-8 shadow-lg"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0071e3]/10 flex items-center justify-center">
                    <Bot className="w-7 h-7 text-[#0071e3]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1d1d1f]">
                      AI Analysis
                    </h3>
                    <p className="text-base text-[rgba(0,0,0,0.64)] mt-1">
                      Multi-agent interpretation for deeper insights
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={useAi}
                  onClick={() => setUseAi(!useAi)}
                  className={`relative w-16 h-9 rounded-full transition-colors ${
                    useAi ? "bg-[#0071e3]" : "bg-[#d2d2d7]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-transform ${
                      useAi ? "translate-x-8" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {useAi && (
                <div className="bg-[#f5f5f7] rounded-2xl p-6">
                  <label className="block text-sm font-semibold text-[rgba(0,0,0,0.48)] uppercase tracking-wide mb-3">
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
                    className="w-full h-32 bg-white border-0 rounded-xl p-4 text-lg text-[#1d1d1f] placeholder:text-[rgba(0,0,0,0.32)] focus:ring-2 focus:ring-[#0071e3] outline-none resize-none"
                  />
                </div>
              )}

              {scanStatus && scanStatus.status === "running" && (
                <div className="mt-6 p-6 bg-[#f5f5f7] rounded-2xl">
                  <div className="flex justify-between text-base mb-3">
                    <span className="text-[rgba(0,0,0,0.64)]">
                      Analyzing stocks
                    </span>
                    <span className="font-bold text-[#1d1d1f]">
                      {scanStatus.progress}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scanStatus.progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-[#0071e3]"
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
                <div className="bg-white rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] flex items-center justify-center">
                      <SlidersHorizontal className="w-7 h-7 text-[#1d1d1f]/60" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1d1d1f]">
                        Sensitivity
                      </h3>
                      <p className="text-sm text-[rgba(0,0,0,0.64)]">
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
                          <span className="text-base font-medium text-[rgba(0,0,0,0.8)]">
                            {slider.label}
                          </span>
                          <span className="text-base font-bold text-[#1d1d1f]">
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
                          className="w-full h-2.5 bg-[#f5f5f7] rounded-full appearance-none cursor-pointer accent-[#0071e3]"
                        />
                        <div className="flex justify-between mt-2 text-xs text-[rgba(0,0,0,0.32)]">
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
                  <div className="bg-white rounded-3xl p-8 shadow-lg">
                    <label className="block text-sm font-semibold text-[rgba(0,0,0,0.48)] uppercase tracking-wide mb-3">
                      Backtest Cutoff Date
                    </label>
                    <input
                      type="date"
                      value={cutoffDate}
                      onChange={(e) => setCutoffDate(e.target.value)}
                      className="w-full bg-[#f5f5f7] border-0 rounded-xl px-4 py-3 text-lg text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] outline-none"
                    />
                  </div>
                )}

              <button
                onClick={startScan}
                disabled={isScanning}
                className={`w-full py-5 px-8 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-3 ${
                  isScanning
                    ? "bg-[#d2d2d7] text-[rgba(0,0,0,0.32)] cursor-not-allowed"
                    : "bg-[#0071e3] text-white hover:bg-[#0066cc] active:bg-[#005bb5] shadow-lg hover:shadow-xl"
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
              <div className="w-24 h-24 bg-[#e8e8ed] rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-[rgba(0,0,0,0.24)]" />
              </div>
              <p className="text-2xl text-[rgba(0,0,0,0.8)] font-bold mb-2">
                Ready to scan
              </p>
              <p className="text-lg text-[rgba(0,0,0,0.48)]">
                Configure settings and click Start to begin analysis
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {(results.length > 0 || aiReport) && (
        <div className="bg-black py-20">
          <div className="max-w-[1600px] mx-auto px-12">
            {/* AI Report */}
            <AnimatePresence>
              {aiReport && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-12"
                >
                  <div className="bg-[#1c1c1e] rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#0071e3]/20 flex items-center justify-center">
                          <Cpu className="w-7 h-7 text-[#2997ff]" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            AI Analysis Report
                          </h2>
                          <p className="text-base text-white/60">
                            Generated by multi-agent team
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowReport(!showReport)}
                        className="flex items-center gap-2 text-base text-[#2997ff] hover:underline px-4 py-2"
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
                          <div className="bg-black/50 rounded-2xl p-6 border border-white/10">
                            <pre className="whitespace-pre-wrap text-base text-white/80 font-mono leading-relaxed">
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
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-white">
                      {results.length} stocks found
                    </h2>
                    <div className="flex items-center gap-2 text-[#34c759]">
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
                        className="bg-[#1c1c1e] rounded-3xl p-6 hover:bg-[#2c2c2e] transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {result.ticker}
                            </h3>
                            {result.signal && (
                              <span className="text-base text-[#2997ff]">
                                {result.signal}
                              </span>
                            )}
                          </div>
                          <TrendingUp className="w-6 h-6 text-white/40" />
                        </div>

                        {result.close && (
                          <p className="text-3xl font-bold text-white mb-4">
                            ${result.close.toFixed(2)}
                          </p>
                        )}

                        {result.fundamental_catalyst && (
                          <div className="mb-4 p-4 bg-[#0071e3]/10 rounded-xl">
                            <p className="text-base text-[#2997ff]">
                              {result.fundamental_catalyst}
                            </p>
                          </div>
                        )}

                        {(result.sma_20 || result.rsi) && (
                          <div className="grid grid-cols-2 gap-4 text-base">
                            {result.sma_20 && (
                              <div className="text-white/60">
                                <span className="text-white/40 block text-sm mb-1">
                                  SMA(20)
                                </span>
                                <span className="text-white font-bold">
                                  {result.sma_20.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {result.rsi && (
                              <div className="text-white/60">
                                <span className="text-white/40 block text-sm mb-1">
                                  RSI
                                </span>
                                <span className="text-white font-bold">
                                  {result.rsi.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-white/40">
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#ff3b30] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 text-lg font-medium"
          >
            <AlertCircle className="w-6 h-6" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
