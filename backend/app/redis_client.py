from functools import lru_cache

from redis.asyncio import Redis

from app.config import get_settings


@lru_cache
def get_redis() -> Redis:
    settings = get_settings()
    # decode_responses=False: leaderboard scores/session blobs are handled as
    # bytes/str explicitly where needed; packet-adjacent data stays binary-safe.
    return Redis.from_url(settings.redis_dsn)
