# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeCraft is a unified trading platform combining three tools:
1. **Sector Rotation Scanner** - Analyze sector ETF momentum and find leading stocks
2. **AI Stock Screener** - Multi-agent technical and fundamental stock screening
3. **QuantGen Strategy Builder** - AI-powered quantitative strategy generation with VectorBT

## Architecture

```
TradeCraft/
├── backend/                 # FastAPI Python backend
│   ├── app/
│   │   ├── main.py          # FastAPI entry point with CORS, security headers
│   │   ├── routers/         # API endpoints
│   │   │   ├── sectors.py    # Sector rotation: /api/sectors, /api/stocks/:sector
│   │   │   ├── screener.py  # AI screener: /api/screener/scan, /api/screener/status/:id
│   │   │   ├── quantgen.py  # Strategy builder: /api/generate, /api/run, /api/optimize
│   │   │   └── health.py     # Health check: /api/health, /api/db-status
│   │   ├── services/        # Business logic
│   │   │   ├── agno_screener.py  # Multi-agent AI screener (Dormant Giant, Quant Strategy)
│   │   │   └── data_service.py  # PostgreSQL data access (replaces yfinance)
│   │   └── db/
│   │       └── database.py  # SQLAlchemy connection pool, sector ETF mappings
│   └── requirements.txt
├── frontend/                # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── App.tsx          # React Router with tabs
│   │   ├── components/layout/Layout.tsx  # Sidebar navigation
│   │   ├── pages/
│   │   │   ├── Landing.tsx        # Dashboard with three app cards
│   │   │   ├── SectorRotation.tsx # Sector ETF analysis with Recharts
│   │   │   ├── StockScreener.tsx  # AI screener with mode selection
│   │   │   └── QuantGen.tsx       # Strategy builder with Monaco Editor
│   │   └── styles/index.css # Tailwind + dark theme CSS variables
│   ├── vite.config.ts       # Vite with API proxy to FastAPI
│   └── package.json
└── README.md
```

## Commands

### Backend (from `backend/` directory)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
python -m app.main
# or
uvicorn app.main:app --reload --port 8000
```

### Frontend (from `frontend/` directory)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Database

PostgreSQL database `sp1500_1d` must be running with:
- Individual stock tables (e.g., `aapl`, `msft`) with columns: `Date`, `Open`, `High`, `Low`, `Close`, `Volume`
- `stock_metadata` table with sector info
- `stock_financials_quarterly` table with EPS data

Environment variables (defaults in `database.py`):
- `DB_USER` (default: postgres)
- `DB_PASSWORD` (default: sarina00)
- `DB_HOST` (default: 127.0.0.1)
- `DB_PORT` (default: 5431)
- `DB_NAME` (default: sp1500_1d)

## Key Patterns

### AI Screener Modes

Two screening modes with optional AI multi-agent analysis:

1. **Dormant Giant** (`dormant_giant`): Bollinger squeeze + OBV accumulation + EPS acceleration
2. **Quant Strategy** (`quant_strategy`): TA indicators + fundamental health + optional backtesting

Set `use_ai=true` for Agno multi-agent team analysis with natural language reports.

### Database Access Pattern

```python
from app.db import database

# Use the connection pool
with database.engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM table"))
```

### Frontend API Calls

Frontend proxies `/api/*` to backend via Vite config. Use relative paths:

```typescript
const res = await fetch('/api/sectors')
```

## Original Repositories

This unified platform combines code from:
- **StockScreener_2** - Multi-agent AI stock screener with Agno/Ollama
- **Sector-Rotation-Scanner** - React/TypeScript sector analysis dashboard
- **QuantGen** - FastAPI/React quantitative strategy builder with VectorBT

## Design System Rules
- Max content width: 1280px, centered with auto margins
- Base spacing unit: 8px (use multiples: 8, 16, 24, 32, 48, 64)
- Typography scale: 14/16/18/20/24/32/40/48px
- Grid: 12-column, 24px gutters
- Never use raw pixel values — use spacing tokens or Tailwind classes only
- All pages must look intentional at 1440px+ (no orphaned whitespace)

## Frontend Requirements
- Target display: MacBook Pro 16" with 4K display (3456×2234 native, 
- typically rendered at 1728×1117 in the browser at 2x DPR).
- Design for 1440px–1728px as the primary breakpoint.
- Use shadcn/ui components exclusively. Do not invent custom components when a shadcn equivalent exists.

## UI/UX Standards
- Framework: React + Tailwind CSS + shadcn/ui
- Target viewport: 1440px–1728px primary, must also work at 768px and 1280px
- Content max-width: 1280px centered
- Spacing: 8px base unit, Tailwind spacing scale only (no arbitrary values)
- Layout: CSS Grid preferred over flexbox for page-level layouts
- No layout should have unintentional empty space at 1440px+
- Sidebar widths: 240px (nav), 320px (contextual panels)
- All modals/dialogs: max-width 560px or 720px, never full-width

## Component rules
- Use shadcn/ui before building custom components
- Cards: always use consistent padding (p-6), border-radius (rounded-xl)
- Forms: max-width 480px unless explicitly a wide layout
- Tables: always implement horizontal scroll on mobile

## Troubleshooting Learnings (April 2026)

### Tailwind Spacing Classes Not Applied

**Problem:** Tailwind spacing utilities (`mb-8`, `gap-12`, `py-24`, etc.) were not being applied to components even though:
- TypeScript compilation succeeded
- Dev server was running
- File changes were being detected (extreme visual indicators like red borders worked)

**Root Cause:** Unknown - possibly Tailwind v4 + Vite integration issue where certain classes get tree-shaken or not processed correctly in development mode.

**Solution:** Use inline styles for spacing when Tailwind classes fail:
```tsx
// Instead of:
<div className="mb-24">

// Use:
<div style={{ marginBottom: '96px' }}>
```

**Verification Method:**
1. Add extreme visual indicators (red border, blue background) to verify code changes are being served
2. If indicators appear but Tailwind classes don't → use inline styles
3. Check browser DevTools computed styles to confirm what's actually applied

**Lesson:** When spacing/layout changes don't appear despite correct code:
- Don't assume the code is wrong
- Verify the file is actually being served (extreme test styles)
- Fall back to inline styles for reliable spacing
- This project's Tailwind v4 setup has quirks with spacing utilities in dev mode
