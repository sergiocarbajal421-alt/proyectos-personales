from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import settings
from routers import cv

app = FastAPI(
    title="Curriculum API",
    description="API del portafolio personal de Sergio Carbajal",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.curriculum_frontend_url, "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cv.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "app": "Curriculum API"}
