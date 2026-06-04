from fastapi import APIRouter, Depends, Query
from supabase import Client
from database import get_db
from models import KPIs, OpcionFiltro
from typing import Optional
from datetime import date

router = APIRouter(prefix="/accidentes", tags=["Accidentes"])

TABLE = "accidentes.accidentes_transito"


def build_query(db: Client, fecha_inicio=None, fecha_fin=None,
                departamentos=None, modalidades=None):
    q = db.schema("accidentes").table("accidentes_transito").select("*")
    if fecha_inicio:
        q = q.gte("fecha", str(fecha_inicio))
    if fecha_fin:
        q = q.lte("fecha", str(fecha_fin))
    if departamentos:
        q = q.in_("departamento", departamentos)
    if modalidades:
        q = q.in_("modalidad", modalidades)
    return q


@router.get("/", summary="Lista accidentes con filtros opcionales")
def listar_accidentes(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin:    Optional[date] = Query(None),
    departamentos: Optional[str] = Query(None, description="Separados por coma"),
    modalidades:   Optional[str] = Query(None, description="Separados por coma"),
    limit: int = Query(1000, le=5000),
    offset: int = Query(0),
    db: Client = Depends(get_db),
):
    deptos = [d.strip() for d in departamentos.split(",")] if departamentos else None
    mods   = [m.strip() for m in modalidades.split(",")]   if modalidades   else None

    q = build_query(db, fecha_inicio, fecha_fin, deptos, mods)
    result = q.range(offset, offset + limit - 1).execute()
    return result.data


@router.get("/kpis", response_model=KPIs)
def kpis(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin:    Optional[date] = Query(None),
    departamentos: Optional[str] = Query(None),
    modalidades:   Optional[str] = Query(None),
    db: Client = Depends(get_db),
):
    deptos = [d.strip() for d in departamentos.split(",")] if departamentos else None
    mods   = [m.strip() for m in modalidades.split(",")]   if modalidades   else None

    q = build_query(db, fecha_inicio, fecha_fin, deptos, mods)
    data = q.execute().data

    return KPIs(
        total_accidentes     = len(data),
        total_fallecidos     = sum(r.get("cant_fallecidos") or 0 for r in data),
        total_heridos        = sum(r.get("cant_heridos") or 0 for r in data),
        departamentos_afectados = len({r.get("departamento") for r in data if r.get("departamento")}),
    )


@router.get("/filtros", response_model=OpcionFiltro)
def opciones_filtro(db: Client = Depends(get_db)):
    """Devuelve los valores únicos disponibles para los filtros."""
    data = (
        db.schema("accidentes")
        .table("accidentes_transito")
        .select("departamento, modalidad, fecha")
        .execute()
        .data
    )
    deptos = sorted({r["departamento"] for r in data if r.get("departamento")})
    mods   = sorted({r["modalidad"]    for r in data if r.get("modalidad")})
    fechas = [r["fecha"] for r in data if r.get("fecha")]

    return OpcionFiltro(
        departamentos = deptos,
        modalidades   = mods,
        fecha_min     = min(fechas) if fechas else None,
        fecha_max     = max(fechas) if fechas else None,
    )


@router.get("/por-departamento", summary="Accidentes agrupados por departamento")
def por_departamento(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin:    Optional[date] = Query(None),
    db: Client = Depends(get_db),
):
    q = build_query(db, fecha_inicio, fecha_fin)
    data = q.execute().data
    conteo: dict = {}
    for r in data:
        dep = r.get("departamento") or "Sin datos"
        if dep not in conteo:
            conteo[dep] = {"departamento": dep, "accidentes": 0, "fallecidos": 0, "heridos": 0}
        conteo[dep]["accidentes"] += 1
        conteo[dep]["fallecidos"] += r.get("cant_fallecidos") or 0
        conteo[dep]["heridos"]    += r.get("cant_heridos") or 0
    return sorted(conteo.values(), key=lambda x: x["accidentes"], reverse=True)


@router.get("/por-modalidad", summary="Accidentes agrupados por modalidad")
def por_modalidad(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin:    Optional[date] = Query(None),
    db: Client = Depends(get_db),
):
    q = build_query(db, fecha_inicio, fecha_fin)
    data = q.execute().data
    conteo: dict = {}
    for r in data:
        mod = r.get("modalidad") or "Sin datos"
        if mod not in conteo:
            conteo[mod] = {"modalidad": mod, "accidentes": 0, "fallecidos": 0}
        conteo[mod]["accidentes"] += 1
        conteo[mod]["fallecidos"] += r.get("cant_fallecidos") or 0
    return sorted(conteo.values(), key=lambda x: x["accidentes"], reverse=True)


@router.get("/por-hora", summary="Accidentes agrupados por hora del día")
def por_hora(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin:    Optional[date] = Query(None),
    departamentos: Optional[str] = Query(None),
    modalidades:   Optional[str] = Query(None),
    db: Client = Depends(get_db),
):
    deptos = [d.strip() for d in departamentos.split(",")] if departamentos else None
    mods   = [m.strip() for m in modalidades.split(",")]   if modalidades   else None
    data = build_query(db, fecha_inicio, fecha_fin, deptos, mods).execute().data
    conteo = {h: {"hora": h, "label": f"{h:02d}:00", "accidentes": 0, "fallecidos": 0, "heridos": 0}
              for h in range(24)}
    for r in data:
        if not r.get("hora"):
            continue
        try:
            h = int(str(r["hora"]).split(":")[0])
            if 0 <= h < 24:
                conteo[h]["accidentes"] += 1
                conteo[h]["fallecidos"] += r.get("cant_fallecidos") or 0
                conteo[h]["heridos"]    += r.get("cant_heridos")    or 0
        except (ValueError, TypeError):
            pass
    return [conteo[h] for h in range(24)]


@router.get("/por-mes", summary="Evolución mensual de accidentes")
def por_mes(
    fecha_inicio: Optional[date] = Query(None),
    fecha_fin:    Optional[date] = Query(None),
    departamentos: Optional[str] = Query(None),
    db: Client = Depends(get_db),
):
    deptos = [d.strip() for d in departamentos.split(",")] if departamentos else None
    q = build_query(db, fecha_inicio, fecha_fin, deptos)
    data = q.execute().data
    conteo: dict = {}
    for r in data:
        if not r.get("fecha"):
            continue
        mes = r["fecha"][:7]  # YYYY-MM
        if mes not in conteo:
            conteo[mes] = {"mes": mes, "accidentes": 0, "fallecidos": 0, "heridos": 0}
        conteo[mes]["accidentes"] += 1
        conteo[mes]["fallecidos"] += r.get("cant_fallecidos") or 0
        conteo[mes]["heridos"]    += r.get("cant_heridos") or 0
    return sorted(conteo.values(), key=lambda x: x["mes"])
