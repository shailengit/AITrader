import { Outlet, useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/sectors': 'Sector Rotation Scanner',
  '/screener': 'AI Stock Screener',
  '/quantgen': 'QuantGen Strategy Builder',
}

export default function Layout() {
  const location = useLocation()
  const isSectorPage = location.pathname === '/sectors'

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#0a0c10',
      color: '#FAFAFA',
      overflow: 'hidden'
    }}>
      {/* Top Bar */}
      <header style={{
        height: isSectorPage ? 120 : 64,
        borderBottom: '1px solid #21262d',
        backgroundColor: '#0d1117',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
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
              color: '#FAFAFA',
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              {pageTitles[location.pathname] || 'TradeCraft'}
            </h1>
            {isSectorPage && (
              <p style={{
                fontSize: '16px',
                color: '#6e7681',
                margin: '4px 0 0 0',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Identify momentum and rotation patterns
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#0a0c10' }}>
        <Outlet />
      </main>
    </div>
  )
}
