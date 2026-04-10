"""
AI Stock Screener router for TradeCraft API.
Supports two screening modes:
1. Dormant Giant (agnoMultiAgentTrader_3) - Bollinger squeeze + EPS acceleration
2. Quant Strategy (agnoMultiAgentTrader_2) - TA-based with backtesting
"""

import os
import logging
import asyncio
from typing import List, Optional, Dict, Any, Literal
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from starlette.concurrency import run_in_threadpool

from app.services.agno_screener import (
    run_dormant_giant_screener,
    run_dormant_giant_screener_with_ai,
    run_quant_strategy_screener,
    run_quant_strategy_screener_with_ai
)

# Custom Logger for Scan Tracking
class ScanLogHandler(logging.Handler):
    def __init__(self, status_dict: Dict):
        super().__init__()
        self.status_dict = status_dict
        self.current_scan_id = None

    def set_scan_id(self, scan_id: Optional[str]):
        self.current_scan_id = scan_id

    def emit(self, record):
        if self.current_scan_id and self.current_scan_id in self.status_dict:
            log_entry = self.format(record)
            if "logs" not in self.status_dict[self.current_scan_id]:
                self.status_dict[self.current_scan_id]["logs"] = []
            self.status_dict[self.current_scan_id]["logs"].append(log_entry)

logger = logging.getLogger(__name__)
scan_status: Dict[str, Dict[str, Any]] = {}
scan_log_handler = ScanLogHandler(scan_status)
scan_log_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(scan_log_handler)
logger.setLevel(logging.INFO)

router = APIRouter()


class ScanRequest(BaseModel):
    """Scan request model."""
    mode: Literal["dormant_giant", "quant_strategy"] = "dormant_giant"
    use_ai: bool = True
    cutoff_date: Optional[str] = None  # For quant_strategy mode backtesting
    prompt: Optional[str] = None  # Custom prompt for AI analysis
    max_results: int = 50
    filters: Optional[Dict[str, Any]] = None


class ScanResult(BaseModel):
    """Stock scan result model."""
    ticker: str
    signal: Optional[str] = None
    fundamental_catalyst: Optional[str] = None
    close: Optional[float] = None
    data_date: Optional[str] = None
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    rsi: Optional[float] = None
    macd: Optional[float] = None
    volume: Optional[int] = None


class ScanStatus(BaseModel):
    """Scan status model."""
    scan_id: str
    mode: str
    status: str  # 'pending', 'running', 'completed', 'failed'
    progress: int  # 0-100
    use_ai: bool
    results: Optional[List[Dict]] = None
    ai_report: Optional[str] = None
    error: Optional[str] = None


@router.get("/modes")
async def get_screener_modes():
    """Get available screening modes with descriptions."""
    return {
        "modes": [
            {
                "id": "dormant_giant",
                "name": "Dormant Giant Screener",
                "description": "Identifies stocks with Bollinger Band squeeze, OBV hidden accumulation, or resistance breakouts. Verifies with EPS acceleration as catalyst.",
                "use_ai_options": [True, False],
                "supports_backtesting": False,
                "agents": ["Technical Specialist", "Fundamental Specialist", "Risk Manager"]
            },
            {
                "id": "quant_strategy",
                "name": "Quant Strategy Screener",
                "description": "Technical analysis screening with fundamental health verification, risk assessment, and optional historical backtesting.",
                "use_ai_options": [True, False],
                "supports_backtesting": True,
                "agents": ["Technical Specialist", "Fundamental Specialist", "Risk Manager", "Performance Analyst"]
            }
        ]
    }


@router.post("/scan", response_model=Dict[str, Any])
async def run_scan(request: ScanRequest, background_tasks: BackgroundTasks):
    """
    Run stock screening scan.

    Modes:
    - dormant_giant: Bollinger squeeze + EPS acceleration detection
    - quant_strategy: TA-based with fundamental health and optional backtesting

    Set use_ai=True to get AI-generated analysis report from multi-agent team.
    """
    import uuid
    scan_id = str(uuid.uuid4())

    # Initialize status
    scan_status[scan_id] = {
        "mode": request.mode,
        "status": "pending",
        "progress": 0,
        "use_ai": request.use_ai,
        "results": None,
        "ai_report": None,
        "error": None,
        "logs": []
    }

    # Run scan in background
    background_tasks.add_task(run_screening_task, scan_id, request)

    return {
        "scan_id": scan_id,
        "mode": request.mode,
        "use_ai": request.use_ai,
        "status": "pending",
        "message": f"Scan started in {request.mode} mode. Poll /api/screener/status/{scan_id} for results."
    }


async def run_screening_task(scan_id: str, request: ScanRequest):
    """Background task to run the screening workflow."""
    # Set the logger to capture logs for this specific scan
    scan_log_handler.set_scan_id(scan_id)

    # Initialize logs buffer for structured agent logs
    logs_buffer = []
    scan_status[scan_id]["logs"] = logs_buffer

    try:
        scan_status[scan_id]["status"] = "running"
        scan_status[scan_id]["progress"] = 10
        logger.info(f"Starting scan {scan_id} in mode {request.mode}")

        mode = request.mode
        use_ai = request.use_ai

        # Callback to update progress and logs in the shared dictionary
        def update_progress(p):
            scan_status[scan_id]["progress"] = p

        def update_logs(message):
            logger.info(message)

        # Use run_in_threadpool to prevent blocking the event loop
        if mode == "dormant_giant":
            if use_ai:
                result = await run_in_threadpool(
                    lambda: run_dormant_giant_screener_with_ai(
                        prompt=request.prompt,
                        progress_callback=update_progress,
                        log_callback=update_logs,
                        filters=request.filters,
                        logs_buffer=logs_buffer
                    )
                )
            else:
                result = await run_in_threadpool(
                    lambda: run_dormant_giant_screener(
                        prompt=request.prompt,
                        progress_callback=update_progress,
                        log_callback=update_logs,
                        filters=request.filters
                    )
                )

        elif mode == "quant_strategy":
            if use_ai:
                result = await run_in_threadpool(
                    lambda: run_quant_strategy_screener_with_ai(
                        prompt=request.prompt or "Find me 5 Small or Mid Cap stocks in an uptrend with consistent yearly revenue growth.",
                        cutoff_date=request.cutoff_date,
                        logs_buffer=logs_buffer
                    )
                )
            else:
                result = await run_in_threadpool(
                    run_quant_strategy_screener,
                    request.prompt or "Find me 5 Small or Mid Cap stocks in an uptrend with consistent yearly revenue growth.",
                    request.cutoff_date
                )
        else:
            raise ValueError(f"Unknown mode: {mode}")

        scan_status[scan_id]["progress"] = 90
        logger.info(f"Scan {scan_id} completed: {result.get('summary', 'No summary')}")

        # Merge any logs from result into logs_buffer
        if result and "logs" in result and isinstance(result["logs"], list):
            logs_buffer.extend(result["logs"])

        # Limit results
        if "results" in result and isinstance(result["results"], list):
            result["results"] = result["results"][:request.max_results]

        scan_status[scan_id]["status"] = "completed"
        scan_status[scan_id]["progress"] = 100
        scan_status[scan_id]["results"] = result.get("results", [])
        scan_status[scan_id]["ai_report"] = result.get("ai_report")

    finally:
        # Reset logger to avoid leaking logs into the wrong scan
        scan_log_handler.set_scan_id(None)


@router.get("/status/{scan_id}")
async def get_scan_status(scan_id: str):
    """Get status of a running scan."""
    if scan_id not in scan_status:
        raise HTTPException(status_code=404, detail="Scan ID not found")

    status = scan_status[scan_id]
    logs = status.get("logs", [])

    # Convert legacy string logs to structured format
    structured_logs = []
    for log in logs:
        if isinstance(log, dict):
            structured_logs.append(log)
        else:
            structured_logs.append({
                "agent": "System",
                "message": str(log),
                "type": "system",
                "color": "gray"
            })

    return {
        "scan_id": scan_id,
        "mode": status.get("mode", "unknown"),
        "status": status["status"],
        "progress": status["progress"],
        "use_ai": status.get("use_ai", False),
        "results_count": len(status["results"]) if status.get("results") else 0,
        "has_ai_report": status.get("ai_report") is not None,
        "error": status.get("error"),
        "logs": structured_logs
    }


@router.get("/results/{scan_id}")
async def get_scan_results(scan_id: str):
    """Get final results of a completed scan."""
    if scan_id not in scan_status:
        raise HTTPException(status_code=404, detail="Scan ID not found")

    status = scan_status[scan_id]

    if status["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Scan not completed. Current status: {status['status']}"
        )

    return {
        "scan_id": scan_id,
        "mode": status.get("mode", "unknown"),
        "status": "completed",
        "use_ai": status.get("use_ai", False),
        "results_count": len(status["results"]) if status.get("results") else 0,
        "results": status["results"],
        "ai_report": status.get("ai_report")
    }


@router.get("/ai-report/{scan_id}")
async def get_ai_report(scan_id: str):
    """Get the AI-generated analysis report for a completed scan."""
    if scan_id not in scan_status:
        raise HTTPException(status_code=404, detail="Scan ID not found")

    status = scan_status[scan_id]

    if status["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Scan not completed. Current status: {status['status']}"
        )

    if not status.get("ai_report"):
        raise HTTPException(
            status_code=404,
            detail="No AI report available. This scan was run without AI analysis (use_ai=False)."
        )

    return {
        "scan_id": scan_id,
        "mode": status.get("mode"),
        "ai_report": status["ai_report"]
    }


@router.delete("/scan/{scan_id}")
async def delete_scan(scan_id: str):
    """Delete a scan from memory."""
    if scan_id not in scan_status:
        raise HTTPException(status_code=404, detail="Scan ID not found")

    del scan_status[scan_id]
    return {"message": f"Scan {scan_id} deleted"}


@router.get("/health")
async def screener_health():
    """Health check for screener service."""
    return {
        "status": "healthy",
        "active_scans": len(scan_status),
        "modes_available": ["dormant_giant", "quant_strategy"]
    }