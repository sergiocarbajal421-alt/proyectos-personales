from supabase import create_client, Client
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_secret_key: str
    gestion_frontend_url: str = "http://localhost:5173"

    @property
    def frontend_url(self): return self.gestion_frontend_url

    class Config:
        env_file = "../../.env"


settings = Settings()

_client: Client | None = None


def get_db() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.supabase_url, settings.supabase_secret_key)
    return _client
