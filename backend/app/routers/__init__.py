from app.routers.auth import router as auth_router
from app.routers.places import router as places_router
from app.routers.reviews import router as reviews_router

__all__ = ["auth_router", "places_router", "reviews_router"]
