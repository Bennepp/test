# In-memory token -> user_id map for active Bancho sessions.
#
# NOTE: intentionally process-local for this stub. A production deployment
# with multiple Bancho workers must move this into Redis (see redis_client.py)
# so any worker can validate any client's token.
SESSIONS: dict[str, int] = {}
