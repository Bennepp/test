"""Bancho protocol endpoint: served on the `c.<domain>` subdomain.

The osu! client always POSTs to `/` on the Bancho host. The very first
request (no `osu-token` header) is the login handshake; every subsequent
request carries `osu-token` and a stream of client packets to process. This
stub implements a complete, working handshake and an empty packet loop that
future gameplay packets (spectate, multiplayer, chat) hook into.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Header, Request, Response
from sqlalchemy import select

from app.bancho import packets
from app.bancho.sessions import SESSIONS
from app.db import async_session
from app.models import User
from app.security import verify_md5_password

router = APIRouter()


def _bancho_response(token: str, body: bytes) -> Response:
    return Response(
        content=body,
        media_type="application/octet-stream",
        headers={"cho-token": token, "cho-protocol": "19"},
    )


async def _handle_login(body: bytes) -> Response:
    try:
        text = body.decode()
        username_line, password_md5, client_info = text.split("\n")[:3]
        client_version = client_info.split("|")[0]
    except (ValueError, UnicodeDecodeError):
        return _bancho_response("no", packets.user_id_packet(packets.LoginError.ERROR_OCCURRED))

    username = username_line.strip()

    async with async_session() as session:
        user = await session.scalar(select(User).where(User.username_safe == username.lower()))

    if user is None or not verify_md5_password(password_md5, user.password_bcrypt):
        return _bancho_response("no", packets.user_id_packet(packets.LoginError.INVALID_CREDENTIALS))

    token = str(uuid.uuid4())
    SESSIONS[token] = user.id

    response_body = b"".join(
        [
            packets.protocol_version_packet(),
            packets.user_id_packet(user.id),
            packets.privileges_packet(user.privileges),
            packets.channel_join_success_packet("#osu"),
            packets.channel_info_end_packet(),
            packets.notification_packet(
                f"Welcome to the server, {username}! (client {client_version})"
            ),
        ]
    )
    return _bancho_response(token, response_body)


@router.post("/")
async def bancho_handler(request: Request, osu_token: str | None = Header(default=None)) -> Response:
    body = await request.body()

    if osu_token is None:
        return await _handle_login(body)

    if osu_token not in SESSIONS:
        # Token unknown (server restarted, expired, etc) - ask client to re-login.
        return _bancho_response("no", packets.user_id_packet(packets.LoginError.INVALID_CREDENTIALS))

    # Packet loop stub: real client packets (change action, public/private
    # messages, spectator frames, multiplayer...) get parsed and dispatched
    # here. No inbound packets currently require a response.
    return _bancho_response(osu_token, b"")
