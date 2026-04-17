import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
}

export function ThemeToggle({ className = '', size = 'md', variant = 'default' }: ThemeToggleProps) {
  const { isDarkMode, toggleTheme } = useTheme()

  const sizeClasses = {
    sm: { button: 'p-2', icon: 16 },
    md: { button: 'p-2.5', icon: 20 },
    lg: { button: 'p-3', icon: 24 },
  }

  const variantClasses = {
    default: isDarkMode
      ? 'bg-white/10 hover:bg-white/20 text-white'
      : 'bg-black/10 hover:bg-black/20 text-black',
    ghost: isDarkMode
      ? 'hover:bg-white/10 text-white/80 hover:text-white'
      : 'hover:bg-black/10 text-black/80 hover:text-black',
    outline: isDarkMode
      ? 'border border-white/20 hover:border-white/40 text-white hover:bg-white/10'
      : 'border border-black/20 hover:border-black/40 text-black hover:bg-black/10',
  }

  const baseClasses = `
    rounded-xl
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    ${isDarkMode ? 'focus:ring-emerald-500 focus:ring-offset-black' : 'focus:ring-blue-500 focus:ring-offset-white'}
    ${sizeClasses[size].button}
    ${variantClasses[variant]}
    ${className}
  `

  return (
    <button
      onClick={toggleTheme}
      className={baseClasses}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon with rotation */}
        <Sun
          size={sizeClasses[size].icon}
          className={`
            absolute inset-0 m-auto
            transition-all duration-300 ease-out
            ${isDarkMode ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}
          `}
        />
        {/* Moon Icon with rotation */}
        <Moon
          size={sizeClasses[size].icon}
          className={`
            absolute inset-0 m-auto
            transition-all duration-300 ease-out
            ${isDarkMode ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}
          `}
        />
      </div>
    </button>
  )
}
