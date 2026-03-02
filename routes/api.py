from fastapi import APIRouter
from controllers.creature_controller import router as creature_router
from controllers.health_controller import router as health_router

api_router = APIRouter(prefix="/api/v1")

# Include all route modules
api_router.include_router(creature_router)
api_router.include_router(health_router)
