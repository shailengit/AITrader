"""Indicator Extractor Module - Extracts indicator values from execution context"""
import numpy as np
import pandas as pd
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)


def extract_indicators(
    exec_globals: Dict[str, Any],
    detected_indicators: List[Dict[str, Any]],
    close_prices: Optional[np.ndarray] = None,
    time_index: Optional[pd.DatetimeIndex] = None
) -> List[Dict[str, Any]]:
    """Extract computed indicator values from execution context."""
    extracted = []

    # Get close prices and time index if not provided
    if close_prices is None:
        close_prices = _find_close_prices(exec_globals)
    if time_index is None:
        time_index = _find_time_index(exec_globals)

    for indicator in detected_indicators:
        indicator_type = indicator["type"]
        params = indicator["params"]

        # Extract based on type
        if indicator_type in ["MA", "EMA", "SMA"]:
            indicator_data = _extract_ma_indicator(params, close_prices, time_index)
        elif indicator_type == "RSI":
            indicator_data = _extract_rsi_indicator(params, close_prices, time_index)
        elif indicator_type == "MACD":
            indicator_data = _extract_macd_indicator(params, close_prices, time_index)
        else:
            indicator_data = None

        if indicator_data:
            extracted.append(indicator_data)

    logger.info(f"Extracted {len(extracted)} indicators")
    return extracted


def _extract_ma_indicator(
    params: Dict[str, str],
    close_prices: Optional[np.ndarray],
    time_index: Optional[pd.DatetimeIndex]
) -> Optional[Dict[str, Any]]:
    """Extract MA/EMA indicator values."""
    try:
        import vectorbt as vbt

        if close_prices is None:
            return None

        window = int(params.get("window", 20))
        ma = vbt.MA.run(close_prices, window=window)
        ma_values = ma.ma.values

        data = _values_to_list(ma_values, time_index)

        return {
            "type": "MA",
            "name": f"MA ({window})",
            "params": params,
            "data": data,
            "color": "#2196F3"
        }
    except Exception as e:
        logger.warning(f"Failed to extract MA: {e}")
    return None


def _extract_rsi_indicator(
    params: Dict[str, str],
    close_prices: Optional[np.ndarray],
    time_index: Optional[pd.DatetimeIndex]
) -> Optional[Dict[str, Any]]:
    """Extract RSI indicator values."""
    try:
        import vectorbt as vbt

        if close_prices is None:
            return None

        period = int(params.get("period", params.get("window", 14)))
        rsi = vbt.RSI.run(close_prices, window=period)
        rsi_values = rsi.rsi.values

        data = _values_to_list(rsi_values, time_index)

        return {
            "type": "RSI",
            "name": f"RSI ({period})",
            "params": params,
            "data": data,
            "color": "#FF9800"
        }
    except Exception as e:
        logger.warning(f"Failed to extract RSI: {e}")
    return None


def _extract_macd_indicator(
    params: Dict[str, str],
    close_prices: Optional[np.ndarray],
    time_index: Optional[pd.DatetimeIndex]
) -> Optional[Dict[str, Any]]:
    """Extract MACD indicator values."""
    try:
        import vectorbt as vbt

        if close_prices is None:
            return None

        fast = int(params.get("fast_window", 12))
        slow = int(params.get("slow_window", 26))
        signal = int(params.get("signal_window", 9))

        macd = vbt.MACD.run(close_prices, fast_window=fast, slow_window=slow, signal_window=signal)
        macd_values = macd.macd.values

        data = _values_to_list(macd_values, time_index)

        return {
            "type": "MACD",
            "name": f"MACD ({fast},{slow},{signal})",
            "params": params,
            "data": data,
            "color": "#9C27B0"
        }
    except Exception as e:
        logger.warning(f"Failed to extract MACD: {e}")
    return None


def _find_close_prices(exec_globals: Dict[str, Any]) -> Optional[np.ndarray]:
    """Find close prices from execution context."""
    if "close" in exec_globals:
        close = exec_globals["close"]
        if hasattr(close, "values"):
            return close.values
        elif isinstance(close, np.ndarray):
            return close
    return None


def _find_time_index(exec_globals: Dict[str, Any]) -> Optional[pd.DatetimeIndex]:
    """Find datetime index from execution context."""
    if "close" in exec_globals and hasattr(exec_globals["close"], "index"):
        return exec_globals["close"].index
    return None


def _values_to_list(
    values: np.ndarray,
    time_index: Optional[pd.DatetimeIndex] = None
) -> List[Dict[str, Any]]:
    """Convert numpy array to list of {time, value} dicts."""
    result = []

    if time_index is not None and len(time_index) == len(values):
        for idx, val in zip(time_index, values):
            if not np.isnan(val) and not np.isinf(val):
                # Convert to Unix timestamp (seconds) - same as OHLCV format
                if hasattr(idx, 'timestamp'):
                    ts = idx.timestamp()
                else:
                    ts = pd.to_datetime(idx).timestamp()
                result.append({
                    "time": float(ts),
                    "value": float(val)
                })
    else:
        for i, val in enumerate(values):
            if not np.isnan(val) and not np.isinf(val):
                result.append({
                    "time": int(i),
                    "value": float(val)
                })

    return result
