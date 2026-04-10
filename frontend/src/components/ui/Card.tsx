import { HTMLAttributes, forwardRef } from 'react'
import { Link } from 'react-router-dom'

// Base Card
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'raised' | 'overlay'
  hover?: boolean
}

const cardVariants = {
  base: 'bg-[#272729]',
  raised: 'bg-[#2a2a2d]',
  overlay: 'bg-[#28282a]',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'base', hover = false, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl ${cardVariants[variant]} ${hover ? 'hover:bg-surface-overlay transition-colors' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

// Data Card - for stock tickers, metrics with accent bar
interface DataCardProps extends HTMLAttributes<HTMLDivElement> {
  accentColor?: 'apple' | 'white' | 'muted' | 'red'
  active?: boolean
}

const accentColors = {
  apple: 'border-l-[#0071e3]',
  white: 'border-l-white',
  muted: 'border-l-[rgba(255,255,255,0.48)]',
  red: 'border-l-[#ff3b30]',
}

export const DataCard = forwardRef<HTMLDivElement, DataCardProps>(
  ({ accentColor = 'apple', active = false, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-[#272729] rounded-lg p-6 border-l-4 ${accentColors[accentColor]} ${active ? 'shadow-[rgba(0,0,0,0.22)_3px_5px_30px_0px]' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DataCard.displayName = 'DataCard'

// Stat Card - for key metrics display
interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  suffix?: string
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, change, changeType = 'neutral', suffix, className = '', ...props }, ref) => {
    const changeColors = {
      positive: 'text-[#34c759]',
      negative: 'text-[#ff3b30]',
      neutral: 'text-white/48',
    }

    return (
      <div
        ref={ref}
        className={`bg-[#272729] rounded-lg p-6 text-center hover:bg-[#2a2a2d] transition-colors ${className}`}
        {...props}
      >
        <p className="text-[28px] font-normal text-white mb-1 tabular-nums leading-[1.14] tracking-[0.196px]">{value}{suffix && <span className="text-[17px] text-white/48 ml-1">{suffix}</span>}</p>
        <p className="text-[14px] text-white/48 mb-1 tracking-[-0.224px]">{label}</p>
        {change && <p className={`text-[14px] font-medium tracking-[-0.224px] ${changeColors[changeType]}`}>{change}</p>}
      </div>
    )
  }
)
StatCard.displayName = 'StatCard'

// Feature Card - for landing page tool cards
interface FeatureCardProps {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  accentColor: 'emerald' | 'blue' | 'purple'
  linkTo: string
}

const featureCardStyles = {
  emerald: {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
    border: 'rgba(16, 185, 129, 0.2)',
    hoverBorder: 'rgba(16, 185, 129, 0.4)',
    hoverShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
    bullet: '#10B981',
    icon: '#34D399'
  },
  blue: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
    border: 'rgba(59, 130, 246, 0.2)',
    hoverBorder: 'rgba(59, 130, 246, 0.4)',
    hoverShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
    bullet: '#3B82F6',
    icon: '#60A5FA'
  },
  purple: {
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%)',
    border: 'rgba(168, 85, 247, 0.2)',
    hoverBorder: 'rgba(168, 85, 247, 0.4)',
    hoverShadow: '0 0 30px rgba(168, 85, 247, 0.2)',
    bullet: '#A855F7',
    icon: '#C084FC'
  }
}

export function FeatureCard({ title, description, icon, features, accentColor, linkTo }: FeatureCardProps) {
  const styles = featureCardStyles[accentColor]

  return (
    <Link
      to={linkTo}
      style={{
        display: 'block',
        background: styles.background,
        border: `1px solid ${styles.border}`,
        borderRadius: 24,
        padding: 48,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = styles.hoverBorder
        e.currentTarget.style.boxShadow = styles.hoverShadow
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = styles.border
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 32
      }}>
        <div style={{
          padding: 16,
          borderRadius: 16,
          border: '1px solid #27272A',
          backgroundColor: '#1A1A1D'
        }}>
          <span style={{ color: styles.icon }}>{icon}</span>
        </div>
        <svg style={{ width: 24, height: 24, color: '#71717A' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>

      {/* Content */}
      <h3 style={{ fontSize: 24, fontWeight: 600, color: '#FAFAFA', marginBottom: 12 }}>{title}</h3>
      <p style={{ fontSize: 15, color: '#A1A1AA', marginBottom: 32, lineHeight: 1.6 }}>{description}</p>

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {features.map((feature, i) => (
          <li key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 14,
            color: '#D4D4D8',
            marginBottom: 16
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: styles.bullet,
              flexShrink: 0
            }} />
            {feature}
          </li>
        ))}
      </ul>
    </Link>
  )
}