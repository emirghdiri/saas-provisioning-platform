from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import Tenant
from app.routes import router


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="SaaS Provisioning Platform API",
    version="1.0.0"
)


# ==============================
# CORS
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# ROUTES
# ==============================

app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "SaaS Provisioning Platform API",
        "status": "running"
    }
    