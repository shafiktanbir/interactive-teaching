from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings
from app.routers.health import router as health_router
from app.routers.interactive_nodes import router as interactive_router
from app.routers.lessons import router as lessons_router
from app.seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongodb_uri)
    app.state.mongo_client = client
    app.state.db = client[settings.database_name]
    await seed_if_empty(app.state.db)
    yield
    client.close()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Interactive Teaching API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(health_router)
    app.include_router(lessons_router)
    app.include_router(interactive_router)
    return app


app = create_app()
