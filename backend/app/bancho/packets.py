"""Minimal binary (de)serialization for the Bancho packet protocol.

Every packet on the wire is: <u16 packet_id><u8 compression=0><u32 length><payload>.
Reference: bancho.py/gulag `packets.py`, and the "Reverse Engineering a
Protocol Impossible to Reverse Engineer" writeup for the raw wire format.
"""
from __future__ import annotations

import struct
from enum import IntEnum
from io import BytesIO


class ServerPackets(IntEnum):
    USER_ID = 5
    SEND_MESSAGE = 7
    PONG = 8
    USER_STATS = 11
    USER_LOGOUT = 12
    SPECTATOR_JOINED = 13
    SPECTATOR_LEFT = 14
    VERSION_UPDATE = 19
    NOTIFICATION = 24
    CHANNEL_JOIN_SUCCESS = 64
    CHANNEL_INFO = 65
    CHANNEL_INFO_END = 89
    PRIVILEGES = 71
    FRIENDS_LIST = 72
    PROTOCOL_VERSION = 75
    MAIN_MENU_ICON = 76
    USER_PRESENCE = 83
    RESTART = 86


class ClientPackets(IntEnum):
    CHANGE_ACTION = 0
    SEND_PUBLIC_MESSAGE = 1
    LOGOUT = 2
    REQUEST_STATUS_UPDATE = 3
    PING = 4
    START_SPECTATING = 16
    STOP_SPECTATING = 17
    CHANNEL_JOIN = 63
    FRIEND_ADD = 73
    FRIEND_REMOVE = 74
    RECEIVE_UPDATES = 79


def write_u8(buf: BytesIO, value: int) -> None:
    buf.write(struct.pack("<B", value))


def write_i32(buf: BytesIO, value: int) -> None:
    buf.write(struct.pack("<i", value))


def write_string(buf: BytesIO, value: str) -> None:
    """osu!'s "uleb128-prefixed string" format: 0x0b marker + uleb128 length + utf8 bytes."""
    if not value:
        write_u8(buf, 0x00)
        return
    write_u8(buf, 0x0B)
    data = value.encode()
    length = len(data)
    while True:
        byte = length & 0x7F
        length >>= 7
        if length:
            buf.write(struct.pack("<B", byte | 0x80))
        else:
            buf.write(struct.pack("<B", byte))
            break
    buf.write(data)


def write_packet(packet_id: ServerPackets, payload: bytes) -> bytes:
    header = struct.pack("<HBI", int(packet_id), 0, len(payload))
    return header + payload


def user_id_packet(user_id: int) -> bytes:
    """Login reply. Positive = user id, negative = error code (see LoginError)."""
    body = BytesIO()
    write_i32(body, user_id)
    return write_packet(ServerPackets.USER_ID, body.getvalue())


def notification_packet(message: str) -> bytes:
    body = BytesIO()
    write_string(body, message)
    return write_packet(ServerPackets.NOTIFICATION, body.getvalue())


def protocol_version_packet(version: int = 19) -> bytes:
    body = BytesIO()
    write_i32(body, version)
    return write_packet(ServerPackets.PROTOCOL_VERSION, body.getvalue())


def channel_join_success_packet(channel: str) -> bytes:
    body = BytesIO()
    write_string(body, channel)
    return write_packet(ServerPackets.CHANNEL_JOIN_SUCCESS, body.getvalue())


def privileges_packet(privileges: int) -> bytes:
    body = BytesIO()
    write_i32(body, privileges)
    return write_packet(ServerPackets.PRIVILEGES, body.getvalue())


def channel_info_end_packet() -> bytes:
    return write_packet(ServerPackets.CHANNEL_INFO_END, b"")


class LoginError(IntEnum):
    """Values the client displays as user-facing login failures."""

    INVALID_CREDENTIALS = -1
    OUTDATED_CLIENT = -2
    BANNED = -3
    ERROR_OCCURRED = -5
    NEEDS_SUPPORTER = -6
    PASSWORD_RESET = -7
    VERIFICATION_NEEDED = -8
