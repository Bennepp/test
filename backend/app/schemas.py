import re

from pydantic import BaseModel, EmailStr, field_validator

USERNAME_RE = re.compile(r"^[A-Za-z0-9 _\[\]-]{2,15}$")


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        if not USERNAME_RE.fullmatch(value):
            raise ValueError("username must be 2-15 chars: letters, numbers, spaces, _ [ ] -")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not (8 <= len(value) <= 32):
            raise ValueError("password must be 8-32 characters")
        return value


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    country: str
    pp: float
    accuracy: float
    play_count: int
    total_score: int
    avatar_url: str


class UserSearchResult(BaseModel):
    user_id: int
    username: str
    country: str


class ProfileResponse(BaseModel):
    user_id: int
    username: str
    country: str
    created_at: str
    stats: list["ModeStats"]


class ModeStats(BaseModel):
    mode: int
    relax: bool
    pp: float
    accuracy: float
    play_count: int
    ranked_score: int
    total_score: int
    global_rank: int
