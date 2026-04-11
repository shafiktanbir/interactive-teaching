from app.routers.health import router as health_router
from app.routers.interactive_nodes import router as interactive_router
from app.routers.lessons import router as lessons_router

__all__ = ["health_router", "interactive_router", "lessons_router"]
