import vectorbt as vbt
import pandas as pd
import numpy as np

# Parameters
rsi_period = 14
rsi_oversold = 30
rsi_overbought = 70

# Data download
data = vbt.YFData.download(
    ['AAPL'],
    start='2020-01-01',
    end='2024-01-01'
)

# Get price data
close = data.get('Close')

# Calculate RSI
rsi = vbt.RSI.run(close, window=rsi_period)

# Generate signals using VBT comparison methods
entries = rsi.rsi_below(rsi_oversold)
exits = rsi.rsi_above(rsi_overbought)

# Create portfolio with OHLC data
pf = vbt.Portfolio.from_signals(
    close,
    entries=entries,
    exits=exits,
    open=data.get('Open'),
    high=data.get('High'),
    low=data.get('Low')
)

# Print stats
print(pf.stats())
print(f"\nTotal Return: {pf.total_return()}")