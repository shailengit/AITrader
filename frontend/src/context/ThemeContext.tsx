import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
  setDarkMode: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const STORAGE_KEY = 'tradecraft-theme-preference'

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true // Default to dark on server

    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      return stored === 'dark'
    }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement

    if (isDarkMode) {
      root.classList.remove('apple-light-theme')
    } else {
      root.classList.add('apple-light-theme')
    }

    // Store preference
    localStorage.setItem(STORAGE_KEY, isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a preference
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setIsDarkMode(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => setIsDarkMode(prev => !prev)
  const setDarkMode = (value: boolean) => setIsDarkMode(value)

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
