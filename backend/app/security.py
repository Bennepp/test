"""Password hashing compatible with the osu! client's login pipeline.

The osu! client always sends the password pre-hashed as an md5 hex digest
(`password_md5`) - it never transmits the plaintext. To keep a single
verification path for both the game client and the web/API registration
form, the server itself md5-hashes any plaintext it receives before bcrypt
hashing, so the stored value is always `bcrypt(md5_hex(plaintext))`.
"""
import hashlib

import bcrypt


def md5_hex(value: str) -> str:
    return hashlib.md5(value.encode()).hexdigest()


def hash_plaintext_password(plaintext: str) -> str:
    """Used by the web registration flow, which receives a plaintext password."""
    return hash_md5_password(md5_hex(plaintext))


def hash_md5_password(password_md5: str) -> str:
    """Used when storing a password whose md5 is already known (e.g. re-hash)."""
    return bcrypt.hashpw(password_md5.encode(), bcrypt.gensalt()).decode()


def verify_md5_password(password_md5: str, bcrypt_hash: str) -> bool:
    """Used by the Bancho login handler, which receives an md5 digest."""
    return bcrypt.checkpw(password_md5.encode(), bcrypt_hash.encode())


def verify_plaintext_password(plaintext: str, bcrypt_hash: str) -> bool:
    """Used by the web/API login flow, which receives a plaintext password."""
    return verify_md5_password(md5_hex(plaintext), bcrypt_hash)
