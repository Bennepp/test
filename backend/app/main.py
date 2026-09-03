from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import avatars, bancho, score_submission, web_api

settings = get_settings()

app = FastAPI(title=settings.server_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"https://{settings.domain}", f"http://{settings.domain}"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# `c.<domain>` - Bancho/IRC handshake + packet stream.
app.include_router(bancho.router)
# `osu.<domain>` - score submission, beatmap web endpoints.
app.include_router(score_submission.router)
# `a.<domain>` + `osu.<domain>/api` - avatar storage.
app.include_router(avatars.router)
# JSON API for the web frontend.
app.include_router(web_api.router)


@app.get("/_health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
