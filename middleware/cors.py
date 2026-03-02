from fastapi.middleware.cors import CORSMiddleware
from config.app import settings

def add_cors_middleware(app):
    """
    Add CORS middleware to the FastAPI application.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
