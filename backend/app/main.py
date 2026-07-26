from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from app.routers import places
from app.routers import auth
from app.routers import reviews
from app.routers import menu
from app.database.database import engine, Base

Base.metadata.create_all(bind=engine)

def migrate_schema():
    inspector = inspect(engine)
    with engine.connect() as conn:
        if "avatar" not in [c["name"] for c in inspector.get_columns("users")]:
            conn.execute(text("ALTER TABLE users ADD COLUMN avatar TEXT"))
        if "nguoidung_id" not in [c["name"] for c in inspector.get_columns("places")]:
            conn.execute(text("ALTER TABLE places ADD COLUMN nguoidung_id INTEGER REFERENCES users(id)"))
        conn.commit()

migrate_schema()

app = FastAPI(
    title="FoodMap Vietnam API",
    description="API for FoodMap Vietnam - Khám phá ẩm thực đường phố",
    version="1.0.0",
)

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "https://cam-nang-du-lich.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(places.router)
app.include_router(auth.router)
app.include_router(reviews.router)
app.include_router(menu.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FoodMap API is running"}
