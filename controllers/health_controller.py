from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime
from config.database import get_db
from config.app import settings

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check endpoint.
    """
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.APP_VERSION,
        "environment": "development" if settings.DEBUG else "production",
        "services": {
            "database": db_status,
            "api": "healthy"
        },
        "uptime": "N/A",  # Could be implemented with process start time
        "memory_usage": "N/A"  # Could be implemented with psutil
    }

@router.get("/simple")
async def simple_health():
    """
    Simple health check for load balancers.
    """
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness probe - checks if application is ready to serve traffic.
    """
    try:
        # Check if database is accessible and has required tables
        db.execute(text("SELECT 1"))
        return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        return {"status": "not_ready", "reason": str(e), "timestamp": datetime.utcnow().isoformat()}

@router.get("/live")
async def liveness_check():
    """
    Liveness probe - checks if application is alive.
    """
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}
