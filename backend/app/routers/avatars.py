"""Avatar upload/serving.

Two consumers hit different paths on the same FastAPI app:
  - The website fetches `/api/avatar/{id}` same-origin (see frontend/lib/api.ts).
  - The osu! client requests bare `a.<domain>/{id}` (no /api prefix) - the
    Caddyfile proxies the whole a.<domain> vhost here, and the client's
    request path is dictated by the Bancho protocol, not by this app.
Both routers below serve the same files; keeping them separate makes each
one's auth/prefix requirements explicit instead of overloading one route.
"""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from app.auth import current_user_id

AVATARS_PATH = Path("/data/avatars")
MAX_AVATAR_BYTES = 5 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg"}

# Mounted at /api/avatar - used by the website (upload requires a login).
router = APIRouter(prefix="/api/avatar", tags=["avatar"])
# Mounted bare - used by the osu! client via the a.<domain> Caddy vhost.
client_router = APIRouter(tags=["avatar"])


def _resolve_avatar_path(user_id: int) -> Path:
    avatar_path = AVATARS_PATH / f"{user_id}.png"
    if not avatar_path.exists():
        avatar_path = AVATARS_PATH / "default.png"
    if not avatar_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="no avatar available")
    return avatar_path


@router.post("/", status_code=status.HTTP_200_OK)
async def upload_avatar(file: UploadFile, user_id: int = Depends(current_user_id)) -> dict[str, bool]:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="png or jpeg only")

    contents = await file.read(MAX_AVATAR_BYTES + 1)
    if len(contents) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="avatar too large (max 5MB)")

    AVATARS_PATH.mkdir(parents=True, exist_ok=True)
    (AVATARS_PATH / f"{user_id}.png").write_bytes(contents)
    return {"ok": True}


@router.get("/{user_id}")
async def get_avatar(user_id: int) -> FileResponse:
    return FileResponse(_resolve_avatar_path(user_id))


@client_router.get("/{user_id:int}")
async def get_avatar_for_client(user_id: int) -> FileResponse:
    return FileResponse(_resolve_avatar_path(user_id))
