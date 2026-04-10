"""
Health check router for TradeCraft API.
"""

from datetime import datetime
from fastapi import APIRouter

from app.db import database

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Health check endpoint with database status.
    Returns detailed health information for monitoring.
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "database": {
                "connected": database.db_connected,
                "host": database.DB_HOST,
                "port": database.DB_PORT,
                "name": database.DB_NAME
            }
        }
    }


@router.get("/db-status")
async def database_status():
    """
    Database connection status endpoint for frontend polling.
    """
    return {
        "connected": database.db_connected,
        "status": "connected" if database.db_connected else "disconnected"
    }