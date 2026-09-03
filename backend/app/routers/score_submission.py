"""Score submission stub: served on the `osu.<domain>` subdomain.

The osu! client POSTs to /web/osu-submit-modular-selector.php with an
AES(Rijndael-256-CBC)-encrypted, colon-separated score string plus a
plaintext `pass` (md5) field. Full decryption/legacy replay handling is
deliberately left as a documented hook: `submit_score` shows exactly where
the decrypted fields, PP calculation, and stats update need to be wired in.
"""
from __future__ import annotations

from fastapi import APIRouter, Form
from fastapi.responses import PlainTextResponse

from app.pp import calculate_pp

router = APIRouter(prefix="/web", tags=["score-submission"])


@router.post("/osu-submit-modular-selector.php")
async def submit_score(
    score: str = Form(...),
    iv: str = Form(default=""),
    password: str = Form(alias="pass", default=""),
    osu_version: str = Form(alias="osuver", default=""),
) -> PlainTextResponse:
    """Score submission handler stub.

    TODO (wiring, not yet implemented):
      1. Decrypt `score` with Rijndael-256-CBC using key
         f"osu!-scoreburgr---------{osu_version}" and IV `iv` (both base64).
      2. Split the decrypted string on ':' to get
         [beatmap_md5, username, score_md5, count300, count100, count50,
          countGeki, countKatu, countMiss, total_score, max_combo, perfect,
          mods, passed, mode, timestamp, client_flags].
      3. Verify `password` (md5) against the submitting user.
      4. Call `calculate_pp(...)` below with the parsed hit statistics and
         persist a `Score` row + update `Stats` for (user, mode, relax).
    """
    _ = (score, iv, password)  # parsed once step 1/2 above are implemented
    pp = calculate_pp(
        beatmap_id=0,
        mode=0,
        mods=0,
        accuracy=0.0,
        max_combo=0,
        count_300=0,
        count_100=0,
        count_50=0,
        count_miss=0,
    )
    _ = pp  # wired into the Score row once persistence (step 4) lands
    return PlainTextResponse("error: pass")
