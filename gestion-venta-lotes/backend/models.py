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
    # Nuevos campos (opcionales — llegan solo cuando existe la columna en la vista)
    tipo_lote:     Optional[str]   = None
    orientacion:   Optional[str]   = None
    frente:        Optional[float] = None
    fondo:         Optional[float] = None
    dni:           Optional[str]   = None
    telefono:      Optional[str]   = None
    observaciones: Optional[str]   = None

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
    fecha_pago_real: Optional[date] = None   # nuevo

    class Config:
        from_attributes = True


class LetraUpdate(BaseModel):
    estado: str = Field(..., pattern="^(Pendiente|Pagado)$")
    fecha_pago_real: Optional[date] = None   # registrar cuándo se cobró


# ─── VENTA ────────────────────────────────────────────────────────────────────

class NuevaVenta(BaseModel):
    lote: str
    cliente: str
    fecha_contrato: date
    inicial: float
    cantidad_letras: int = Field(..., ge=1)
    monto_mensual: float = Field(..., ge=0)
    cuota_final: float = Field(..., ge=0)


# ─── PAGOS ADICIONALES ────────────────────────────────────────────────────────

class PagoAdicionalResponse(BaseModel):
    id: int
    lote: str
    concepto: str
    monto: float
    fecha: date
    tipo: str

    class Config:
        from_attributes = True


# ─── DOCUMENTOS ───────────────────────────────────────────────────────────────

class DocumentoResponse(BaseModel):
    id: int
    lote: str
    tipo: str
    estado: str
    fecha_emision: Optional[date] = None
    observaciones: Optional[str] = None

    class Config:
        from_attributes = True


# ─── RESUMEN ──────────────────────────────────────────────────────────────────

class ResumenGeneral(BaseModel):
    total_vendidos: int
    total_disponibles: int
    total_venta: float
    total_recaudado: float
    total_inicial: float
    total_pendiente: float
    total_atrasado: float
    # Enriquecidos
    total_pagos_adicionales: float = 0
    total_documentos_pendientes: int = 0
    total_documentos_completados: int = 0
