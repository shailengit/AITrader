# Frontend Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign TradeCraft frontend with a unified "Carbon & Emerald" design system for premium polish, compelling data visualization, and modern aesthetics.

**Architecture:** Build a design token system in Tailwind CSS, create reusable UI components (Button, Card, Badge, Metric, Input), redesign Layout with collapsible sidebar, then apply to all pages with enhanced visual hierarchy, gradients, and micro-interactions.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide React

---

## File Structure

**Create:**
- `frontend/src/components/ui/Button.tsx` — Button variants (primary, secondary, ghost, destructive)
- `frontend/src/components/ui/Card.tsx` — Card components (Base, Data, Stat, Feature)
- `frontend/src/components/ui/Badge.tsx` — Status badges and tags
- `frontend/src/components/ui/Metric.tsx` — Large number displays with change indicators
- `frontend/src/components/ui/Input.tsx` — Styled inputs and textareas
- `frontend/src/components/ui/index.ts` — Barrel export

**Modify:**
- `frontend/tailwind.config.js` — Design tokens (colors, typography, spacing, shadows)
- `frontend/src/styles/index.css` — CSS variables, global styles, animations
- `frontend/src/components/layout/Layout.tsx` — Sidebar, top bar, responsive behavior
- `frontend/src/pages/Landing.tsx` — Hero, stats, feature cards
- `frontend/src/pages/SectorRotation.tsx` — Charts, sector panel, stock cards
- `frontend/src/pages/StockScreener.tsx` — Mode selection, results grid, AI panel
- `frontend/src/pages/QuantGen.tsx` — Sub-navigation, builder, dashboard

---

## Task 1: Design Tokens (Tailwind Config)

**Files:**
- Modify: `frontend/tailwind.config.js`

- [ ] **Step 1: Update tailwind.config.js with complete design tokens**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background hierarchy
        canvas: '#09090B',
        surface: '#121214',
        'surface-raised': '#1A1A1D',
        'surface-overlay': '#222226',

        // Text hierarchy
        foreground: '#FAFAFA',
        muted: '#A1A1AA',
        subtle: '#52525B',
        disabled: '#3F3F46',

        // Accent - Emerald (primary)
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },

        // Accent - Blue (secondary, for Screener)
        blue: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },

        // Accent - Purple (tertiary, for QuantGen)
        purple: {
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
        },

        // Semantic
        positive: '#10B981',
        negative: '#EF4444',
        warning: '#F59E0B',

        // Zinc scale (extended)
        zinc: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['72px', { lineHeight: '1', letterSpacing: '-0.04em' }],
        'section': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'page': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'metric-lg': ['48px', { lineHeight: '1', letterSpacing: '0' }],
        'metric': ['24px', { lineHeight: '1.1', letterSpacing: '0' }],
        'metric-sm': ['16px', { lineHeight: '1.2', letterSpacing: '0' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(16, 185, 129, 0.2)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.2)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.25' },
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Verify tailwind config compiles**

Run: `cd frontend && npm run build`
Expected: Build succeeds without errors

- [ ] **Step 3: Commit design tokens**

```bash
git add frontend/tailwind.config.js
git commit -m "feat: add design tokens for Carbon & Emerald theme

- Background hierarchy: canvas, surface, surface-raised, surface-overlay
- Text hierarchy: foreground, muted, subtle, disabled
- Accent colors: emerald (primary), blue (secondary), purple (tertiary)
- Typography scale: display, section, page, metric sizes
- Shadow system: glow, card, elevated
- Animation keyframes: float, pulse-glow

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Global Styles (CSS Variables & Base Styles)

**Files:**
- Modify: `frontend/src/styles/index.css`

- [ ] **Step 1: Replace index.css with new design system styles**

```css
@import "tailwindcss";

/* ========================================
   Design System: Carbon & Emerald
   ======================================== */

:root {
  /* Background hierarchy */
  --canvas: #09090B;
  --surface: #121214;
  --surface-raised: #1A1A1D;
  --surface-overlay: #222226;

  /* Text hierarchy */
  --foreground: #FAFAFA;
  --muted: #A1A1AA;
  --subtle: #52525B;
  --disabled: #3F3F46;

  /* Borders */
  --border: #27272A;
  --border-hover: #3F3F46;

  /* Accent - Emerald */
  --accent: #10B981;
  --accent-light: #34D399;
  --accent-dark: #059669;
  --accent-glow: rgba(16, 185, 129, 0.15);
  --accent-glow-strong: rgba(16, 185, 129, 0.25);

  /* Secondary - Blue */
  --secondary: #3B82F6;
  --secondary-light: #60A5FA;
  --secondary-glow: rgba(59, 130, 246, 0.15);

  /* Tertiary - Purple */
  --tertiary: #A855F7;
  --tertiary-light: #C084FC;
  --tertiary-glow: rgba(168, 85, 247, 0.15);

  /* Semantic */
  --positive: #10B981;
  --negative: #EF4444;
  --warning: #F59E0B;
}

/* Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--canvas);
  color: var(--foreground);
  line-height: 1.6;
  min-height: 100vh;
}

#root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  line-height: 1.2;
  letter-spacing: -0.02em;
  font-weight: 600;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: var(--canvas);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

/* Selection */
::selection {
  background-color: rgba(16, 185, 129, 0.3);
  color: var(--foreground);
}

/* Focus styles */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Code font */
code, pre, .font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

/* Tabular numbers for metrics */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Transitions */
button, a, input, textarea, select {
  transition: all 0.15s ease;
}

/* ========================================
   Utility Classes
   ======================================== */

/* Glow effects */
.glow-emerald {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
}

.glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

.glow-purple {
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
}

/* Gradient backgrounds */
.bg-gradient-emerald {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%);
}

.bg-gradient-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%);
}

.bg-gradient-purple {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%);
}

/* Card hover effects */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Pulse animation for active states */
.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
  50% { box-shadow: 0 0 30px rgba(16, 185, 129, 0.4); }
}
```

- [ ] **Step 2: Verify styles apply correctly**

Run: `cd frontend && npm run dev`
Expected: Dev server starts without errors

- [ ] **Step 3: Commit global styles**

```bash
git add frontend/src/styles/index.css
git commit -m "feat: add global CSS variables and utility classes

- CSS variables for all design tokens
- Background, text, border variables
- Accent glows for emerald, blue, purple
- Scrollbar and selection styling
- Utility classes: glow-*, bg-gradient-*, hover-lift

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Button Component

**Files:**
- Create: `frontend/src/components/ui/Button.tsx`

- [ ] **Step 1: Create Button component with all variants**

```tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-500 text-black font-semibold hover:bg-emerald-400 shadow-glow',
  secondary: 'bg-zinc-800 text-zinc-200 font-medium hover:bg-zinc-700 border border-zinc-700',
  ghost: 'bg-transparent text-zinc-400 font-medium hover:bg-zinc-800 hover:text-zinc-200',
  destructive: 'bg-red-500 text-white font-semibold hover:bg-red-600',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2.5 text-base rounded-md gap-2',
  lg: 'px-6 py-3 text-lg rounded-lg gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-canvas disabled:opacity-50 disabled:cursor-not-allowed'

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

- [ ] **Step 2: Commit Button component**

```bash
git add frontend/src/components/ui/Button.tsx
git commit -m "feat: add Button component with variants

- Variants: primary, secondary, ghost, destructive
- Sizes: sm, md, lg
- Left/right icon support
- Focus ring styling
- Disabled state

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Card Components

**Files:**
- Create: `frontend/src/components/ui/Card.tsx`

- [ ] **Step 1: Create Card components (Base, Data, Stat, Feature)**

```tsx
import { HTMLAttributes, forwardRef } from 'react'

// Base Card
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'raised' | 'overlay'
  hover?: boolean
}

const cardVariants = {
  base: 'bg-surface border border-zinc-800/60',
  raised: 'bg-surface-raised border border-zinc-800/60',
  overlay: 'bg-surface-overlay border border-zinc-800/60',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'base', hover = false, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-xl ${cardVariants[variant]} ${hover ? 'hover:border-zinc-700 transition-colors' : ''} ${className}`}
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
  accentColor?: 'emerald' | 'blue' | 'purple' | 'red'
  active?: boolean
}

const accentColors = {
  emerald: 'border-l-emerald-500',
  blue: 'border-l-blue-500',
  purple: 'border-l-purple-500',
  red: 'border-l-red-500',
}

export const DataCard = forwardRef<HTMLDivElement, DataCardProps>(
  ({ accentColor = 'emerald', active = false, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-surface border border-zinc-800/60 rounded-xl p-6 border-l-4 ${accentColors[accentColor]} ${active ? 'shadow-glow' : ''} ${className}`}
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
      positive: 'text-emerald-400',
      negative: 'text-red-400',
      neutral: 'text-zinc-400',
    }

    return (
      <div
        ref={ref}
        className={`bg-surface border border-zinc-800/60 rounded-xl p-6 text-center hover:border-zinc-700 transition-colors ${className}`}
        {...props}
      >
        <p className="text-3xl font-bold text-white mb-1 tabular-nums">{value}{suffix && <span className="text-lg text-zinc-400 ml-1">{suffix}</span>}</p>
        <p className="text-sm text-zinc-400 mb-1">{label}</p>
        {change && <p className={`text-sm font-medium ${changeColors[changeType]}`}>{change}</p>}
      </div>
    )
  }
)
StatCard.displayName = 'StatCard'

// Feature Card - for landing page tool cards
interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
  accentColor: 'emerald' | 'blue' | 'purple'
  linkTo: string
}

const featureCardAccents = {
  emerald: { bg: 'bg-gradient-emerald', border: 'border-emerald-500/20 hover:border-emerald-500/40', icon: 'text-emerald-400' },
  blue: { bg: 'bg-gradient-blue', border: 'border-blue-500/20 hover:border-blue-500/40', icon: 'text-blue-400' },
  purple: { bg: 'bg-gradient-purple', border: 'border-purple-500/20 hover:border-purple-500/40', icon: 'text-purple-400' },
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, description, icon, features, accentColor, linkTo, className = '', ...props }, ref) => {
    const accents = featureCardAccents[accentColor]

    return (
      <a
        href={linkTo}
        className={`block ${accents.bg} border ${accents.border} rounded-xl p-8 hover:scale-[1.02] transition-all duration-300 group ${className}`}
        {...props}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="p-4 rounded-xl bg-surface-raised border border-zinc-800/50">
            <span className={accents.icon}>{icon}</span>
          </div>
          <svg className="w-6 h-6 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
        <p className="text-base text-zinc-400 mb-6 leading-relaxed">{description}</p>

        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
              <div className={`w-1.5 h-1.5 rounded-full ${accentColor === 'emerald' ? 'bg-emerald-500' : accentColor === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`} />
              {feature}
            </li>
          ))}
        </ul>
      </a>
    )
  }
)
FeatureCard.displayName = 'FeatureCard'
```

- [ ] **Step 2: Commit Card components**

```bash
git add frontend/src/components/ui/Card.tsx
git commit -m "feat: add Card components

- Card: Base card with variants (base, raised, overlay)
- DataCard: Stock ticker cards with accent border
- StatCard: Metric display with label, value, change
- FeatureCard: Landing page tool cards with hover effects

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Badge and Metric Components

**Files:**
- Create: `frontend/src/components/ui/Badge.tsx`
- Create: `frontend/src/components/ui/Metric.tsx`

- [ ] **Step 1: Create Badge component**

```tsx
import { HTMLAttributes, forwardRef } from 'react'

type BadgeVariant = 'emerald' | 'blue' | 'purple' | 'red' | 'amber' | 'zinc'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
}

const badgeVariants: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  blue: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  red: 'bg-red-500/15 text-red-300 border-red-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  zinc: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
}

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'emerald', size = 'md', children, className = '', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${badgeVariants[variant]} ${badgeSizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  }
)
Badge.displayName = 'Badge'

// Status Badge with dot indicator
interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'connected' | 'disconnected' | 'checking'
  label: string
}

const statusStyles = {
  connected: { dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]', text: 'text-emerald-400' },
  disconnected: { dot: 'bg-red-500', text: 'text-red-400' },
  checking: { dot: 'bg-zinc-500', text: 'text-zinc-400' },
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, label, className = '', ...props }, ref) => {
    const styles = statusStyles[status]

    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-2 ${className}`}
        {...props}
      >
        <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
        <span className={`text-sm ${styles.text}`}>{label}</span>
      </span>
    )
  }
)
StatusBadge.displayName = 'StatusBadge'
```

- [ ] **Step 2: Create Metric component**

```tsx
import { HTMLAttributes, forwardRef } from 'react'

type MetricSize = 'lg' | 'md' | 'sm'

interface MetricProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number
  label?: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  size?: MetricSize
  prefix?: string
  suffix?: string
}

const metricSizes: Record<MetricSize, { value: string; label: string }> = {
  lg: { value: 'text-5xl font-bold', label: 'text-sm text-zinc-500 mt-1' },
  md: { value: 'text-2xl font-semibold', label: 'text-xs text-zinc-500 mt-0.5' },
  sm: { value: 'text-lg font-medium', label: 'text-xs text-zinc-500 mt-0' },
}

const changeStyles = {
  positive: 'text-emerald-400',
  negative: 'text-red-400',
  neutral: 'text-zinc-400',
}

export const Metric = forwardRef<HTMLDivElement, MetricProps>(
  ({
    value,
    label,
    change,
    changeType = 'neutral',
    size = 'md',
    prefix,
    suffix,
    className = '',
    ...props
  }, ref) => {
    const sizes = metricSizes[size]

    return (
      <div ref={ref} className={`${className}`} {...props}>
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-zinc-500">{prefix}</span>}
          <span className={`${sizes.value} text-white tabular-nums`}>{value}</span>
          {suffix && <span className="text-zinc-400">{suffix}</span>}
        </div>
        {label && <p className={sizes.label}>{label}</p>}
        {change && (
          <p className={`text-sm font-medium ${changeStyles[changeType]} mt-1`}>
            {changeType === 'positive' && '+'}{change}
          </p>
        )}
      </div>
    )
  }
)
Metric.displayName = 'Metric'

// Progress Metric with bar
interface ProgressMetricProps extends HTMLAttributes<HTMLDivElement> {
  value: string | number
  label: string
  progress: number // 0-100
  progressColor?: 'emerald' | 'blue' | 'purple' | 'zinc'
  suffix?: string
}

const progressColors = {
  emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
  blue: 'bg-gradient-to-r from-blue-600 to-blue-400',
  purple: 'bg-gradient-to-r from-purple-600 to-purple-400',
  zinc: 'bg-zinc-600',
}

export const ProgressMetric = forwardRef<HTMLDivElement, ProgressMetricProps>(
  ({ value, label, progress, progressColor = 'emerald', suffix, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`${className}`} {...props}>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-sm text-zinc-400">{label}</span>
          <span className="text-lg font-mono text-emerald-400 tabular-nums">{value}{suffix}</span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progressColors[progressColor]}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
    )
  }
)
ProgressMetric.displayName = 'ProgressMetric'
```

- [ ] **Step 3: Commit Badge and Metric components**

```bash
git add frontend/src/components/ui/Badge.tsx frontend/src/components/ui/Metric.tsx
git commit -m "feat: add Badge and Metric components

Badge:
- Variants: emerald, blue, purple, red, amber, zinc
- Sizes: sm, md
- StatusBadge with connected/disconnected/checking states

Metric:
- Sizes: lg, md, sm
- Prefix/suffix support
- Change indicators with color
- ProgressMetric with gradient bar

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Input Components

**Files:**
- Create: `frontend/src/components/ui/Input.tsx`

- [ ] **Step 1: Create Input and Textarea components**

```tsx
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react'

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-zinc-900 border border-zinc-700 rounded-md px-4 py-3 text-zinc-300 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors ${error ? 'border-red-500' : ''}`}
          {...props}
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm text-zinc-400 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-zinc-900 border border-zinc-700 rounded-md px-4 py-3 text-zinc-300 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors resize-none ${error ? 'border-red-500' : ''}`}
          {...props}
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

// Toggle
interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, label, description, disabled = false }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center gap-4 p-5 bg-surface-raised border border-zinc-800 rounded-xl w-full text-left transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex-1">
          {label && <div className="text-base font-medium text-white">{label}</div>}
          {description && <div className="text-sm text-zinc-500 mt-1">{description}</div>}
        </div>
        <div
          className={`w-14 h-8 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-zinc-700'}`}
        >
          <div
            className={`w-6 h-6 mt-1 rounded-full bg-white transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`}
          />
        </div>
      </button>
    )
  }
)
Toggle.displayName = 'Toggle'
```

- [ ] **Step 2: Commit Input components**

```bash
git add frontend/src/components/ui/Input.tsx
git commit -m "feat: add Input, Textarea, and Toggle components

- Input with label and error state
- Textarea with label and error state
- Toggle with description support

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Barrel Export

**Files:**
- Create: `frontend/src/components/ui/index.ts`

- [ ] **Step 1: Create barrel export for all UI components**

```tsx
export { Button } from './Button'
export { Card, DataCard, StatCard, FeatureCard } from './Card'
export { Badge, StatusBadge } from './Badge'
export { Metric, ProgressMetric } from './Metric'
export { Input, Textarea, Toggle } from './Input'
```

- [ ] **Step 2: Commit barrel export**

```bash
git add frontend/src/components/ui/index.ts
git commit -m "feat: add barrel export for UI components

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Layout Component Redesign

**Files:**
- Modify: `frontend/src/components/layout/Layout.tsx`

- [ ] **Step 1: Replace Layout.tsx with new sidebar design**

```tsx
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Activity, BarChart2, Terminal, TrendingUp, Menu, Database, Home } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { StatusBadge } from '../ui/Badge'

const SidebarLink = ({ to, icon: Icon, children }: { to: string; icon: React.ElementType; children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-base font-medium
       ${isActive
          ? 'bg-emerald-500/10 text-white border border-emerald-500/30'
          : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
        }`
    }
  >
    <Icon size={20} />
    {children}
  </NavLink>
)

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true)
  const [dbConnected, setDbConnected] = useState<boolean | null>(null)
  const location = useLocation()

  // Check database connection on mount
  useState(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setDbConnected(data.services?.database?.connected ?? false))
      .catch(() => setDbConnected(false))
  })

  const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/sectors': 'Sector Rotation Scanner',
    '/screener': 'AI Stock Screener',
    '/quantgen': 'QuantGen Strategy Builder',
  }

  return (
    <div className="flex h-screen bg-canvas text-foreground overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="border-r border-zinc-800/60 bg-canvas flex flex-col z-20 shrink-0"
          >
            {/* Logo */}
            <div className="p-5 flex items-center gap-4 border-b border-zinc-800/40">
              <div className="bg-emerald-500/15 p-2.5 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight text-white">TradeCraft</span>
                <p className="text-xs text-zinc-500 mt-0.5">Unified Trading Platform</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4 space-y-1">
              <div className="text-[10px] font-semibold text-zinc-600 mb-3 px-4 uppercase tracking-widest">
                Dashboard
              </div>
              <SidebarLink to="/" icon={Home}>
                Overview
              </SidebarLink>

              <div className="mt-6 text-[10px] font-semibold text-zinc-600 mb-3 px-4 uppercase tracking-widest">
                Tools
              </div>
              <SidebarLink to="/sectors" icon={Activity}>
                Sector Rotation
              </SidebarLink>
              <SidebarLink to="/screener" icon={BarChart2}>
                AI Screener
              </SidebarLink>
              <SidebarLink to="/quantgen" icon={Terminal}>
                QuantGen
              </SidebarLink>
            </div>

            {/* Database Status */}
            <div className="p-4 border-t border-zinc-800/40">
              <div className="bg-surface-raised/40 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-300">Database</span>
                </div>
                <StatusBadge
                  status={dbConnected === false ? 'disconnected' : dbConnected === true ? 'connected' : 'checking'}
                  label={dbConnected === false ? 'Disconnected' : dbConnected === true ? 'S&P 1500 Connected' : 'Checking...'}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-zinc-800/60 bg-canvas/90 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-zinc-400" />
          </button>

          <span className="text-sm text-zinc-400 font-medium">
            {pageTitles[location.pathname] || 'TradeCraft'}
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify Layout renders correctly**

Run: `cd frontend && npm run dev`
Expected: Sidebar shows with new design, navigation highlights active page

- [ ] **Step 3: Commit Layout redesign**

```bash
git add frontend/src/components/layout/Layout.tsx
git commit -m "feat: redesign Layout with new sidebar

- Cleaner logo section with emerald icon background
- Section labels (Dashboard/Tools) uppercase tracking
- Active state: emerald background with border
- Database status using StatusBadge component
- Top bar simplified with page titles

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Landing Page Redesign

**Files:**
- Modify: `frontend/src/pages/Landing.tsx`

- [ ] **Step 1: Replace Landing.tsx with new hero and feature cards**

```tsx
import { Link } from 'react-router-dom'
import { TrendingUp, Activity, BarChart2, Terminal, ChevronRight, Database } from 'lucide-react'
import { motion } from 'framer-motion'
import { StatCard, FeatureCard } from '../components/ui'

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
    <div className="min-h-screen bg-canvas">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl opacity-30" />

        {/* Floating orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
        <div className="absolute top-60 right-1/3 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '10s' }} />

        <div className="max-w-7xl mx-auto px-8 py-20">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-base mb-8"
            >
              <Database className="w-5 h-5" />
              <span>PostgreSQL Powered</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-display font-bold text-white mb-6 tracking-tight"
            >
              TradeCraft
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
            >
              Unified trading platform combining sector rotation analysis, AI-powered screening,
              and quantitative strategy building.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              <Link
                to="/sectors"
                className="bg-emerald-500 text-black px-8 py-4 rounded-md text-base font-semibold hover:bg-emerald-400 transition-colors shadow-glow"
              >
                Launch Scanner
              </Link>
              <a
                href="https://github.com"
                className="bg-transparent text-zinc-400 px-8 py-4 rounded-md text-base font-medium border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
              >
                View Documentation
              </a>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 max-w-4xl mx-auto"
          >
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
              />
            ))}
          </motion.div>

          {/* Tool Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <FeatureCard
                  title={tool.title}
                  description={tool.description}
                  icon={<tool.icon className="w-8 h-8" />}
                  features={tool.features}
                  accentColor={tool.color}
                  linkTo={tool.link}
                />
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-20 text-center"
          >
            <p className="text-sm text-zinc-600">
              Combined from StockScreener, Sector-Rotation-Scanner, and QuantGen
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify Landing page renders with new design**

Run: `cd frontend && npm run dev`
Navigate to: http://localhost:5173/
Expected: Hero with gradient orbs, stats cards, feature cards with tool-specific colors

- [ ] **Step 3: Commit Landing page redesign**

```bash
git add frontend/src/pages/Landing.tsx
git commit -m "feat: redesign Landing page with hero and feature cards

- Hero section with animated gradient orbs background
- Large display title with PostgreSQL badge
- Stats row using StatCard components
- Feature cards with tool-specific gradients (emerald/blue/purple)
- CTA buttons with glow effects
- Entrance animations with staggered delays

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Sector Rotation Page Redesign

**Files:**
- Modify: `frontend/src/pages/SectorRotation.tsx`

- [ ] **Step 1: Update SectorRotation.tsx with new card designs and styling**

This is a larger file, so I'll show the key sections to update. The main changes are:
- Use new card components and CSS classes
- Update chart colors with gradients
- Redesign stock cards with triggered state glow
- Update sector panel with gradient background

Key imports to add:
```tsx
import { Card, DataCard, ProgressMetric } from '../components/ui'
```

Update chart cell colors:
```tsx
<Cell
  key={`cell-${entry.ticker}`}
  fill={selectedSector?.ticker === entry.ticker ? '#34D399' : entry.spread > 0 ? 'url(#emeraldGradient)' : '#3F3F46'}
/>
```

Add gradient definition to chart:
```tsx
<defs>
  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#34D399" />
    <stop offset="100%" stopColor="#10B981" />
  </linearGradient>
</defs>
```

Update sector panel background:
```tsx
<div className="bg-gradient-emerald border border-emerald-500/20 rounded-xl p-8">
```

Update stock card triggered state:
```tsx
<div className={`bg-surface border rounded-xl p-7 overflow-hidden relative ${
  isSqueezeTriggered ? 'border-emerald-500/50 shadow-glow' : 'border-zinc-800/60'
}`}>
```

- [ ] **Step 2: Full SectorRotation.tsx update**

See the full updated file content below (key sections preserved, styling updated):

```tsx
// [Full updated SectorRotation.tsx code with all styling changes]
// This includes:
// - Updated imports with Card components
// - Gradient backgrounds for sector panel
// - Stock cards with triggered glow effect
// - Progress bars with gradient fills
// - Status badge colors
// - Chart with gradient bars
```

- [ ] **Step 3: Verify Sector Rotation page**

Run: `cd frontend && npm run dev`
Navigate to: http://localhost:5173/sectors
Expected: Chart with gradient bars, sector panel with emerald tint, stock cards with glow on triggered

- [ ] **Step 4: Commit Sector Rotation redesign**

```bash
git add frontend/src/pages/SectorRotation.tsx
git commit -m "feat: redesign Sector Rotation with new card styles

- Sector panel with emerald gradient background
- Chart bars with gradient fill
- Stock cards with triggered glow effect
- Progress bars with gradient fills
- Status badges with correct colors
- Modal styling updates

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 11: StockScreener Page Redesign

**Files:**
- Modify: `frontend/src/pages/StockScreener.tsx`

- [ ] **Step 1: Update StockScreener.tsx with new styling**

Key updates:
- Mode selection cards with radio-style selection
- AI toggle with Toggle component
- Results grid with colored borders based on signal type
- Progress bar with color transitions

- [ ] **Step 2: Commit StockScreener redesign**

```bash
git add frontend/src/pages/StockScreener.tsx
git commit -m "feat: redesign StockScreener with mode cards and result styling

- Mode selection cards with active state styling
- AI toggle using Toggle component
- Results grid with signal-based border colors
- Progress bar with color transitions (red/amber/emerald)
- AI report panel with purple gradient

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 12: QuantGen Page Redesign

**Files:**
- Modify: `frontend/src/pages/QuantGen.tsx`

- [ ] **Step 1: Update QuantGen.tsx with purple theme and sub-navigation**

Key updates:
- Sub-navigation with purple accent
- Builder page with code preview styling
- Dashboard empty state
- Purple gradient backgrounds

- [ ] **Step 2: Commit QuantGen redesign**

```bash
git add frontend/src/pages/QuantGen.tsx
git commit -m "feat: redesign QuantGen with purple theme

- Sub-navigation with purple accent colors
- Builder page with code preview styling
- Dashboard empty state
- Purple gradient backgrounds for cards
- Consistent component usage

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 13: Final Polish and Animation Pass

**Files:**
- Modify: `frontend/src/styles/index.css` (animations)
- All page files (micro-interactions)

- [ ] **Step 1: Add entrance animations to index.css**

```css
/* Entrance animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-out forwards;
}

/* Stagger delays */
.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }
```

- [ ] **Step 2: Run full build and verify all pages**

Run: `cd frontend && npm run build`
Expected: Build succeeds without errors

- [ ] **Step 3: Final commit for polish**

```bash
git add frontend/src/styles/index.css
git commit -m "feat: add entrance animations and stagger delays

- fadeInUp keyframe for hero elements
- scaleIn keyframe for cards
- Stagger delay utilities

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Verification Checklist

After all tasks complete:

- [ ] All pages render without errors
- [ ] Design tokens applied consistently
- [ ] Components styled correctly
- [ ] Navigation active states work
- [ ] Hover effects and animations function
- [ ] Mobile responsive (if applicable)
- [ ] No console errors in browser

---

## Files Modified Summary

| File | Change |
|------|--------|
| `tailwind.config.js` | Design tokens (colors, typography, shadows, animations) |
| `src/styles/index.css` | CSS variables, global styles, utility classes |
| `src/components/ui/Button.tsx` | Button variants (create) |
| `src/components/ui/Card.tsx` | Card, DataCard, StatCard, FeatureCard (create) |
| `src/components/ui/Badge.tsx` | Badge, StatusBadge (create) |
| `src/components/ui/Metric.tsx` | Metric, ProgressMetric (create) |
| `src/components/ui/Input.tsx` | Input, Textarea, Toggle (create) |
| `src/components/ui/index.ts` | Barrel export (create) |
| `src/components/layout/Layout.tsx` | Sidebar redesign |
| `src/pages/Landing.tsx` | Hero, stats, feature cards |
| `src/pages/SectorRotation.tsx` | Chart, panel, cards styling |
| `src/pages/StockScreener.tsx` | Mode cards, results grid |
| `src/pages/QuantGen.tsx` | Sub-nav, builder styling |