"""
Endpoints para pagos_adicionales y documentos.
Disponibles tras ejecutar migration_v2.sql en Supabase.
"""
from fastapi import APIRouter, Depends, HTTPException
from supabase import Client
from database import get_db
from models import PagoAdicionalResponse, DocumentoResponse
from typing import Optional

router = APIRouter(tags=["Extras"])

SCHEMA = "gestion"


# ─── Pagos adicionales ────────────────────────────────────────────────────────

@router.get("/pagos-adicionales/{lote}", response_model=list[PagoAdicionalResponse])
def pagos_adicionales_por_lote(lote: str, db: Client = Depends(get_db)):
    return (
        db.schema(SCHEMA).table("pagos_adicionales")
        .select("*").eq("lote", lote).order("fecha").execute().data
    )


@router.get("/pagos-adicionales", response_model=list[PagoAdicionalResponse])
def todos_los_pagos_adicionales(tipo: Optional[str] = None, db: Client = Depends(get_db)):
    q = db.schema(SCHEMA).table("pagos_adicionales").select("*").order("fecha", desc=True)
    if tipo:
        q = q.eq("tipo", tipo)
    return q.execute().data


# ─── Documentos ───────────────────────────────────────────────────────────────

@router.get("/documentos/{lote}", response_model=list[DocumentoResponse])
def documentos_por_lote(lote: str, db: Client = Depends(get_db)):
    return (
        db.schema(SCHEMA).table("documentos")
        .select("*").eq("lote", lote).order("created_at").execute().data
    )


@router.get("/documentos", response_model=list[DocumentoResponse])
def todos_los_documentos(
    estado: Optional[str] = None,
    tipo: Optional[str] = None,
    db: Client = Depends(get_db),
):
    q = db.schema(SCHEMA).table("documentos").select("*")
    if estado:
        q = q.eq("estado", estado)
    if tipo:
        q = q.eq("tipo", tipo)
    return q.order("lote").execute().data
