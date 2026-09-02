"""Central configuration, sourced entirely from environment variables.

Every domain, IP bind, and secret lives here so that moving the stack from
localhost to a public VPS domain never requires touching application code -
only the `.env` file.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Root domain the stack is served under, e.g. "localhost" or "myserver.com".
    # osu! is launched with `-devserver <domain>` and expects c./osu./a. subdomains.
    domain: str = "localhost"

    # Bind addresses (container-internal, proxied by nginx/caddy).
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    db_host: str = "mysql"
    db_port: int = 3306
    db_user: str = "bancho"
    db_password: str = "changeme"
    db_name: str = "bancho"

    # Redis
    redis_host: str = "redis"
    redis_port: int = 6379
    redis_db: int = 0

    # Secrets
    jwt_secret: str = "changeme-please-use-a-long-random-value"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    # Misc
    server_name: str = "private-bancho"
    initial_privileges: int = 1  # normal, non-verified user

    @property
    def sqlalchemy_dsn(self) -> str:
        return (
            f"mysql+asyncmy://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def redis_dsn(self) -> str:
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"


@lru_cache
def get_settings() -> Settings:
    return Settings()
