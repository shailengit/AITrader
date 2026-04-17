"""
QuantGen Strategy Builder router for TradeCraft API.
Provides AI-powered strategy generation, execution, and optimization.
Ported from QuantGen FastAPI backend with database integration.
"""

import os
import logging
import itertools
import numpy as np
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.llm_engine import (
    generate_strategy_code,
    fix_strategy_code,
    chat_about_code,
    is_llm_available,
    get_model_name
)
from app.services.executor import execute_strategy
from app.services.optimization_runner import run_optimization
from app.services.validators import (
    validate_api_request,
    BaseValidationError,
    SecurityValidationError,
    DataValidationError,
    sanitize_filename,
    validate_file_path,
    StrategyValidator
)
from app.services.vbt_helpers import get_indicator_list
from app.services.continuous_wfo import run_continuous_true_wfo

logger = logging.getLogger(__name__)

router = APIRouter()


class GenerateRequest(BaseModel):
    """Request model for strategy generation."""
    prompt: str
    tickers: List[str]
    start_date: str
    end_date: str


class RunRequest(BaseModel):
    """Request model for strategy execution."""
    code: str
    use_database: bool = True


class OptimizeRequest(BaseModel):
    """Request model for strategy optimization."""
    code: str
    strategy_params: Dict[str, Any]
    config: Dict[str, Any]


class TrueWFORequest(BaseModel):
    """Request model for True Walk-Forward Optimization."""
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
        "llm_model": get_model_name() if is_llm_available() else None,
        "features": {
            "strategy_generation": is_llm_available(),
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

        if not is_llm_available():
            return {
                "success": False,
                "error": {
                    "type": "ConfigurationError",
                    "message": "Local LLM not available. Ensure the model server is running on port 11434 with kimi-k2.5:cloud model."
                },
                "data": None
            }

        # Validate input
        try:
            validated = validate_api_request('generate', {
                'prompt': request.prompt,
                'tickers': request.tickers,
                'start_date': request.start_date,
                'end_date': request.end_date
            })
        except BaseValidationError as e:
            return {
                "success": False,
                "error": {
                    "type": "ValidationError",
                    "message": e.message,
                    "field": e.field
                },
                "data": None
            }

        # Generate code
        code, error_msg = generate_strategy_code(
            validated.prompt,
            validated.tickers,
            validated.start_date,
            validated.end_date
        )

        if code is None:
            logger.error(f"Strategy generation failed: {error_msg}")
            return {
                "success": False,
                "error": {
                    "type": "GenerationError",
                    "message": f"LLM Generation failed: {error_msg}",
                    "details": "Check backend logs and API Key configuration"
                },
                "data": {
                    "code": f"# Generation failed.\n# Error: {error_msg}",
                    "output": ""
                }
            }

        # Try to validate and fix the code
        attempts = 0
        max_retries = 2  # Reduced from 5 to prevent long wait times
        last_error = None

        import time
        total_start = time.time()

        while attempts < max_retries:
            logger.info(f"Attempt {attempts + 1}: Testing generated strategy")
            test_start = time.time()

            # Dry run with validation
            exec_result = execute_strategy(code)

            test_elapsed = time.time() - test_start
            logger.info(f"Strategy execution test took {test_elapsed:.2f}s")

            if exec_result["success"]:
                logger.info(f"Strategy generated successfully after {attempts + 1} attempts")
                return {
                    "success": True,
                    "data": {
                        "code": code,
                        "output": exec_result.get("output", ""),
                        "validation": exec_result.get("validation", {}),
                    },
                    "attempts": attempts + 1,
                    "message": "Strategy generated and validated successfully"
                }

            # Failure -> Fix
            last_error = exec_result.get("error", "Unknown error")
            logger.warning(f"Attempt {attempts + 1} failed. Error: {last_error}")

            fix_start = time.time()
            code = fix_strategy_code(code, last_error)
            fix_elapsed = time.time() - fix_start
            logger.info(f"Code fix request took {fix_elapsed:.2f}s")
            attempts += 1

        # If we fail after all retries
        logger.error(f"Strategy generation failed after {max_retries} attempts")
        return {
            "success": False,
            "error": {
                "type": "GenerationError",
                "message": f"Failed after {max_retries} attempts",
                "details": last_error,
                "attempts": attempts
            },
            "data": {
                "code": code,
                "output": exec_result.get("output", "") if 'exec_result' in locals() else ""
            }
        }

    except Exception as e:
        logger.error(f"Strategy generation failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/run")
async def run_strategy_endpoint(request: RunRequest):
    """
    Execute a trading strategy.
    If use_database is True, fetches data from PostgreSQL instead of yfinance.
    """
    try:
        logger.info(f"Running strategy (length: {len(request.code)} chars)")

        # Validate input
        try:
            validated = validate_api_request('run', {'code': request.code})
        except BaseValidationError as e:
            return {
                "success": False,
                "error": {
                    "type": "ValidationError",
                    "message": e.message,
                    "field": e.field
                },
                "data": None
            }

        # Execute strategy
        result = execute_strategy(validated.code)

        if result["success"]:
            logger.info("Strategy executed successfully")
            return {
                "success": True,
                "data": {
                    "output": result.get("output", ""),
                    "stats": result.get("stats", {}),
                    "equity": result.get("equity", []),
                    "ohlcv": result.get("ohlcv", []),
                    "drawdown": result.get("drawdown", {}),
                    "benchmark_drawdown": result.get("benchmark_drawdown", {}),
                    "trades": result.get("trades", []),
                    "indicators": result.get("indicators", [])
                },
                "message": "Strategy executed successfully"
            }
        else:
            logger.error(f"Strategy execution failed: {result.get('error')}")
            return {
                "success": False,
                "error": {
                    "type": "ExecutionError",
                    "message": "Strategy execution failed",
                    "details": result.get("error", "Unknown error")
                },
                "data": {
                    "output": result.get("output", "")
                }
            }

    except Exception as e:
        logger.error(f"Strategy execution failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/optimize")
async def optimize_strategy_endpoint(request: OptimizeRequest):
    """
    Run parameter optimization on a strategy.
    Uses walk-forward optimization by default.
    """
    try:
        logger.info(f"Starting optimization with params: {request.strategy_params}")

        # Validate input
        try:
            validated = validate_api_request('optimize', {
                'code': request.code,
                'strategy_params': request.strategy_params,
                'config': request.config
            })
        except BaseValidationError as e:
            return {
                "success": False,
                "error": {
                    "type": "ValidationError",
                    "message": e.message,
                    "field": e.field
                },
                "data": None
            }

        # Run optimization
        result = run_optimization(
            validated.code,
            validated.strategy_params,
            validated.config
        )

        # Check if there was an error
        if result.get("output", "").startswith("Optimization Error") or result.get("output", "").startswith("\nOptimization Error"):
            logger.error(f"Optimization failed: {result.get('output', '')}")
            return {
                "success": False,
                "error": {
                    "type": "OptimizationError",
                    "message": "Optimization failed",
                    "details": result.get("output", "")
                },
                "data": result
            }

        logger.info("Optimization completed successfully")
        return {
            "success": True,
            "data": result,
            "message": "Optimization completed successfully"
        }

    except Exception as e:
        import traceback
        logger.error(f"Optimization failed: {e}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": str(e),
            "details": traceback.format_exc()
        }


@router.post("/true-wfo")
async def run_true_wfo(request: TrueWFORequest):
    """
    Run True Walk-Forward Optimization.

    For each rolling window:
    1. Optimize parameters on training data
    2. Get signal from training window's last day for the NEXT day
    3. Trade only on that next day (first day of test window)
    4. Maintain portfolio state across windows
    """
    try:
        logger.info(f"Starting True WFO with params: {request.strategy_params}")

        # Validate input
        try:
            validated = validate_api_request('true-wfo', {
                'code': request.code,
                'strategy_params': request.strategy_params,
                'config': request.config
            })
        except BaseValidationError as e:
            return {
                "success": False,
                "error": {
                    "type": "ValidationError",
                    "message": e.message,
                    "field": e.field
                },
                "data": None
            }

        # Import DataService for code execution
        from app.services.data_service import DataService
        import io

        # Create result dict with output buffer
        output_buffer = io.StringIO()
        result = {
            'output': '',
            'stats': {},
            'equity': [],
            'oos_equity': [],
            'trades': [],
            'windows': []
        }

        # Get parameter names and combinations from strategy_params
        strategy_params = validated.strategy_params
        param_names = list(strategy_params.keys())

        # Build combinations - handle both dict ranges and list values
        param_values_list = []
        for name in param_names:
            param_val = strategy_params[name]
            if isinstance(param_val, dict) and "start" in param_val:
                # Range format: {start, stop, step}
                start = float(param_val["start"])
                stop = float(param_val["stop"])
                step = float(param_val["step"])
                vals = np.arange(start, stop + step/1000, step).tolist()
                # Round for cleaner display
                vals = [round(x, 4) if isinstance(x, float) else x for x in vals]
                if int(step) == step and int(start) == start:
                    vals = [int(x) for x in vals]
            else:
                # Direct list format
                vals = param_val if isinstance(param_val, list) else [param_val]
            param_values_list.append(vals)

        # Generate Cartesian Product
        combinations = list(itertools.product(*param_values_list))

        # Run True WFO
        result = run_continuous_true_wfo(
            validated.code,                    # Original code
            validated.code,                    # Modified code (same for WFO)
            strategy_params,
            validated.config,
            param_names,
            combinations,
            'sharpe',                          # Default metric
            result,
            output_buffer
        )

        # Check if there was an error in output
        if "ERROR:" in result.get("output", ""):
            logger.error(f"True WFO failed: {result.get('output', '')}")
            return {
                "success": False,
                "error": {
                    "type": "TrueWFOError",
                    "message": "True WFO failed",
                    "details": result.get("output", "")
                },
                "data": result
            }

        logger.info("True WFO completed successfully")
        return {
            "success": True,
            "data": result,
            "message": "True WFO completed successfully"
        }

    except Exception as e:
        import traceback
        logger.error(f"True WFO failed: {e}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": str(e),
            "details": traceback.format_exc()
        }


@router.post("/chat")
async def chat_about_code_endpoint(request: ChatRequest):
    """
    Chat about strategy code with AI.
    Maintains conversation context for iterative refinement.
    """
    try:
        logger.info(f"Chat request (code length: {len(request.code)} chars, messages: {len(request.messages)})")

        if not is_llm_available():
            return {
                "success": False,
                "error": {
                    "type": "ConfigurationError",
                    "message": "Local LLM not available. Ensure the model server is running on port 11434 with kimi-k2.5:cloud model."
                },
                "data": None
            }

        # Call the chat function
        response, error_msg = chat_about_code(
            code=request.code,
            messages=request.messages
        )

        if error_msg:
            logger.error(f"Chat error: {error_msg}")
            return {
                "success": False,
                "error": {
                    "type": "ChatError",
                    "message": error_msg
                },
                "data": {
                    "response": None
                }
            }

        logger.info("Chat response generated successfully")
        return {
            "success": True,
            "data": {
                "response": response
            }
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
        # Validate the strategy code before saving
        validation = StrategyValidator.validate_strategy_code(strategy.code)
        if not validation["valid"]:
            return {
                "success": False,
                "error": {
                    "type": "ValidationError",
                    "message": "Strategy code validation failed",
                    "details": validation["errors"]
                }
            }

        # Sanitize filename
        safe_name = sanitize_filename(strategy.name)

        strategies_dir = "../strategies"
        if not os.path.exists(strategies_dir):
            os.makedirs(strategies_dir)

        # Additional path validation
        path = os.path.join(strategies_dir, safe_name)
        if not validate_file_path(path, strategies_dir):
            raise SecurityValidationError("Invalid file path")

        # Save with backup if exists
        import shutil
        backup_path = None
        if os.path.exists(path):
            backup_path = f"{path}.backup"
            shutil.copy2(path, backup_path)
            logger.info(f"Created backup: {backup_path}")

        with open(path, "w", encoding="utf-8") as f:
            f.write(strategy.code)

        logger.info(f"Strategy saved: {safe_name}")

        return {
            "success": True,
            "data": {
                "path": path,
                "filename": safe_name,
                "backup_created": backup_path is not None
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
        safe_name = sanitize_filename(name)
        strategies_dir = "../strategies"
        path = os.path.join(strategies_dir, safe_name)

        # Path validation
        if not validate_file_path(path, strategies_dir):
            raise SecurityValidationError("Invalid file path")

        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Strategy not found")

        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        logger.info(f"Strategy loaded: {safe_name}")

        return {
            "success": True,
            "data": {
                "name": name,
                "code": content,
                "filename": safe_name,
                "size": len(content)
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
        safe_name = sanitize_filename(name)
        strategies_dir = "../strategies"
        path = os.path.join(strategies_dir, safe_name)

        # Path validation
        if not validate_file_path(path, strategies_dir):
            raise SecurityValidationError("Invalid file path")

        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="Strategy not found")

        # Create backup before deletion
        import shutil
        backup_path = f"{path}.deleted"
        shutil.copy2(path, backup_path)
        os.remove(path)

        logger.info(f"Strategy deleted: {safe_name} (backup: {backup_path})")

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


@router.get("/indicators")
async def list_indicators():
    """List available technical indicators."""
    try:
        indicators = get_indicator_list()
        return {
            "success": True,
            "data": {
                "indicators": indicators,
                "count": len(indicators)
            },
            "message": f"Found {len(indicators)} indicators"
        }
    except Exception as e:
        logger.error(f"Error listing indicators: {e}")
        raise HTTPException(status_code=500, detail=str(e))
