"""
Continuous MA Strategy for True Walk-Forward Optimization

This strategy uses continuous (state-based) signals rather than event-driven crossovers.
It generates a position decision EVERY DAY, making it suitable for True WFO with short test windows.

Logic:
- Generate raw signal: fast MA above slow MA = want to be long
- VBT's from_signals with direction='longonly' handles position management:
  - Buys when entering long condition (and not already in position)
  - Sells when exiting long condition (and currently in position)
  - Holds when condition unchanged
"""

import vectorbt as vbt
import pandas as pd
import numpy as np

# Parameters (these will be optimized by True WFO)
fast_window = 5
slow_window = 20

# Download data
data = vbt.YFData.download(
    'AAPL',
    start='2026-01-01',
    end='2026-04-01'
)

# Get close price
close = data.get('Close')

# Calculate MAs
fast_ma = vbt.MA.run(close, window=fast_window)
slow_ma = vbt.MA.run(close, window=slow_window)

# CONTINUOUS SIGNALS (state-based, not event-driven)
# raw_long is True EVERY DAY the fast MA is above slow MA
# This is a continuous signal - we want to be long during these periods
raw_long = fast_ma.ma_above(slow_ma.ma)

# raw_flat is True EVERY DAY the fast MA is below slow MA
# This is a continuous signal - we want to be flat during these periods
raw_flat = fast_ma.ma_below(slow_ma.ma)

# For True WFO, we pass continuous signals to from_signals
# With direction='longonly', VBT handles position tracking internally:
# - Enters long when raw_long becomes True (not already in position)
# - Exits long when raw_flat becomes True (currently in position)
# - Holds when neither condition changes
pf = vbt.Portfolio.from_signals(
    close,
    entries=raw_long,      # Continuous signal: want to be long when True
    exits=raw_flat,        # Continuous signal: want to exit when True
    direction='longonly',  # Only long positions, no short selling
    freq='1d'
)

# Alternative: Explicit position tracking (if you want to see the logic)
# This shows exactly when buy/sell signals occur based on position changes
position = raw_long.astype(int)  # 1 = want long, 0 = want flat
entries_explicit = (position == 1) & (position.shift(1) == 0)
exits_explicit = (position == 0) & (position.shift(1) == 1)

print(f"Total days: {len(close)}")
print(f"Days with raw_long=True: {raw_long.sum()}")
print(f"Days with raw_flat=True: {raw_flat.sum()}")
print(f"Explicit entry signals: {entries_explicit.sum()}")
print(f"Explicit exit signals: {exits_explicit.sum()}")
print(f"\nTotal Return: {pf.total_return():.4f}")
print(f"Number of trades: {pf.trades.count()}")
