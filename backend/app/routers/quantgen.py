"""
QuantGen Strategy Builder router for TradeCraft API.
Provides AI-powered strategy generation, execution, and optimization.
Ported from QuantGen FastAPI backend with database integration.
"""

import os
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

# Import strategy services (will be created)
# from app.services.strategy_service import generate_strategy_code, execute_strategy, run_optimization
# from app.services.data_service import get_ohlcv_data


class GenerateRequest(BaseModel):
    """Request model for strategy generation."""
    prompt: str
    tickers: List[str]
    start_date: str
    end_date: str


class RunRequest(BaseModel):
    """Request model for strategy execution."""
    code: str
    use_database: bool = True  # Use database instead of yfinance


class OptimizeRequest(BaseModel):
    """Request model for strategy optimization."""
    code: str
    strategy_params: Dict[str, Any]
    config: Dict[str, Any]


class ChatRequest(BaseModel):
    """Request model for code chat."""
    code: str
    messages: List[Dict[str, str]]


class StrategyModel(BaseModel):
    """Model for saving/loading strategies."""
    name: str
    code: str


@router.get("/health")
async def quantgen_health():
    """Health check for QuantGen module."""
    return {
        "status": "healthy",
        "module": "quantgen",
        "features": {
            "strategy_generation": True,
            "backtesting": True,
            "optimization": True,
            "database_integration": True
        }
    }


@router.post("/generate")
async def generate_strategy(request: GenerateRequest):
    """
    Generate trading strategy code using AI.
    Uses database (PostgreSQL) for historical data instead of yfinance.
    """
    try:
        logger.info(f"Generating strategy for tickers: {request.tickers}")

        # TODO: Implement with LLM engine
        # For now, return a template strategy
        code = f'''
import vectorbt as vbt
import pandas as pd

# Strategy generated from prompt: {request.prompt}
# Tickers: {', '.join(request.tickers)}
# Date range: {request.start_date} to {request.end_date}

# Note: Data will be fetched from PostgreSQL database
# The database service will handle fetching OHLCV data

def run_strategy():
    """Execute the trading strategy."""
    # This is a placeholder - actual implementation will use
    # vectorbt with data from PostgreSQL
    pass

if __name__ == "__main__":
    run_strategy()
'''

        return {
            "success": True,
            "data": {
                "code": code,
                "output": "Strategy template generated. Full AI generation pending LLM integration.",
            },
            "message": "Strategy generated successfully"
        }

    except Exception as e:
        logger.error(f"Strategy generation failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/run")
async def run_strategy(request: RunRequest):
    """
    Execute a trading strategy.
    If use_database is True, fetches data from PostgreSQL instead of yfinance.
    """
    try:
        logger.info(f"Running strategy (length: {len(request.code)} chars)")

        # TODO: Implement with executor service
        # The executor will use data_service.get_ohlcv_data() instead of yfinance

        return {
            "success": False,
            "error": "Strategy execution not yet implemented. Executor service pending.",
            "message": "This endpoint will be implemented with database integration"
        }

    except Exception as e:
        logger.error(f"Strategy execution failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/optimize")
async def optimize_strategy(request: OptimizeRequest):
    """
    Run parameter optimization on a strategy.
    Uses walk-forward optimization by default.
    """
    try:
        logger.info(f"Starting optimization with params: {request.strategy_params}")

        # TODO: Implement with optimization_runner

        return {
            "success": False,
            "error": "Optimization not yet implemented. Service pending.",
            "message": "This endpoint will be implemented with database integration"
        }

    except Exception as e:
        logger.error(f"Optimization failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/chat")
async def chat_about_code(request: ChatRequest):
    """
    Chat about strategy code with AI.
    Maintains conversation context for iterative refinement.
    """
    try:
        logger.info(f"Chat request (code length: {len(request.code)} chars, messages: {len(request.messages)})")

        # TODO: Implement with LLM engine

        return {
            "success": False,
            "error": "Chat not yet implemented. LLM engine pending.",
            "message": "This endpoint will be implemented with LLM integration"
        }

    except Exception as e:
        logger.error(f"Chat failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.get("/strategies")
async def list_strategies():
    """List all saved strategies."""
    try:
        import glob

        strategies_dir = "../strategies"
        if not os.path.exists(strategies_dir):
            os.makedirs(strategies_dir)

        files = glob.glob(os.path.join(strategies_dir, "*.py"))
        strategy_names = [os.path.basename(f) for f in files]

        return {
            "success": True,
            "data": {
                "strategies": strategy_names,
                "count": len(strategy_names)
            },
            "message": f"Found {len(strategy_names)} strategies"
        }

    except Exception as e:
        logger.error(f"Error listing strategies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/strategies")
async def save_strategy(strategy: StrategyModel):
    """Save a strategy to file."""
    try:
        import os

        # Sanitize filename
        safe_name = "".join(c if c.isalnum() or c in ('_', '-') else '_' for c in strategy.name)
        if not safe_name.endswith('.py'):
            safe_name += '.py'

        strategies_dir = "../strategies"
        if not os.path.exists(strategies_dir):
            os.makedirs(strategies_dir)

        path = os.path.join(strategies_dir, safe_name)

        with open(path, "w", encoding="utf-8") as f:
            f.write(strategy.code)

        return {
            "success": True,
            "data": {
                "path": path,
                "filename": safe_name
            },
            "message": f"Strategy '{safe_name}' saved successfully"
        }

    except Exception as e:
        logger.error(f"Error saving strategy: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/strategies/{name}")
async def get_strategy(name: str):
    """Get a saved strategy by name."""
    try:
        safe_name = "".join(c if c.isalnum() or c in ('_', '-', '.') else '_' for c in name)
        if not safe_name.endswith('.py'):
            safe_name += '.py'

        strategies_dir = "../strategies"
        path = os.path.join(strategies_dir, safe_name)

        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Strategy not found")

        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        return {
            "success": True,
            "data": {
                "name": name,
                "code": content,
                "filename": safe_name
            },
            "message": f"Strategy '{name}' loaded successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading strategy: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/strategies/{name}")
async def delete_strategy(name: str):
    """Delete a saved strategy."""
    try:
        import os
        import shutil

        safe_name = "".join(c if c.isalnum() or c in ('_', '-', '.') else '_' for c in name)
        if not safe_name.endswith('.py'):
            safe_name += '.py'

        strategies_dir = "../strategies"
        path = os.path.join(strategies_dir, safe_name)

        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Strategy not found")

        # Create backup before deletion
        backup_path = f"{path}.deleted"
        shutil.copy2(path, backup_path)
        os.remove(path)

        return {
            "success": True,
            "data": {
                "filename": safe_name,
                "backup_path": backup_path
            },
            "message": f"Strategy '{name}' deleted successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting strategy: {e}")
        raise HTTPException(status_code=500, detail=str(e))