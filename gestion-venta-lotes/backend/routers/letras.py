from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
from database import get_db
from models import LetraResponse, LetraUpdate

router = APIRouter(prefix="/letras", tags=["Letras"])


@router.get("/{lote_id}", response_model=list[LetraResponse])
def letras_de_lote(lote_id: str, db: Client = Depends(get_db)):
    """Obtiene todas las letras de un lote específico."""
    result = (
        db.table("letras")
        .select("*")
        .eq("lote", lote_id)
        .order("numero_letra")
        .execute()
    )
    return result.data


@router.patch("/{lote_id}/{numero_letra}", response_model=LetraResponse)
def actualizar_estado_letra(
    lote_id: str,
    numero_letra: int,
    body: LetraUpdate,
    db: Client = Depends(get_db),
):
    """Actualiza el estado de pago de una letra (Pendiente ↔ Pagado)."""
    result = (
        db.table("letras")
        .update({"estado": body.estado})
        .eq("lote", lote_id)
        .eq("numero_letra", numero_letra)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Letra no encontrada")
    return result.data[0]
