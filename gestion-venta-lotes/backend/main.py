from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import settings
from routers import lotes, letras, extras

app = FastAPI(
    title="Gestión de Venta de Lotes API",
    description="Backend para el sistema de gestión de venta de lotes inmobiliarios",
    version="1.0.0",
)

# CORS — permite al frontend React comunicarse con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173"],
    allow_origin_regex=r"http://localhost:\d+",   # dev: cualquier puerto local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lotes.router)
app.include_router(letras.router)
app.include_router(extras.router)


@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "app": "Gestión de Venta de Lotes API"}
