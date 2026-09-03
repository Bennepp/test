"""JSON API consumed by the Next.js frontend: registration, login, leaderboard, profile."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import create_access_token, current_user_id
from app.db import get_session
from app.models import Stats, User
from app.schemas import (
    LeaderboardEntry,
    LoginRequest,
    ModeStats,
    ProfileResponse,
    RegisterRequest,
    TokenResponse,
    UserSearchResult,
)
from app.security import hash_plaintext_password, verify_plaintext_password

router = APIRouter(prefix="/api", tags=["web"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    existing = await session.scalar(select(User).where(User.username_safe == body.username.lower()))
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="username already taken")

    user = User(
        username=body.username,
        username_safe=body.username.lower(),
        email=body.email,
        password_bcrypt=hash_plaintext_password(body.password),
    )
    session.add(user)
    await session.flush()
    for mode in range(4):
        session.add(Stats(user_id=user.id, mode=mode, relax=False))
    await session.commit()

    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    user = await session.scalar(select(User).where(User.username_safe == body.username.lower()))
    if user is None or not verify_plaintext_password(body.password, user.password_bcrypt):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid username or password")
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def leaderboard(
    mode: int = 0,
    relax: bool = False,
    sort: str = "performance",
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
) -> list[LeaderboardEntry]:
    limit = max(1, min(limit, 100))
    order_column = Stats.total_score if sort == "score" else Stats.pp
    rows = await session.execute(
        select(Stats, User)
        .join(User, User.id == Stats.user_id)
        .where(Stats.mode == mode, Stats.relax == relax)
        .order_by(order_column.desc())
        .limit(limit)
    )
    return [
        LeaderboardEntry(
            rank=i + 1,
            user_id=user.id,
            username=user.username,
            country=user.country,
            pp=stats.pp,
            accuracy=stats.accuracy,
            play_count=stats.play_count,
            total_score=stats.total_score,
            # Same-origin path the website's <img> tags resolve directly;
            # the osu! client instead hits a.<domain>/{id} (see avatars.py).
            avatar_url=f"/api/avatar/{user.id}",
        )
        for i, (stats, user) in enumerate(rows.all())
    ]


@router.get("/users/search", response_model=list[UserSearchResult])
async def search_users(q: str, session: AsyncSession = Depends(get_session)) -> list[UserSearchResult]:
    q = q.strip()
    if not q:
        return []
    rows = await session.scalars(
        select(User).where(or_(User.username.ilike(f"%{q}%"))).limit(10)
    )
    return [
        UserSearchResult(user_id=u.id, username=u.username, country=u.country) for u in rows
    ]


@router.get("/profile/{user_id}", response_model=ProfileResponse)
async def profile(user_id: int, session: AsyncSession = Depends(get_session)) -> ProfileResponse:
    user = await session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")
    stats_rows = await session.scalars(select(Stats).where(Stats.user_id == user_id))
    return ProfileResponse(
        user_id=user.id,
        username=user.username,
        country=user.country,
        created_at=user.created_at.isoformat(),
        stats=[
            ModeStats(
                mode=s.mode,
                relax=s.relax,
                pp=s.pp,
                accuracy=s.accuracy,
                play_count=s.play_count,
                ranked_score=s.ranked_score,
                total_score=s.total_score,
                global_rank=s.global_rank,
            )
            for s in stats_rows
        ],
    )


@router.get("/me", response_model=ProfileResponse)
async def me(user_id: int = Depends(current_user_id), session: AsyncSession = Depends(get_session)) -> ProfileResponse:
    return await profile(user_id, session)
