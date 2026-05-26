from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from database import get_db
from models import LoteResponse, NuevaVenta, ResumenGeneral, LetraCreate
from datetime import date
from dateutil.relativedelta import relativedelta
from typing import Optional

router = APIRouter(prefix="/lotes", tags=["Lotes"])


@router.get("/", response_model=list[LoteResponse])
def listar_lotes(
    estado: Optional[str] = None,
    manzana: Optional[str] = None,
    cliente: Optional[str] = None,
    db: Client = Depends(get_db),
):
    """Obtiene todos los lotes con montos calculados desde la vista."""
    query = db.table("vista_lotes").select("*")

    if estado:
        query = query.eq("estado", estado)
    if manzana:
        query = query.eq("manzana", manzana)
    if cliente:
        query = query.ilike("cliente", f"%{cliente}%")

    result = query.execute()
    return result.data


@router.get("/resumen", response_model=ResumenGeneral)
def resumen_general(db: Client = Depends(get_db)):
    """Devuelve métricas agregadas del estado general de lotes."""
    result = db.table("vista_lotes").select("*").execute()
    lotes = result.data

    vendidos    = [l for l in lotes if l["estado"] == "Vendido"]
    disponibles = [l for l in lotes if l["estado"] == "Disponible"]

    return ResumenGeneral(
        total_vendidos    = len(vendidos),
        total_disponibles = len(disponibles),
        total_venta       = sum(l["precio"] or 0 for l in lotes),
        total_recaudado   = sum(l["monto_pagado"] or 0 for l in lotes),
        total_pendiente   = sum(l["monto_pendiente"] or 0 for l in lotes),
        total_atrasado    = sum(l["monto_atrasado"] or 0 for l in lotes),
    )


@router.post("/venta", response_model=LoteResponse, status_code=201)
def registrar_venta(venta: NuevaVenta, db: Client = Depends(get_db)):
    """Registra la venta de un lote y genera sus letras de pago."""
    # Verificar que el lote existe y está disponible
    lote_res = (
        db.table("lotes")
        .select("*")
        .eq("lote", venta.lote)
        .single()
        .execute()
    )
    if not lote_res.data:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    if lote_res.data["estado"] != "Disponible":
        raise HTTPException(status_code=400, detail="El lote ya está vendido")

    # Calcular precio total
    n = venta.cantidad_letras
    precio_letras = ((n - 1) * venta.monto_mensual) + venta.cuota_final
    precio_total  = precio_letras + venta.inicial

    # Actualizar lote
    db.table("lotes").update({
        "estado":          "Vendido",
        "cliente":         venta.cliente,
        "fecha_contrato":  str(venta.fecha_contrato),
        "inicial":         venta.inicial,
        "precio":          precio_total,
    }).eq("lote", venta.lote).execute()

    # Crear letras
    letras = []
    for i in range(1, n + 1):
        fecha = venta.fecha_contrato + relativedelta(months=i)
        monto = venta.monto_mensual if i < n else venta.cuota_final
        letras.append({
            "lote":          venta.lote,
            "numero_letra":  i,
            "fecha_pago":    str(fecha),
            "monto":         monto,
            "estado":        "Pendiente",
        })
    db.table("letras").insert(letras).execute()

    # Retornar lote actualizado con montos calculados
    updated = (
        db.table("vista_lotes")
        .select("*")
        .eq("lote", venta.lote)
        .single()
        .execute()
    )
    return updated.data
