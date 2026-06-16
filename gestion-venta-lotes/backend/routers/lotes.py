from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from database import get_db
from models import LoteResponse, NuevaVenta, ResumenGeneral, LetraCreate
from datetime import date
from dateutil.relativedelta import relativedelta
from typing import Optional

router = APIRouter(prefix="/lotes", tags=["Lotes"])

SCHEMA = "gestion"


@router.get("/", response_model=list[LoteResponse])
def listar_lotes(
    estado: Optional[str] = None,
    manzana: Optional[str] = None,
    cliente: Optional[str] = None,
    db: Client = Depends(get_db),
):
    query = db.schema(SCHEMA).table("vista_lotes").select("*")
    if estado:
        query = query.eq("estado", estado)
    if manzana:
        query = query.eq("manzana", manzana)
    if cliente:
        query = query.ilike("cliente", f"%{cliente}%")
    return query.execute().data


@router.get("/resumen", response_model=ResumenGeneral)
def resumen_general(db: Client = Depends(get_db)):
    lotes = db.schema(SCHEMA).table("vista_lotes").select("*").execute().data
    vendidos    = [l for l in lotes if l["estado"] == "Vendido"]
    disponibles = [l for l in lotes if l["estado"] == "Disponible"]

    # Pagos adicionales y documentos (disponibles tras migración v2)
    total_pa, docs_pendientes, docs_completados = 0.0, 0, 0
    try:
        pa = db.schema(SCHEMA).table("pagos_adicionales").select("monto").execute().data
        total_pa = sum(r["monto"] for r in pa)
        docs = db.schema(SCHEMA).table("documentos").select("estado").execute().data
        docs_pendientes   = sum(1 for d in docs if d["estado"] == "Pendiente")
        docs_completados  = sum(1 for d in docs if d["estado"] == "Completado")
    except Exception:
        pass   # tablas aún no creadas (migración no ejecutada)

    # La "inicial" se cobra al firmar el contrato y nunca genera una letra,
    # así que monto_pagado (suma de letras) no la incluye: hay que sumarla
    # aparte para que el recaudado refleje el efectivo realmente cobrado.
    total_letras_pagadas = sum(l["monto_pagado"] or 0 for l in lotes)
    total_inicial         = sum(l["inicial"] or 0 for l in vendidos)

    return ResumenGeneral(
        total_vendidos               = len(vendidos),
        total_disponibles            = len(disponibles),
        total_venta                  = sum(l["precio"] or 0 for l in lotes),
        total_recaudado              = total_letras_pagadas + total_inicial,
        total_inicial                = total_inicial,
        total_pendiente              = sum(l["monto_pendiente"] or 0 for l in lotes),
        total_atrasado               = sum(l["monto_atrasado"] or 0 for l in lotes),
        total_pagos_adicionales      = total_pa,
        total_documentos_pendientes  = docs_pendientes,
        total_documentos_completados = docs_completados,
    )


@router.post("/venta", response_model=LoteResponse, status_code=201)
def registrar_venta(venta: NuevaVenta, db: Client = Depends(get_db)):
    lote_res = (
        db.schema(SCHEMA).table("lotes")
        .select("*").eq("lote", venta.lote).single().execute()
    )
    if not lote_res.data:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    if lote_res.data["estado"] != "Disponible":
        raise HTTPException(status_code=400, detail="El lote ya está vendido")

    n = venta.cantidad_letras
    precio_total = ((n - 1) * venta.monto_mensual) + venta.cuota_final + venta.inicial

    db.schema(SCHEMA).table("lotes").update({
        "estado": "Vendido", "cliente": venta.cliente,
        "fecha_contrato": str(venta.fecha_contrato),
        "inicial": venta.inicial, "precio": precio_total,
    }).eq("lote", venta.lote).execute()

    letras = []
    for i in range(1, n + 1):
        fecha = venta.fecha_contrato + relativedelta(months=i)
        monto = venta.monto_mensual if i < n else venta.cuota_final
        letras.append({"lote": venta.lote, "numero_letra": i,
                       "fecha_pago": str(fecha), "monto": monto, "estado": "Pendiente"})
    db.schema(SCHEMA).table("letras").insert(letras).execute()

    updated = (
        db.schema(SCHEMA).table("vista_lotes")
        .select("*").eq("lote", venta.lote).single().execute()
    )
    return updated.data
