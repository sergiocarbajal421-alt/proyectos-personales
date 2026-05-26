from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


# ─── LOTES ────────────────────────────────────────────────────────────────────

class LoteBase(BaseModel):
    lote: str
    estado: str = "Disponible"
    area: Optional[float] = None
    precio: Optional[float] = None
    inicial: Optional[float] = None
    cliente: Optional[str] = None
    fecha_contrato: Optional[date] = None


class LoteCreate(LoteBase):
    pass


class LoteResponse(LoteBase):
    id: int
    manzana: Optional[str] = None
    monto_letras: float = 0
    monto_pagado: float = 0
    monto_pendiente: float = 0
    monto_atrasado: float = 0

    class Config:
        from_attributes = True


# ─── LETRAS ───────────────────────────────────────────────────────────────────

class LetraBase(BaseModel):
    lote: str
    numero_letra: int
    fecha_pago: date
    monto: float
    estado: str = "Pendiente"


class LetraCreate(LetraBase):
    pass


class LetraResponse(LetraBase):
    id: int

    class Config:
        from_attributes = True


class LetraUpdate(BaseModel):
    estado: str = Field(..., pattern="^(Pendiente|Pagado)$")


# ─── VENTA ────────────────────────────────────────────────────────────────────

class NuevaVenta(BaseModel):
    lote: str
    cliente: str
    fecha_contrato: date
    inicial: float
    cantidad_letras: int = Field(..., ge=1)
    monto_mensual: float = Field(..., ge=0)
    cuota_final: float = Field(..., ge=0)


# ─── RESUMEN ──────────────────────────────────────────────────────────────────

class ResumenGeneral(BaseModel):
    total_vendidos: int
    total_disponibles: int
    total_venta: float
    total_recaudado: float
    total_pendiente: float
    total_atrasado: float
