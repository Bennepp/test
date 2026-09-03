from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings

settings = get_settings()

# Lazy engine: constructing an AsyncEngine does not open a connection, so the
# app can still import/start (e.g. for tooling or tests) without a live DB.
engine = create_async_engine(settings.sqlalchemy_dsn, pool_pre_ping=True, pool_recycle=280)
async_session = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with async_session() as session:
        yield session
