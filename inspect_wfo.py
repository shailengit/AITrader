from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})

    # Navigate to the dashboard with existing WFO results
    page.goto('http://localhost:5173/quantgen/dashboard')
    page.wait_for_load_state('networkidle')

    # Wait a bit more for data to load
    page.wait_for_timeout(3000)

    # Take screenshot
    page.screenshot(path='/Users/shailendrakaushik/Documents/Python/AlgoTrading/TradeCraft-1/AITrader/dashboard_inspect.png', full_page=True)

    # Get localStorage to see what data is stored
    local_storage = page.evaluate('''() => {
        const data = localStorage.getItem('lastRunData');
        return data ? JSON.parse(data) : null;
    }''')

    if local_storage:
        print("=== localStorage lastRunData ===")
        print(f"Has equity: {'equity' in local_storage and len(local_storage.get('equity', [])) > 0}")
        print(f"Has ohlcv: {'ohlcv' in local_storage and len(local_storage.get('ohlcv', [])) > 0}")
        print(f"Has drawdown: {'drawdown' in local_storage and len(local_storage.get('drawdown', {})) > 0}")
        print(f"Has trades: {'trades' in local_storage and len(local_storage.get('trades', [])) > 0}")
        print(f"Has stats: {'stats' in local_storage and len(local_storage.get('stats', {})) > 0}")

        if 'ohlcv' in local_storage:
            print(f"\nOHLCV entries: {len(local_storage['ohlcv'])}")
            if len(local_storage['ohlcv']) > 0:
                print(f"First OHLCV entry: {local_storage['ohlcv'][0]}")

        if 'equity' in local_storage:
            print(f"\nEquity entries: {len(local_storage['equity'])}")
            if len(local_storage['equity']) > 0:
                print(f"First equity entry: {local_storage['equity'][0]}")

        if 'drawdown' in local_storage:
            dd = local_storage['drawdown']
            print(f"\nDrawdown entries: {len(dd) if isinstance(dd, dict) else len(dd) if isinstance(dd, list) else 'N/A'}")
    else:
        print("No lastRunData in localStorage")

    # Check for console errors
    logs = []
    page.on("console", lambda msg: logs.append(f"{msg.type}: {msg.text}"))
    page.on("pageerror", lambda err: logs.append(f"ERROR: {err}"))

    page.wait_for_timeout(1000)

    print("\n=== Console Logs ===")
    for log in logs[:20]:
        print(log)

    browser.close()
