from fastapi import APIRouter, Depends
from supabase import Client
from database import get_db

router = APIRouter(prefix="/cv", tags=["Curriculum"])


@router.get("/", summary="Devuelve todo el CV en una sola llamada")
def get_cv(db: Client = Depends(get_db)):
    s = db.schema("curriculum")
    perfil      = s.table("perfil").select("*").limit(1).execute().data
    habilidades = s.table("habilidades").select("*").order("orden").execute().data
    experiencia = s.table("experiencia").select("*").order("orden").execute().data
    formacion   = s.table("formacion").select("*").order("orden").execute().data
    proyectos   = s.table("proyectos").select("*").order("orden").execute().data
    redes       = s.table("redes_sociales").select("*").order("orden").execute().data

    return {
        "perfil":      perfil[0] if perfil else {},
        "habilidades": habilidades,
        "experiencia": experiencia,
        "formacion":   formacion,
        "proyectos":   proyectos,
        "redes":       redes,
    }


@router.get("/perfil")
def get_perfil(db: Client = Depends(get_db)):
    result = db.schema("curriculum").table("perfil").select("*").limit(1).execute()
    return result.data[0] if result.data else {}


@router.get("/habilidades")
def get_habilidades(db: Client = Depends(get_db)):
    return db.schema("curriculum").table("habilidades").select("*").order("orden").execute().data


@router.get("/experiencia")
def get_experiencia(db: Client = Depends(get_db)):
    return db.schema("curriculum").table("experiencia").select("*").order("orden").execute().data


@router.get("/proyectos")
def get_proyectos(db: Client = Depends(get_db)):
    return db.schema("curriculum").table("proyectos").select("*").order("orden").execute().data
