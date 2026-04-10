# TradeCraft

Unified trading platform combining three powerful tools:

1. **Sector Rotation Scanner** - Analyze sector ETF momentum and find leading stocks
2. **AI Stock Screener** - Multi-agent technical and fundamental stock screening
3. **QuantGen Strategy Builder** - AI-powered quantitative strategy generation with VectorBT

## Architecture

```
TradeCraft/
├── frontend/          # React + TypeScript + Tailwind CSS
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Landing, SectorRotation, StockScreener, QuantGen
│       └── styles/        # Global styles
├── backend/           # FastAPI Python backend
│   └── app/
│       ├── routers/      # API endpoints
│       ├── services/     # Business logic
│       ├── models/       # Pydantic models
│       └── db/           # Database connection
└── shared/            # Shared utilities
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Data**: S&P 1500 historical OHLCV data (PostgreSQL)
- **AI**: Agno agents with Ollama, OpenAI for strategy generation

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL with `sp1500_1d` database
- Environment variables:
  - `DB_USER` (default: postgres)
  - `DB_PASSWORD`
  - `DB_HOST` (default: 127.0.0.1)
  - `DB_PORT` (default: 5431)
  - `DB_NAME` (default: sp1500_1d)

## Setup

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m app.main
# or
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## API Endpoints

### Health
- `GET /api/health` - Health check with database status
- `GET /api/db-status` - Database connection status

### Sector Rotation
- `GET /api/sectors` - Get sector ETF performance data
- `GET /api/stocks/:sector` - Get top stocks in a sector

### AI Screener
- `POST /api/screener/scan` - Start AI screening scan
- `GET /api/screener/status/:scan_id` - Get scan status
- `GET /api/screener/results/:scan_id` - Get scan results

### QuantGen
- `POST /api/generate` - Generate strategy code
- `POST /api/run` - Run backtest
- `POST /api/optimize` - Optimize parameters
- `GET /api/strategies` - List saved strategies

## Original Projects

This unified platform combines code from:

1. **StockScreener_2** - Multi-agent AI stock screener with Agno/Ollama
2. **Sector-Rotation-Scanner** - React/TypeScript sector analysis dashboard
3. **QuantGen** - FastAPI/React quantitative strategy builder with VectorBT

## License

MIT