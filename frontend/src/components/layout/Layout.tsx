import { Outlet, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useTheme } from '../../context/ThemeContext'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/sectors': 'Sector Rotation Scanner',
  '/screener': 'AI Stock Screener',
  '/quantgen': 'QuantGen Strategy Builder',
}

export default function Layout() {
  const location = useLocation()
  const isSectorPage = location.pathname === '/sectors'
  const { isDarkMode } = useTheme()

  // Theme-aware colors
  const colors = {
    bg: isDarkMode ? '#0a0c10' : '#f5f5f7',
    headerBg: isDarkMode ? '#0d1117' : '#ffffff',
    text: isDarkMode ? '#FAFAFA' : '#1d1d1f',
    muted: isDarkMode ? '#6e7681' : '#6e6e73',
    border: isDarkMode ? '#21262d' : '#d2d2d7',
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: colors.bg,
      color: colors.text,
      overflow: 'hidden',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Top Bar */}
      <header style={{
        height: isSectorPage ? 120 : 64,
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: colors.headerBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        flexShrink: 0,
        padding: '0 24px',
        transition: 'background-color 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flex: 1,
          justifyContent: 'center'
        }}>
          {/* Logo Icon */}
          <div style={{
            width: isSectorPage ? 64 : 36,
            height: isSectorPage ? 64 : 36,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <svg width={isSectorPage ? 36 : 20} height={isSectorPage ? 36 : 20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 12h18M12 3v18"/>
            </svg>
          </div>

          {/* Title */}
          <div>
            <h1 style={{
              fontSize: isSectorPage ? '48px' : '18px',
              fontWeight: 700,
              color: colors.text,
              letterSpacing: '-0.02em',
              margin: 0,
              transition: 'color 0.3s ease'
            }}>
              {pageTitles[location.pathname] || 'TradeCraft'}
            </h1>
            {isSectorPage && (
              <p style={{
                fontSize: '16px',
                color: colors.muted,
                margin: '4px 0 0 0',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.3s ease'
              }}>
                Identify momentum and rotation patterns
              </p>
            )}
          </div>
        </div>

        {/* Theme Toggle */}
        <div style={{ marginLeft: 'auto' }}>
          <ThemeToggle variant="ghost" size="md" />
        </div>
      </header>

      {/* Page Content */}
      <main style={{ flex: 1, overflow: 'auto', backgroundColor: colors.bg, transition: 'background-color 0.3s ease' }}>
        <Outlet />
      </main>
    </div>
  )
}
