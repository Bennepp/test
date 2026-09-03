from datetime import datetime

from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Integer, SmallInteger, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    username_safe: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    password_bcrypt: Mapped[str] = mapped_column(String(60))
    country: Mapped[str] = mapped_column(String(2), default="XX")
    privileges: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    latest_activity: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class Stats(Base):
    """One row per (user, game mode): osu!/taiko/catch/mania x vanilla/relax."""

    __tablename__ = "stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mode: Mapped[int] = mapped_column(SmallInteger)  # 0=std 1=taiko 2=catch 3=mania
    relax: Mapped[bool] = mapped_column(default=False)
    ranked_score: Mapped[int] = mapped_column(BigInteger, default=0)
    total_score: Mapped[int] = mapped_column(BigInteger, default=0)
    pp: Mapped[float] = mapped_column(Float, default=0.0)
    play_count: Mapped[int] = mapped_column(Integer, default=0)
    accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    max_combo: Mapped[int] = mapped_column(Integer, default=0)
    global_rank: Mapped[int] = mapped_column(Integer, default=0)


class Beatmap(Base):
    __tablename__ = "beatmaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    set_id: Mapped[int] = mapped_column(Integer, index=True)
    md5: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    artist: Mapped[str] = mapped_column(String(128))
    title: Mapped[str] = mapped_column(String(128))
    version: Mapped[str] = mapped_column(String(128))
    creator: Mapped[str] = mapped_column(String(32))
    status: Mapped[int] = mapped_column(SmallInteger, default=0)  # ranked status
    mode: Mapped[int] = mapped_column(SmallInteger, default=0)
    star_rating: Mapped[float] = mapped_column(Float, default=0.0)


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    beatmap_md5: Mapped[str] = mapped_column(String(32), index=True)
    mode: Mapped[int] = mapped_column(SmallInteger)
    relax: Mapped[bool] = mapped_column(default=False)
    mods: Mapped[int] = mapped_column(Integer, default=0)
    score: Mapped[int] = mapped_column(BigInteger)
    pp: Mapped[float] = mapped_column(Float, default=0.0)
    accuracy: Mapped[float] = mapped_column(Float)
    max_combo: Mapped[int] = mapped_column(Integer)
    count_300: Mapped[int] = mapped_column(Integer, default=0)
    count_100: Mapped[int] = mapped_column(Integer, default=0)
    count_50: Mapped[int] = mapped_column(Integer, default=0)
    count_miss: Mapped[int] = mapped_column(Integer, default=0)
    count_geki: Mapped[int] = mapped_column(Integer, default=0)
    count_katu: Mapped[int] = mapped_column(Integer, default=0)
    perfect: Mapped[bool] = mapped_column(default=False)
    passed: Mapped[bool] = mapped_column(default=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
