import { Link } from 'react-router-dom'
import { Database } from 'lucide-react'
import { FeatureCard } from '../components/ui'
import { Activity, BarChart2, Terminal } from 'lucide-react'

const tools = [
  {
    id: 'sectors',
    title: 'Sector Rotation Scanner',
    description: 'Analyze sector ETF performance to identify momentum and rotation patterns. Find leading stocks within outperforming sectors.',
    icon: Activity,
    color: 'emerald' as const,
    link: '/sectors',
    features: [
      'Sector acceleration metrics',
      'Momentum leader identification',
      'Bollinger Bands squeeze detection',
      '3M/6M performance spread analysis',
    ],
  },
  {
    id: 'screener',
    title: 'AI Stock Screener',
    description: 'Multi-agent AI screening with technical and fundamental analysis. Find stocks with breakouts, accumulation patterns, and EPS acceleration.',
    icon: BarChart2,
    color: 'blue' as const,
    link: '/screener',
    features: [
      'Volatility contraction detection',
      'OBV hidden accumulation',
      'EPS inflection verification',
      'AI-powered analysis workflow',
    ],
  },
  {
    id: 'quantgen',
    title: 'QuantGen Strategy Builder',
    description: 'AI-powered quantitative strategy generator with VectorBT backtesting. Create, test, and optimize trading strategies.',
    icon: Terminal,
    color: 'purple' as const,
    link: '/quantgen',
    features: [
      'AI code generation',
      'VectorBT backtesting',
      'Walk-forward optimization',
      'Strategy management',
    ],
  },
]

const stats = [
  { label: 'S&P 1500 Coverage', value: '~1,500', suffix: 'stocks' },
  { label: 'Sector ETFs', value: '11', suffix: 'sectors' },
  { label: 'Historical Data', value: 'Daily', suffix: 'OHLCV' },
  { label: 'AI Models', value: 'Agno', suffix: '+ Ollama' },
]

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#09090B' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background effects */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(16, 185, 129, 0.05), transparent, transparent)'
        }} />
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 600,
          background: 'rgba(16, 185, 129, 0.05)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          opacity: 0.3
        }} />

        {/* Floating orbs */}
        <div style={{
          position: 'absolute',
          top: 80,
          left: '25%',
          width: 256,
          height: 256,
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }} />
        <div style={{
          position: 'absolute',
          top: 160,
          right: '25%',
          width: 192,
          height: 192,
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }} />
        <div style={{
          position: 'absolute',
          top: 240,
          right: '33%',
          width: 128,
          height: 128,
          background: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '50%',
          filter: 'blur(100px)'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1600,
          margin: '0 auto',
          padding: '64px'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            paddingTop: 80,
            marginBottom: 100
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 28px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: 50,
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              fontSize: 15,
              marginBottom: 48
            }}>
              <Database style={{ width: 20, height: 20 }} />
              <span>PostgreSQL Powered</span>
            </div>

            <h1 style={{
              fontSize: 80,
              fontWeight: 700,
              color: '#FAFAFA',
              marginBottom: 32,
              letterSpacing: '-0.04em'
            }}>
              TradeCraft
            </h1>

            <p style={{
              fontSize: 22,
              color: '#A1A1AA',
              maxWidth: 640,
              margin: '0 auto 56px',
              lineHeight: 1.6
            }}>
              Unified trading platform for sector rotation analysis, AI-powered screening, and quantitative strategy building.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20
            }}>
              <Link
                to="/sectors"
                style={{
                  background: '#10B981',
                  color: '#000',
                  padding: '20px 48px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                Launch Scanner
                <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link
                to="/sectors"
                style={{
                  background: 'transparent',
                  color: '#A1A1AA',
                  padding: '20px 40px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 500,
                  textDecoration: 'none',
                  border: '1px solid #3F3F46'
                }}
              >
                Explore Features
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
            marginBottom: 100
          }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#121214',
                  border: '1px solid #27272A',
                  borderRadius: 24,
                  padding: '48px 40px',
                  textAlign: 'center'
                }}
              >
                <p style={{
                  fontSize: 64,
                  fontWeight: 700,
                  color: '#FAFAFA',
                  marginBottom: 12
                }}>{stat.value}</p>
                <p style={{
                  fontSize: 14,
                  color: '#A1A1AA',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em'
                }}>{stat.label}</p>
                {stat.suffix && (
                  <span style={{ fontSize: 16, color: '#71717A', marginLeft: 4 }}>{stat.suffix}</span>
                )}
              </div>
            ))}
          </div>

          {/* Section Label */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#52525B'
            }}>Platform Tools</h2>
          </div>

          {/* Tool Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 48,
            marginBottom: 100
          }}>
            {tools.map((tool) => (
              <FeatureCard
                key={tool.id}
                title={tool.title}
                description={tool.description}
                icon={<tool.icon style={{ width: 32, height: 32 }} />}
                features={tool.features}
                accentColor={tool.color}
                linkTo={tool.link}
              />
            ))}
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            padding: '48px 0',
            borderTop: '1px solid #27272A'
          }}>
            <p style={{ fontSize: 14, color: '#52525B' }}>
              Combined from StockScreener, Sector-Rotation-Scanner, and QuantGen
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}