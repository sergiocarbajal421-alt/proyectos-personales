# 📋 Gestión de Venta de Lotes

Migración completa de Streamlit + Excel → **FastAPI + React + Supabase**

## Stack
| Capa | Tecnología |
|------|-----------|
| Frontend | Vite + React 18 |
| Backend | FastAPI + Python |
| Base de datos | Supabase (PostgreSQL) |
| Deploy | Render |

---

## 🗄️ 1. Configurar Supabase

Ejecuta el archivo `supabase/migration.sql` en el **SQL Editor** de tu proyecto Supabase.

---

## ⚙️ 2. Backend (FastAPI)

```bash
cd backend
cp .env.example .env        # ya tiene las credenciales
pip install -r requirements.txt
uvicorn main:app --reload
```

API disponible en: http://localhost:8000  
Docs interactivos: http://localhost:8000/docs

---

## 🖥️ 3. Frontend (React)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App en: http://localhost:5173

---

## 🚀 4. Deploy en Render

### Backend
1. Crear nuevo **Web Service** en Render
2. Conectar el repositorio → carpeta `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Variables de entorno:
   - `SUPABASE_URL` = https://mtbrjddbilrfhbmfqgaq.supabase.co
   - `SUPABASE_SECRET_KEY` = tu secret key
   - `FRONTEND_URL` = URL del frontend en Render

### Frontend
1. Crear nuevo **Static Site** en Render
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Variables de entorno:
   - `VITE_API_URL` = URL del backend en Render

---

Desarrollado por **Sergio Carbajal**
