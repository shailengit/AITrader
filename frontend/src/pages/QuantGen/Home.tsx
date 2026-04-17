import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  BarChart2,
  Library,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Target,
  Code2,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function QuantGenHome() {
  const { isDarkMode } = useTheme();
  const [stats] = useState(() => {
    try {
      const saved = localStorage.getItem('builderState');
      if (saved) {
        const state = JSON.parse(saved);
        return {
          strategies: state.strategies?.length || 0,
          backtests: state.backtestCount || 0,
        };
      }
    } catch {}
    return { strategies: 0, backtests: 0 };
  });

  // Theme-aware colors
  const colors = {
    text: isDarkMode ? '#FAFAFA' : '#1d1d1f',
    muted: isDarkMode ? '#A1A1AA' : '#6e6e73',
    surface: isDarkMode ? '#27272A' : '#ffffff',
    surfaceAlt: isDarkMode ? '#1A1A1D' : '#f5f5f7',
    border: isDarkMode ? '#3F3F46' : '#d2d2d7',
    cardBg: isDarkMode ? 'rgba(39, 39, 42, 0.8)' : '#ffffff',
  };

  return (
    <div className="relative min-h-full" style={{ backgroundColor: colors.surfaceAlt }}>
      {/* Background Effects - only in dark mode */}
      {isDarkMode && (
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
      )}

      <div
        className="relative z-10"
        style={{ paddingTop: '96px', paddingBottom: '96px', paddingLeft: '80px', paddingRight: '80px' }}
      >
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-6xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div variants={fadeInUp} className="text-center" style={{ marginBottom: '120px' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
              style={{
                marginBottom: '40px',
                backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`,
                color: isDarkMode ? '#34d399' : '#059669'
              }}
            >
              <Code2 className="w-4 h-4" />
              AI-Powered Strategy Builder
            </motion.div>

            <h1 className="text-5xl font-bold tracking-tight" style={{ marginBottom: '40px', color: colors.text }}>
              Generate Trading Strategies
              <br />
              <span style={{ color: isDarkMode ? '#34d399' : '#059669' }}>with Natural Language</span>
            </h1>

            <p
              className="text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ marginBottom: '60px', color: colors.muted }}
            >
              Describe your trading idea in plain English. QuantGen transforms it into backtested
              VectorBT code using real market data.
            </p>

            {/* Main Actions */}
            <motion.div variants={fadeInUp} className="grid md:grid-cols-3" style={{ gap: '32px', marginTop: '60px' }}>
              {/* Builder Card */}
              <Card
                hover
                className="group relative overflow-hidden p-8"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)'
                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.04) 100%)',
                  border: `1px solid ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-colors"
                  style={{ background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-2xl border"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border
                      }}
                    >
                      <Terminal className="w-6 h-6" style={{ color: isDarkMode ? '#34d399' : '#059669' }} />
                    </div>
                    <div
                      className="p-2 rounded-lg transition-colors"
                      style={{ backgroundColor: isDarkMode ? 'rgba(63, 63, 70, 0.5)' : '#f5f5f7' }}
                    >
                      <ChevronRight className="w-5 h-5" style={{ color: colors.muted }} />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold" style={{ color: colors.text, marginBottom: '16px' }}>
                    Strategy Builder
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: colors.muted, marginBottom: '32px' }}>
                    Generate trading strategies using natural language prompts with AI-powered code generation.
                  </p>

                  <NavLink
                    to="/quantgen/build"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? '#10B981' : '#059669',
                      color: '#ffffff'
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Building
                  </NavLink>
                </div>
              </Card>

              {/* Dashboard Card */}
              <Card
                hover
                className="group relative overflow-hidden p-8"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl"
                  style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-2xl border"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border
                      }}
                    >
                      <BarChart2 className="w-6 h-6" style={{ color: colors.muted }} />
                    </div>
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: isDarkMode ? 'rgba(63, 63, 70, 0.5)' : '#f5f5f7' }}
                    >
                      <ChevronRight className="w-5 h-5" style={{ color: colors.muted }} />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold" style={{ color: colors.text, marginBottom: '16px' }}>
                    Dashboard
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: colors.muted, marginBottom: '32px' }}>
                    View backtest results, equity curves, and performance metrics for your strategies.
                  </p>

                  <NavLink
                    to="/quantgen/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? '#27272A' : '#f5f5f7',
                      color: isDarkMode ? '#D4D4D8' : '#1d1d1f'
                    }}
                  >
                    <BarChart2 size={16} />
                    View Results
                  </NavLink>
                </div>
              </Card>

              {/* Library Card */}
              <Card
                hover
                className="group relative overflow-hidden p-8"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`
                }}
              >
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl"
                  style={{ background: isDarkMode ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.08)' }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-2xl border"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border
                      }}
                    >
                      <Library className="w-6 h-6" style={{ color: isDarkMode ? '#C084FC' : '#9333ea' }} />
                    </div>
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: isDarkMode ? 'rgba(63, 63, 70, 0.5)' : '#f5f5f7' }}
                    >
                      <ChevronRight className="w-5 h-5" style={{ color: colors.muted }} />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold" style={{ color: colors.text, marginBottom: '16px' }}>
                    Library
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: colors.muted, marginBottom: '32px' }}>
                    Manage your saved strategies, organize by status, and track performance over time.
                  </p>

                  <NavLink
                    to="/quantgen/library"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? '#27272A' : '#f5f5f7',
                      color: isDarkMode ? '#D4D4D8' : '#1d1d1f'
                    }}
                  >
                    <Library size={16} />
                    View Library
                  </NavLink>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={fadeInUp} style={{ marginTop: '120px' }}>
            <h2
              className="text-sm font-semibold uppercase tracking-widest text-center"
              style={{ marginBottom: '60px', color: colors.muted }}
            >
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
                  className="p-6 rounded-2xl transition-colors"
                  style={{
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <div
                    className="p-3 rounded-xl w-fit mb-4"
                    style={{ backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)' }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: isDarkMode ? '#34d399' : '#059669' }} />
                  </div>
                  <h4 className="text-base font-semibold mb-1" style={{ color: colors.text }}>{feature.title}</h4>
                  <p className="text-sm" style={{ color: colors.muted }}>{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-4"
            style={{ gap: '60px', marginTop: '120px' }}
          >
            {[
              { value: stats.strategies.toString(), label: 'Strategies', suffix: 'Created' },
              { value: stats.backtests.toString(), label: 'Backtests', suffix: 'Run' },
              { value: '45%', label: 'Avg Return', suffix: 'YTD' },
              { value: '1.35', label: 'Avg Sharpe', suffix: 'Ratio' },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-6 rounded-2xl"
                style={{
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`
                }}
              >
                <p className="text-3xl font-bold mb-1" style={{ color: colors.text }}>{stat.value}</p>
                <p className="text-sm" style={{ color: colors.muted }}>
                  {stat.label} <span style={{ color: isDarkMode ? '#52525B' : '#9ca3af' }}>{stat.suffix}</span>
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
