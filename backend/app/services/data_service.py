"""
Data service for TradeCraft.
Replaces yfinance with PostgreSQL database queries for historical OHLCV data.
Provides vectorbt-compatible DataFrames for backtesting.
"""

import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

import pandas as pd
import numpy as np
from sqlalchemy import text

from app.db.database import engine

logger = logging.getLogger(__name__)


class DataService:
    """
    Service for fetching historical market data from PostgreSQL.
    Replaces yfinance for QuantGen backtesting.
    """

    @staticmethod
    def get_ticker_table_name(ticker: str) -> str:
        """Convert ticker to lowercase table name."""
        return ticker.lower().replace('.', '-')

    @staticmethod
    def get_available_tickers() -> List[str]:
        """Get list of all available tickers in the database."""
        try:
            query = text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name NOT IN ('stock_metadata', 'stock_financials_quarterly', 'stock_financials_yearly')
            """)
            with engine.connect() as conn:
                result = conn.execute(query)
                return [row[0].upper() for row in result]
        except Exception as e:
            logger.error(f"Error getting available tickers: {e}")
            return []

    @staticmethod
    def get_ohlcv_data(
        ticker: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        limit: Optional[int] = None
    ) -> Optional[pd.DataFrame]:
        """
        Fetch OHLCV data for a ticker from PostgreSQL.

        Args:
            ticker: Stock ticker symbol (e.g., 'AAPL')
            start_date: Start date in 'YYYY-MM-DD' format (optional)
            end_date: End date in 'YYYY-MM-DD' format (optional)
            limit: Maximum number of rows to return (optional)

        Returns:
            pandas DataFrame with columns: Date, Open, High, Low, Close, Volume
            Returns None if ticker not found or error occurs.
        """
        table_name = DataService.get_ticker_table_name(ticker)

        try:
            # Build query with optional date filters
            base_query = f'''
                SELECT "Date", "Open", "High", "Low", "Close", "Volume"
                FROM "{table_name}"
            '''

            conditions = []
            params = {}

            if start_date:
                conditions.append('"Date" >= :start_date')
                params['start_date'] = start_date

            if end_date:
                conditions.append('"Date" <= :end_date')
                params['end_date'] = end_date

            if conditions:
                base_query += " WHERE " + " AND ".join(conditions)

            base_query += ' ORDER BY "Date" ASC'

            if limit:
                base_query += f" LIMIT {limit}"

            query = text(base_query)

            with engine.connect() as conn:
                df = pd.read_sql(query, conn, params=params)

            if df.empty:
                logger.debug(f"No data found for ticker {ticker}")
                return None

            # Ensure Date column is datetime
            df['Date'] = pd.to_datetime(df['Date'])

            # Set Date as index for vectorbt compatibility
            df.set_index('Date', inplace=True)

            # Sort by date
            df.sort_index(inplace=True)

            logger.debug(f"Fetched {len(df)} rows for {ticker} from {df.index[0]} to {df.index[-1]}")
            return df

        except Exception as e:
            logger.error(f"Error fetching OHLCV data for {ticker}: {e}")
            return None

    @staticmethod
    def get_multi_ticker_data(
        tickers: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Dict[str, pd.DataFrame]:
        """
        Fetch OHLCV data for multiple tickers.

        Args:
            tickers: List of ticker symbols
            start_date: Start date in 'YYYY-MM-DD' format
            end_date: End date in 'YYYY-MM-DD' format

        Returns:
            Dictionary mapping ticker to DataFrame
        """
        result = {}
        for ticker in tickers:
            df = DataService.get_ohlcv_data(ticker, start_date, end_date)
            if df is not None:
                result[ticker] = df
        return result

    @staticmethod
    def get_latest_price(ticker: str) -> Optional[float]:
        """Get the latest closing price for a ticker."""
        table_name = DataService.get_ticker_table_name(ticker)

        try:
            query = text(f'SELECT "Close" FROM "{table_name}" ORDER BY "Date" DESC LIMIT 1')
            with engine.connect() as conn:
                result = conn.execute(query).fetchone()
                if result:
                    return float(result[0])
            return None
        except Exception as e:
            logger.error(f"Error getting latest price for {ticker}: {e}")
            return None

    @staticmethod
    def get_ticker_metadata(ticker: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a ticker from stock_metadata table."""
        try:
            query = text("""
                SELECT ticker, name, sector, industry, market_cap
                FROM stock_metadata
                WHERE ticker = :ticker
            """)
            with engine.connect() as conn:
                result = conn.execute(query, {"ticker": ticker.upper()}).fetchone()

            if result:
                return {
                    'ticker': result[0],
                    'name': result[1],
                    'sector': result[2],
                    'industry': result[3],
                    'market_cap': result[4]
                }
            return None
        except Exception as e:
            logger.error(f"Error getting metadata for {ticker}: {e}")
            return None

    @staticmethod
    def prepare_vectorbt_data(
        ticker: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> Optional[pd.DataFrame]:
        """
        Prepare data in vectorbt-compatible format.

        Returns a DataFrame with the index as DatetimeIndex and columns:
        Open, High, Low, Close, Volume

        This matches the format returned by yfinance for vectorbt.
        """
        df = DataService.get_ohlcv_data(ticker, start_date, end_date)

        if df is None:
            return None

        # Ensure column names are correct (Open, High, Low, Close, Volume)
        # and index is DatetimeIndex named 'Date'
        df.index.name = 'Date'

        # vectorbt expects these exact column names
        required_columns = ['Open', 'High', 'Low', 'Close', 'Volume']
        if not all(col in df.columns for col in required_columns):
            logger.error(f"DataFrame missing required columns. Have: {df.columns.tolist()}")
            return None

        return df


# Convenience function for use in strategy code
def get_data(ticker: str, start_date: str, end_date: str) -> Optional[pd.DataFrame]:
    """
    Convenience function to get data for strategy execution.
    Drop-in replacement for yfinance.download().

    Usage in strategy code:
        # Instead of: yf.download('AAPL', start='2023-01-01', end='2024-01-01')
        # Use: data = get_data('AAPL', '2023-01-01', '2024-01-01')
    """
    return DataService.prepare_vectorbt_data(ticker, start_date, end_date)


def get_multi_data(tickers: List[str], start_date: str, end_date: str) -> Dict[str, pd.DataFrame]:
    """
    Convenience function to get data for multiple tickers.
    """
    return DataService.get_multi_ticker_data(tickers, start_date, end_date)