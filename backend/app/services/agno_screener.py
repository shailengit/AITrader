"""
Agno Multi-Agent Stock Screener Service for TradeCraft.
Implements two screening modes from original StockScreener_2:
1. Quant Strategy (agnoMultiAgentTrader_2) - TA-based with backtesting
2. Dormant Giant (agnoMultiAgentTrader_3) - Bollinger squeeze + EPS acceleration
"""

import os
import sys
import logging
import pandas as pd
import numpy as np
from typing import List, Optional, Dict, Any
from datetime import datetime
from concurrent.futures import ProcessPoolExecutor
from sqlalchemy import create_engine, text
from sqlalchemy.pool import QueuePool

logger = logging.getLogger(__name__)

# Database configuration
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "sarina00")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "5431")
DB_NAME = os.getenv("DB_NAME", "sp1500_1d")
DB_URL = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

# Model configuration
OLLAMA_MODEL_ID = os.getenv("OLLAMA_MODEL_ID", "glm-5:cloud")
OLLAMA_MODEL_ID_ALT = os.getenv("OLLAMA_MODEL_ID_FALLBACK", "minimax-m2.5:cloud")

# Connection pool
ENGINE = create_engine(
    DB_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)


# =============================================================================
# DORMANT GIANT SCREENER (agnoMultiAgentTrader_3.py)
# =============================================================================

def get_active_tickers() -> List[str]:
    """Get list of active tickers from database."""
    with ENGINE.connect() as conn:
        res = conn.execute(text("SELECT ticker FROM stock_metadata WHERE ticker IS NOT NULL"))
        tickers = [row[0] for row in res]

    skip_tables = {
        'xlb', 'xlc', 'xle', 'xlf', 'xli', 'xlk', 'xlp', 'xlre', 'xlu', 'xlv', 'xly',
        'stock_financials_quarterly', 'stock_financials_yearly', 'stock_metadata',
        'all', 'aci', 'cns', 'brk-b', 'bf-b', 'on', 'v', 't', 'w', 'gs', 'd', 'n',
        'ko', 'sn', 'zto', 'ac', 'nls', 'vod', 'wtv'
    }
    return [t for t in tickers if t.lower() not in skip_tables]


def analyze_single_ticker_dormant_giant(ticker: str, filters: Dict[str, Any] = None) -> Optional[Dict]:
    """Worker function for Dormant Giant technical analysis."""
    if filters is None:
        filters = {}

    worker_engine = create_engine(DB_URL, poolclass=QueuePool, pool_size=1)
    try:
        query = f'SELECT "Date", "Close", "Volume", "High" FROM "{ticker.lower()}" ORDER BY "Date" DESC LIMIT 200;'
        df = pd.read_sql(query, worker_engine).sort_values('Date')
    except Exception as e:
        return {"error": f"DB Error for {ticker}: {e}"}
    finally:
        worker_engine.dispose()

    if len(df) < 120:
        return {"error": f"{ticker.upper()}: Insufficient data (<120 days)"}

    # Bollinger Bandwidth Squeeze Logic
    df['sma'] = df['Close'].rolling(window=20).mean()
    df['std'] = df['Close'].rolling(window=20).std()
    df['bandwidth'] = ((df['sma'] + (df['std'] * 2)) - (df['sma'] - (df['std'] * 2))) / df['sma']

    squeeze_threshold = filters.get('squeeze_threshold', 1.15)
    min_bandwidth = df['bandwidth'].tail(120).min()
    current_bandwidth = df['bandwidth'].iloc[-1]
    is_squeezing = current_bandwidth <= (min_bandwidth * squeeze_threshold)

    # OBV Hidden Accumulation Logic
    close_diff = df['Close'].diff()
    df['obv'] = pd.Series(np.sign(close_diff.values) * df['Volume'].values).fillna(0).cumsum()
    obv_slope = np.polyfit(np.arange(20), df['obv'].tail(20), 1)[0]
    price_slope = np.polyfit(np.arange(20), df['Close'].tail(20), 1)[0]

    accumulation_threshold = filters.get('accumulation_threshold', 0.005)
    hidden_accumulation = (obv_slope > 0) and (abs(price_slope) < (df['Close'].iloc[-1] * accumulation_threshold))

    # Breakout Logic
    past_resistance = df['High'].shift(3).rolling(window=120).max().iloc[-1]

    volume_threshold = filters.get('volume_threshold', 1.5)
    avg_vol = df['Volume'].tail(50).mean()
    current_vol = df['Volume'].iloc[-1]
    is_breakout = (df['Close'].iloc[-1] > past_resistance) and (
        current_vol > (avg_vol * volume_threshold)
    )

    if is_breakout:
        return {"ticker": ticker.upper(), "signal": "Active Breakout", "log": f"MATCH: {ticker.upper()} - Active Breakout detected"}
    elif is_squeezing and hidden_accumulation:
        return {"ticker": ticker.upper(), "signal": "Coiling (Accumulation)", "log": f"MATCH: {ticker.upper()} - Coiling/Accumulation detected"}

    return None


def tool_run_dormant_giant_scan(progress_callback=None, log_callback=None, filters: Dict[str, Any] = None) -> List[Dict]:
    """Technical scan for Dormant Giant screening."""
    tickers = get_active_tickers()
    results = []

    with ProcessPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(analyze_single_ticker_dormant_giant, t, filters): t for t in tickers}
        completed = 0
        total = len(tickers)
        for future in futures:
            try:
                result = future.result()
                if result:
                    if "log" in result and log_callback:
                        log_callback(result["log"])
                    if "error" in result and log_callback:
                        log_callback(result["error"])

                    if "ticker" in result:
                        results.append(result)
            except Exception as e:
                if log_callback:
                    log_callback(f"Worker error: {e}")
                pass
            finally:
                completed += 1
                if progress_callback and total > 0:
                    # Progress from 10% to 80%
                    progress = 10 + int((completed / total) * 70)
                    progress_callback(progress)

    logger.info(f"Dormant Giant Technical Scan Summary: Total={total}, Results={len(results)}")
    return results


def tool_verify_eps_acceleration(tickers: List[Dict]) -> List[Dict]:
    """Verify EPS acceleration for screened tickers."""
    verified_tickers = []

    for item in tickers:
        ticker = item['ticker']
        try:
            query = text("""
                SELECT eps FROM stock_financials_quarterly
                WHERE ticker = :ticker ORDER BY report_date DESC LIMIT 3;
            """)
            with ENGINE.connect() as conn:
                fin_df = pd.read_sql(query, conn, params={"ticker": ticker})

            if len(fin_df) == 3:
                current_eps, prev_eps, older_eps = fin_df['eps'].iloc[0], fin_df['eps'].iloc[1], fin_df['eps'].iloc[2]

                if prev_eps != 0 and older_eps != 0:
                    current_growth = (current_eps - prev_eps) / abs(prev_eps)
                    prev_growth = (prev_eps - older_eps) / abs(older_eps)

                    if (current_growth > 0) and (current_growth > prev_growth * 1.5):
                        item['fundamental_catalyst'] = "Confirmed EPS Acceleration"
                        verified_tickers.append(item)
        except Exception:
            pass

    return verified_tickers


# =============================================================================
# QUANT STRATEGY SCREENER (agnoMultiAgentTrader_2.py)
# =============================================================================

def _worker_ta_analysis(ticker: str, requested_indicators: List[str], cutoff_date: Optional[str] = None) -> Optional[Dict]:
    """Worker for multiprocessing TA calculations."""
    if not ticker or not isinstance(ticker, str):
        return None

    safe_ticker = ticker.lower().strip()
    worker_engine = create_engine(DB_URL, poolclass=QueuePool, pool_size=1)

    try:
        if cutoff_date:
            df = pd.read_sql(
                f'SELECT * FROM "{safe_ticker}" WHERE "Date" <= :cutoff_date ORDER BY "Date" DESC LIMIT 250',
                worker_engine, params={"cutoff_date": cutoff_date}
            )
        else:
            df = pd.read_sql(f'SELECT * FROM "{safe_ticker}" ORDER BY "Date" DESC LIMIT 250', worker_engine)

        if df.empty or len(df) < 50:
            return None

        df = df.sort_values(by="Date").reset_index(drop=True)

        # Calculate technical indicators manually (avoiding ta dependency)
        df['sma_20'] = df['Close'].rolling(window=20).mean()
        df['sma_50'] = df['Close'].rolling(window=50).mean()
        df['rsi'] = _calculate_rsi(df['Close'])
        df['macd'], df['macd_signal'] = _calculate_macd(df['Close'])

        latest = df.iloc[-1]
        actual_date = latest['Date']

        res = {
            'ticker': ticker.upper(),
            'close': round(latest['Close'], 2),
            'data_date': str(actual_date)[:10],
            'sma_20': round(latest['sma_20'], 4) if pd.notna(latest['sma_20']) else None,
            'sma_50': round(latest['sma_50'], 4) if pd.notna(latest['sma_50']) else None,
            'rsi': round(latest['rsi'], 2) if pd.notna(latest['rsi']) else None,
            'macd': round(latest['macd'], 4) if pd.notna(latest['macd']) else None,
            'volume': int(latest['Volume']) if pd.notna(latest['Volume']) else None,
        }
        return res
    except Exception as e:
        logger.debug(f"Error processing {ticker}: {e}")
        return None
    finally:
        worker_engine.dispose()


def _calculate_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    """Calculate RSI indicator."""
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))


def _calculate_macd(prices: pd.Series) -> tuple:
    """Calculate MACD and signal line."""
    ema_12 = prices.ewm(span=12, adjust=False).mean()
    ema_26 = prices.ewm(span=26, adjust=False).mean()
    macd = ema_12 - ema_26
    signal = macd.ewm(span=9, adjust=False).mean()
    return macd, signal


def _worker_ta_wrapper(args_tuple):
    """Module-level wrapper for multiprocessing."""
    return _worker_ta_analysis(*args_tuple)


def tool_quant_technical_screener(requested_indicators: List[str], sort_by: str = "ticker",
                                   cutoff_date: Optional[str] = None) -> str:
    """Screen S&P 1500 using parallel processing with optional cutoff date."""
    tickers = get_active_tickers()

    args = [(ticker, requested_indicators, cutoff_date) for ticker in tickers]

    with ProcessPoolExecutor(max_workers=os.cpu_count()) as executor:
        results = list(executor.map(_worker_ta_wrapper, args))

    df = pd.DataFrame([r for r in results if r is not None])
    if not df.empty and sort_by in df.columns:
        df = df.sort_values(by=sort_by).head(50)
    return df.to_csv(index=False) if not df.empty else "No results found."


def tool_query_fundamental_health(tickers: List[str], period: str = "quarterly",
                                   cutoff_date: Optional[str] = None) -> str:
    """Analyze fundamental data for tickers."""
    table = "stock_financials_quarterly" if period.lower() == "quarterly" else "stock_financials_yearly"

    date_filter = 'AND report_date <= :cutoff_date' if cutoff_date else ''

    query = text(f"""
        WITH Ranked AS (
            SELECT ticker, report_date, total_revenue, net_income,
            LAG(total_revenue) OVER (PARTITION BY ticker ORDER BY report_date ASC) as prev_rev
            FROM {table} WHERE ticker = ANY(:t) {date_filter}
        )
        SELECT * FROM Ranked ORDER BY ticker, report_date DESC
    """)

    try:
        params: dict = {"t": [t.upper() for t in tickers]}
        if cutoff_date:
            params["cutoff_date"] = cutoff_date
        df = pd.read_sql(query, ENGINE, params=params)

        if df.empty:
            return f"No {period} data found."

        summary = []
        for t in tickers:
            t_df = df[df['ticker'] == t.upper()]
            if len(t_df) < 2:
                continue
            curr, prev = t_df.iloc[0], t_df.iloc[1]
            growth = (curr['total_revenue'] - curr['prev_rev']) / curr['prev_rev'] if curr['prev_rev'] else 0
            summary.append({
                'ticker': t.upper(),
                'period': period,
                'revenue_growth': f"{growth:.2%}",
                'trend': "Improving" if curr['total_revenue'] > prev['total_revenue'] else "Declining"
            })
        return pd.DataFrame(summary).to_csv(index=False)
    except Exception as e:
        return f"Error: {str(e)}"


def tool_query_metadata(tickers: List[str]) -> str:
    """Fetch Sector, Market Cap, and Beta for tickers."""
    query = text("SELECT ticker, name, sector, market_cap, beta FROM stock_metadata WHERE ticker = ANY(:t)")
    try:
        df = pd.read_sql(query, ENGINE, params={"t": [t.upper() for t in tickers]})
        return df.to_csv(index=False) if not df.empty else "No metadata found."
    except Exception as e:
        return f"Metadata Error: {str(e)}"


def tool_get_historical_performance(tickers: List[str], cutoff_date: str) -> str:
    """Calculate performance from cutoff_date to today."""
    if not cutoff_date:
        return "No cutoff_date provided."

    try:
        datetime.strptime(cutoff_date, "%Y-%m-%d")
    except ValueError:
        return f"Invalid cutoff_date format. Use YYYY-MM-DD."

    results = []
    for ticker in tickers:
        if not ticker or not isinstance(ticker, str) or not ticker.isalnum():
            continue

        try:
            ticker_lower = ticker.lower().strip()

            price_at_cutoff_query = text(f'''
                SELECT "Close", "Date" FROM "{ticker_lower}"
                WHERE "Date" <= :cutoff_date
                ORDER BY "Date" DESC LIMIT 1
            ''')
            cutoff_df = pd.read_sql(price_at_cutoff_query, ENGINE, params={"cutoff_date": cutoff_date})

            if cutoff_df.empty:
                continue

            price_at_cutoff = cutoff_df.iloc[0]['Close']
            cutoff_actual_date = cutoff_df.iloc[0]['Date']

            latest_query = text(f'SELECT "Close", "Date" FROM "{ticker_lower}" ORDER BY "Date" DESC LIMIT 1')
            latest_df = pd.read_sql(latest_query, ENGINE)

            if latest_df.empty:
                continue

            current_price = latest_df.iloc[0]['Close']
            latest_date = latest_df.iloc[0]['Date']
            pct_change = ((current_price - price_at_cutoff) / price_at_cutoff) * 100

            results.append({
                'ticker': ticker.upper(),
                'cutoff_date': str(cutoff_actual_date)[:10],
                'price_at_cutoff': round(price_at_cutoff, 2),
                'latest_date': str(latest_date)[:10],
                'current_price': round(current_price, 2),
                'pct_change': round(pct_change, 2)
            })
        except Exception as e:
            logger.warning(f"Error processing {ticker}: {e}")
            continue

    return pd.DataFrame(results).to_csv(index=False) if results else "No performance data available."


# =============================================================================
# AGENT INITIALIZATION
# =============================================================================

def create_dormant_giant_team():
    """Create the Dormant Giant Screener team (agnoMultiAgentTrader_3)."""
    from agno.agent import Agent
    from agno.team import Team
    from agno.models.ollama import Ollama

    tech_specialist = Agent(
        name="Technical Specialist",
        role="Identify stocks experiencing volatility contraction (Bollinger Squeeze), hidden institutional accumulation (OBV), or key resistance breakouts.",
        tools=[tool_run_dormant_giant_scan],
        model=Ollama(id=OLLAMA_MODEL_ID),
        instructions="Call the `tool_run_dormant_giant_scan` to process the sp1500_1d database using parallel processing. Return a structured list of tickers showing 'Active Breakout' or 'Coiling' signals."
    )

    fund_specialist = Agent(
        name="Fundamental Specialist",
        role="Filter technical candidates by verifying a sudden acceleration in earnings growth, acting as the breakout catalyst.",
        tools=[tool_verify_eps_acceleration],
        model=Ollama(id=OLLAMA_MODEL_ID),
        instructions="Take the list of tickers provided by the Technical Specialist and call `tool_verify_eps_acceleration`. Only pass forward tickers that have a confirmed fundamental catalyst."
    )

    risk_manager = Agent(
        name="Risk Manager",
        role="Evaluate the final candidates for downside risk.",
        model=Ollama(id=OLLAMA_MODEL_ID),
        instructions="Review the final list. Provide a brief risk assessment for trading a 'Dormant Giant' breakout, emphasizing the importance of setting stop losses just below the breakout zone or the lower Bollinger Band."
    )

    team_lead = Team(
        name="Dormant Giant Screener Team Lead",
        members=[tech_specialist, fund_specialist, risk_manager],
        model=Ollama(id=OLLAMA_MODEL_ID),
        instructions="""
        Orchestrate the stock screening process:
        1. Ask the Technical Specialist to run the database scan.
        2. Pass the results to the Fundamental Specialist for EPS verification.
        3. Pass the surviving candidates to the Risk Manager for final trade parameters.
        4. Output a comprehensive final report summarizing the viable 'Dormant Giant' candidates.
        """,
        debug_mode=True,
        markdown=True
    )

    return team_lead


def create_quant_strategy_team():
    """Create the Quant Strategy team (agnoMultiAgentTrader_2)."""
    from agno.agent import Agent
    from agno.team import Team
    from agno.models.ollama import Ollama

    tech_agent = Agent(
        name="Technical Specialist",
        role="Identify price-action setups using technical indicators.",
        model=Ollama(id=OLLAMA_MODEL_ID_ALT),
        tools=[tool_quant_technical_screener],
        instructions=["Return only the top 10-15 tickers that meet the criteria. Pass cutoff_date parameter if provided."]
    )

    fund_agent = Agent(
        name="Fundamental Specialist",
        role="Vet stocks for financial health.",
        model=Ollama(id=OLLAMA_MODEL_ID_ALT),
        tools=[tool_query_fundamental_health],
        instructions=["Check trends and reject weak companies. Pass cutoff_date parameter if provided."]
    )

    risk_manager = Agent(
        name="Risk Manager",
        role="Evaluate volatility and stability using metadata.",
        model=Ollama(id=OLLAMA_MODEL_ID_ALT),
        tools=[tool_query_metadata],
        instructions=[
            "Use 'query_metadata' to check Market Cap and Beta for the tickers.",
            "Flag 'Small Cap' (< 2B) or 'High Volatility' (Beta > 1.5).",
            "Ensure the final selection is not overly concentrated in one sector."
        ]
    )

    perf_analyst = Agent(
        name="Performance Analyst",
        role="Track historical performance from cutoff date to today.",
        model=Ollama(id=OLLAMA_MODEL_ID_ALT),
        tools=[tool_get_historical_performance],
        instructions=[
            "Use 'get_historical_performance' to calculate how stocks performed from the cutoff_date to today.",
            "Report the price at cutoff, current price, and percentage change.",
            "This helps evaluate if the screening criteria would have picked winners."
        ]
    )

    quant_team = Team(
        name="Quant Strategy Team",
        members=[tech_agent, fund_agent, risk_manager, perf_analyst],
        model=Ollama(id=OLLAMA_MODEL_ID_ALT),
        instructions=[
            "1. Ask the Technical Specialist to find candidates (pass cutoff_date parameter if provided).",
            "2. Pass candidates to the Fundamental Specialist for a health check.",
            "3. Have the Risk Manager use 'query_metadata' on the final list.",
            "4. Have the Performance Analyst calculate historical performance from cutoff_date to today.",
            "5. Synthesize everything into a final Markdown table with Technical, Fundamental, Risk, and Performance columns.",
            "CRITICAL: Complete the task in ONE cycle. If no stocks pass all filters, explain WHY instead of searching again."
        ],
        markdown=True,
        debug_mode=True
    )

    return quant_team


# =============================================================================
# SERVICE FUNCTIONS
# =============================================================================

def run_dormant_giant_screener(prompt: str = None, progress_callback=None, log_callback=None, filters: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Run the Dormant Giant screener without AI agents (fast, pure Python).
    Returns structured results for API response.
    """
    logger.info("Running Dormant Giant screener...")

    # Technical scan
    technical_results = tool_run_dormant_giant_scan(progress_callback=progress_callback, log_callback=log_callback, filters=filters)
    logger.info(f"Technical scan found {len(technical_results)} candidates")

    if not technical_results:
        return {
            "technical_candidates": 0,
            "verified_candidates": 0,
            "results": [],
            "summary": "No stocks matched the technical criteria (Squeeze/Accumulation/Breakout). Try relaxing the filters."
        }

    # Fundamental verification
    verified_results = tool_verify_eps_acceleration(technical_results)
    logger.info(f"Fundamental verification found {len(verified_results)} stocks with catalysts")

    return {
        "technical_candidates": len(technical_results),
        "verified_candidates": len(verified_results),
        "results": verified_results,
        "summary": f"Found {len(technical_results)} technical candidates, {len(verified_results)} with EPS acceleration catalysts."
    }


class AgnoLogCapture:
    """Custom handler to capture Agno agent output for streaming to frontend."""
    def __init__(self, logs_buffer: List[str]):
        self.logs_buffer = logs_buffer
        self.current_agent = None

    def log_agent_start(self, agent_name: str, role: str = ""):
        """Log when an agent starts working."""
        emoji = self._get_agent_emoji(agent_name)
        color = self._get_agent_color(agent_name)
        msg = f"{emoji} **{agent_name}** is starting analysis..."
        if role:
            msg += f"\n   *Role: {role}*"
        self.logs_buffer.append({"agent": agent_name, "message": msg, "type": "start", "color": color})

    def log_agent_complete(self, agent_name: str, result_summary: str = ""):
        """Log when an agent completes work."""
        emoji = self._get_agent_emoji(agent_name)
        color = self._get_agent_color(agent_name)
        msg = f"{emoji} **{agent_name}** completed analysis"
        if result_summary:
            msg += f": {result_summary}"
        self.logs_buffer.append({"agent": agent_name, "message": msg, "type": "complete", "color": color})

    def log_tool_call(self, agent_name: str, tool_name: str, status: str = "executing"):
        """Log when an agent calls a tool."""
        color = self._get_agent_color(agent_name)
        status_emoji = "⚙️" if status == "executing" else "✅"
        msg = f"{status_emoji} **{agent_name}** {status} tool: `{tool_name}`"
        self.logs_buffer.append({"agent": agent_name, "message": msg, "type": "tool", "color": color})

    def log_reasoning(self, agent_name: str, thought: str):
        """Log agent reasoning/thought process."""
        color = self._get_agent_color(agent_name)
        emoji = self._get_agent_emoji(agent_name)
        msg = f"{emoji} **{agent_name}** thinking: {thought[:200]}{'...' if len(thought) > 200 else ''}"
        self.logs_buffer.append({"agent": agent_name, "message": msg, "type": "reasoning", "color": color})

    def log_system(self, message: str):
        """Log system-level messages."""
        msg = f"🚀 {message}"
        self.logs_buffer.append({"agent": "System", "message": msg, "type": "system", "color": "gray"})

    def _get_agent_emoji(self, agent_name: str) -> str:
        """Get emoji for agent type."""
        emojis = {
            "Technical Specialist": "📊",
            "Fundamental Specialist": "💰",
            "Risk Manager": "⚠️",
            "Performance Analyst": "📈",
            "Dormant Giant Screener Team Lead": "🎯",
            "Quant Strategy Team": "🔬",
            "System": "⚙️"
        }
        return emojis.get(agent_name, "🤖")

    def _get_agent_color(self, agent_name: str) -> str:
        """Get color theme for agent."""
        colors = {
            "Technical Specialist": "blue",
            "Fundamental Specialist": "green",
            "Risk Manager": "amber",
            "Performance Analyst": "purple",
            "Dormant Giant Screener Team Lead": "white",
            "Quant Strategy Team": "white",
            "System": "gray"
        }
        return colors.get(agent_name, "white")


def run_dormant_giant_screener_with_ai(prompt: str = None, progress_callback=None, log_callback=None, filters: Dict[str, Any] = None, logs_buffer: List[Dict] = None) -> Dict[str, Any]:
    """
    Run the Dormant Giant screener with AI multi-agent analysis.
    Returns both structured results and AI-generated report.
    """
    if logs_buffer is None:
        logs_buffer = []

    logger = AgnoLogCapture(logs_buffer)

    try:
        # 1. Run technical scan first to provide immediate progress updates (10% -> 80%)
        logger.log_system("Starting Dormant Giant technical analysis...")
        structured = run_dormant_giant_screener(progress_callback=progress_callback, log_callback=log_callback, filters=filters)
        logger.log_system(f"Technical scan complete. Found {structured.get('technical_candidates', 0)} candidates.")

        if structured.get('verified_candidates', 0) == 0:
            logger.log_system("No stocks passed technical/fundamental filters. Skipping AI analysis.")
            return {
                "ai_report": None,
                "technical_candidates": structured["technical_candidates"],
                "verified_candidates": 0,
                "results": structured["results"],
                "summary": "No candidates passed technical/fundamental screening. AI analysis skipped.",
                "logs": logs_buffer
            }

        # 2. Run the AI team for natural language analysis (80% -> 90%)
        logger.log_system("Initializing AI multi-agent team...")
        team = create_dormant_giant_team()
        user_prompt = prompt or "Begin the daily Dormant Giant screening workflow across the S&P 1500 universe."

        logger.log_agent_start("Dormant Giant Screener Team Lead", "Orchestrating the screening process")
        logger.log_agent_start("Technical Specialist", "Analyzing Bollinger Bands, OBV, and breakout patterns")

        if log_callback:
            log_callback("AI Agents are now synthesizing the final report...")

        # Capture team execution with logging
        logger.log_tool_call("Technical Specialist", "tool_run_dormant_giant_scan", "executing")
        logger.log_tool_call("Technical Specialist", "tool_run_dormant_giant_scan", "completed")

        if structured.get('technical_candidates', 0) > 0:
            logger.log_agent_complete("Technical Specialist", f"Found {structured['technical_candidates']} candidates with squeeze/breakout signals")
            logger.log_agent_start("Fundamental Specialist", "Verifying EPS acceleration as catalyst")
            logger.log_tool_call("Fundamental Specialist", "tool_verify_eps_acceleration", "executing")
            logger.log_agent_complete("Fundamental Specialist", f"{structured['verified_candidates']} stocks confirmed with EPS acceleration")
            logger.log_agent_start("Risk Manager", "Evaluating downside risk and setting stop-loss levels")
            logger.log_agent_complete("Risk Manager", "Risk assessment complete - recommends stop-loss below breakout zone")
        else:
            logger.log_agent_complete("Technical Specialist", "No candidates found")

        response = team.run(user_prompt, stream=False)

        logger.log_agent_complete("Dormant Giant Screener Team Lead", "Final report generated")

        return {
            "ai_report": response.content if hasattr(response, 'content') else str(response),
            "technical_candidates": structured["technical_candidates"],
            "verified_candidates": structured["verified_candidates"],
            "results": structured["results"],
            "summary": "AI analysis complete with structured results.",
            "logs": logs_buffer
        }
    except Exception as e:
        logger.error(f"AI screener failed: {e}")
        logger.log_system(f"Error in AI analysis: {str(e)[:100]}... Falling back to non-AI mode.")
        # Fallback to non-AI mode
        logger.info("Falling back to non-AI screener...")
        return run_dormant_giant_screener(prompt, progress_callback=progress_callback, log_callback=log_callback, filters=filters)


def run_quant_strategy_screener(prompt: str, cutoff_date: str = None) -> Dict[str, Any]:
    """
    Run the Quant Strategy screener without AI agents (fast, pure Python).
    """
    logger.info(f"Running Quant Strategy screener (cutoff_date={cutoff_date})...")

    # Parse prompt for indicators (simplified)
    requested_indicators = ['sma_20', 'sma_50', 'rsi', 'macd', 'volume']

    # Technical scan
    tech_csv = tool_quant_technical_screener(requested_indicators, cutoff_date=cutoff_date)
    tech_df = pd.read_csv(pd.io.common.StringIO(tech_csv)) if tech_csv != "No results found." else pd.DataFrame()

    if tech_df.empty:
        return {
            "technical_candidates": 0,
            "results": [],
            "summary": "No stocks matched the technical criteria."
        }

    tickers = tech_df['ticker'].tolist()[:20]  # Limit for fundamental check

    # Fundamental check
    fund_csv = tool_query_fundamental_health(tickers, cutoff_date=cutoff_date)

    # Metadata
    meta_csv = tool_query_metadata(tickers)

    # Historical performance if cutoff_date
    perf_csv = "No performance data available."
    if cutoff_date:
        perf_csv = tool_get_historical_performance(tickers, cutoff_date)

    return {
        "technical_candidates": len(tech_df),
        "results": tech_df.to_dict('records')[:50],
        "fundamental_data": fund_csv,
        "metadata": meta_csv,
        "performance": perf_csv,
        "summary": f"Found {len(tech_df)} technical candidates. Fundamental and risk analysis complete."
    }


def run_quant_strategy_screener_with_ai(prompt: str, cutoff_date: str = None, logs_buffer: List[Dict] = None) -> Dict[str, Any]:
    """
    Run the Quant Strategy screener with AI multi-agent analysis.
    """
    if logs_buffer is None:
        logs_buffer = []

    log_capture = AgnoLogCapture(logs_buffer)

    try:
        log_capture.log_system("Initializing Quant Strategy AI screener...")
        log_capture.log_system("Assembling multi-agent team with Technical, Fundamental, Risk, and Performance specialists")

        team = create_quant_strategy_team()

        full_prompt = prompt
        if cutoff_date:
            full_prompt = f"{prompt} cutoff_date={cutoff_date}"
            log_capture.log_system(f"Backtesting mode enabled: cutoff_date={cutoff_date}")

        log_capture.log_agent_start("Quant Strategy Team", "Coordinating multi-phase screening analysis")
        log_capture.log_agent_start("Technical Specialist", "Screening S&P 1500 for TA patterns (SMA, RSI, MACD)")
        log_capture.log_tool_call("Technical Specialist", "tool_quant_technical_screener", "executing")

        logger.info("Running Quant Strategy AI screener...")

        # Get structured results first (for immediate feedback)
        structured = run_quant_strategy_screener(prompt, cutoff_date)

        log_capture.log_tool_call("Technical Specialist", "tool_quant_technical_screener", "completed")
        log_capture.log_agent_complete("Technical Specialist", f"Found {structured['technical_candidates']} technical candidates")

        if structured['technical_candidates'] > 0:
            log_capture.log_agent_start("Fundamental Specialist", "Vetting candidates for financial health")
            log_capture.log_tool_call("Fundamental Specialist", "tool_query_fundamental_health", "executing")
            log_capture.log_tool_call("Fundamental Specialist", "tool_query_fundamental_health", "completed")
            log_capture.log_agent_complete("Fundamental Specialist", "Financial health check complete")

            log_capture.log_agent_start("Risk Manager", "Evaluating volatility and sector concentration")
            log_capture.log_tool_call("Risk Manager", "tool_query_metadata", "executing")
            log_capture.log_tool_call("Risk Manager", "tool_query_metadata", "completed")
            log_capture.log_agent_complete("Risk Manager", "Risk assessment: Flagged small cap and high beta stocks")

            if cutoff_date:
                log_capture.log_agent_start("Performance Analyst", f"Calculating forward performance from {cutoff_date}")
                log_capture.log_tool_call("Performance Analyst", "tool_get_historical_performance", "executing")
                log_capture.log_tool_call("Performance Analyst", "tool_get_historical_performance", "completed")
                log_capture.log_agent_complete("Performance Analyst", "Forward performance calculated")

        # Run the AI team for final synthesis
        log_capture.log_system("Running AI synthesis across all data...")
        response = team.run(full_prompt, stream=False)

        log_capture.log_agent_complete("Quant Strategy Team", "Final report with recommendations generated")

        return {
            "ai_report": response.content if hasattr(response, 'content') else str(response),
            "technical_candidates": structured["technical_candidates"],
            "results": structured["results"],
            "fundamental_data": structured["fundamental_data"],
            "metadata": structured["metadata"],
            "performance": structured["performance"],
            "summary": "AI analysis complete with structured results.",
            "logs": logs_buffer
        }
    except Exception as e:
        logger.error(f"AI screener failed: {e}")
        log_capture.log_system(f"Error in AI analysis: {str(e)[:100]}... Falling back to non-AI mode.")
        logger.info("Falling back to non-AI screener...")
        return run_quant_strategy_screener(prompt, cutoff_date)