from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str = "mongodb://root:interactive@localhost:27017/interactive?authSource=admin"
    database_name: str = "interactive"
    cors_origins: str = "http://localhost:5173"
    media_url_allowlist: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def allowlist_suffixes(self) -> list[str]:
        return [s.strip().lower() for s in self.media_url_allowlist.split(",") if s.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
