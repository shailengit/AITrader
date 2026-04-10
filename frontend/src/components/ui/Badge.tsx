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