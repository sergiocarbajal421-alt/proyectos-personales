from pydantic import BaseModel
from typing import Optional
from datetime import date


class AccidenteResponse(BaseModel):
    id: int
    fecha: Optional[date]
    hora: Optional[str]
    modalidad: Optional[str]
    cant_fallecidos: int = 0
    cant_heridos: int = 0
    latitud: Optional[float]
    longitud: Optional[float]
    departamento: Optional[str]
    provincia: Optional[str]
    distrito: Optional[str]

    class Config:
        from_attributes = True


class FiltrosAccidentes(BaseModel):
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    departamentos: Optional[list[str]] = None
    modalidades: Optional[list[str]] = None


class KPIs(BaseModel):
    total_accidentes: int
    total_fallecidos: int
    total_heridos: int
    departamentos_afectados: int


class OpcionFiltro(BaseModel):
    departamentos: list[str]
    modalidades: list[str]
    fecha_min: Optional[date]
    fecha_max: Optional[date]
