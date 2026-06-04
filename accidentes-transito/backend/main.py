from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import settings
from routers import accidentes

app = FastAPI(
    title="Accidentes de Tránsito API",
    description="API para el sistema analítico de accidentes de tránsito Perú 2020–2021",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.accidentes_frontend_url,
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accidentes.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "app": "Accidentes de Tránsito API"}
