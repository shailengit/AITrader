"""Indicator Detector Module - Detects indicators in strategy code"""
import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Simple pattern for EMA detection
EMA_PATTERN = r'vbt\.EMA\.run\s*\(\s*([^,\)]+)'

# Simple pattern for MA detection
MA_PATTERN = r'vbt\.MA\.run\s*\(\s*([^,\)]+)'

# Simple pattern for RSI detection
RSI_PATTERN = r'vbt\.RSI\.run\s*\(\s*([^,\)]+)'


def detect_ema(code: str) -> List[Dict[str, Any]]:
    """Detect EMA indicators in code."""
    if not code:
        return []

    detected = []
    matches = re.findall(EMA_PATTERN, code, re.IGNORECASE)

    # Find ALL window variables
    window_matches = re.findall(r'(\w+)_window\s*=\s*(\d+)', code)
    window_map = {v: k for k, v in window_matches}  # Map variable names to values

    for i, match in enumerate(matches):
        # Try to find corresponding window parameter
        window = "?"
        for var_name, var_value in window_matches:
            # Check if this window variable is used in this EMA call
            if var_name in code.split('vbt.EMA.run')[max(1, i+1)-1:i+2]:
                window = var_value
                break
        if window == "?" and window_matches and i < len(window_matches):
            window = window_matches[i][1]

        detected.append({
            "type": "EMA",
            "params": {"window": window},
            "name": f"EMA ({window})"
        })

    return detected


def detect_ma(code: str) -> List[Dict[str, Any]]:
    """Detect MA indicators in code."""
    if not code:
        return []

    detected = []
    matches = re.findall(MA_PATTERN, code, re.IGNORECASE)

    # Find ALL window variables
    window_matches = re.findall(r'(\w+)_window\s*=\s*(\d+)', code)

    for i, match in enumerate(matches):
        window = "?"
        if window_matches and i < len(window_matches):
            window = window_matches[i][1]

        detected.append({
            "type": "MA",
            "params": {"window": window},
            "name": f"MA ({window})"
        })

    return detected


def detect_rsi(code: str) -> List[Dict[str, Any]]:
    """Detect RSI indicators in code."""
    if not code:
        return []

    detected = []
    matches = re.findall(RSI_PATTERN, code, re.IGNORECASE)

    for match in matches:
        period_match = re.search(r'(\w+)_period\s*=\s*(\d+)', code)
        if period_match:
            period = period_match.group(2)
        else:
            period = "?"

        detected.append({
            "type": "RSI",
            "params": {"period": period},
            "name": f"RSI ({period})"
        })

    return detected


def detect_indicators(code: str) -> List[Dict[str, Any]]:
    """Detect all indicators in strategy code."""
    all_indicators = []

    # Detect each type
    ema_indicators = detect_ema(code)
    ma_indicators = detect_ma(code)
    rsi_indicators = detect_rsi(code)

    # Combine (avoiding duplicates)
    seen = set()
    for ind in ema_indicators + ma_indicators + rsi_indicators:
        key = f"{ind['type']}_{ind['params']}"
        if key not in seen:
            seen.add(key)
            all_indicators.append(ind)

    logger.info(f"Detected {len(all_indicators)} indicators")
    return all_indicators
