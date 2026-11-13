from fastapi import APIRouter

from .endpoints import generations, models, platform

api_router = APIRouter()
api_router.include_router(platform.router)
api_router.include_router(models.router)
api_router.include_router(generations.router)
