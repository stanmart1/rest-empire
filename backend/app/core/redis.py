import redis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

try:
    redis_client = redis.from_url(
        settings.REDIS_URL, 
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5,
        retry_on_timeout=True
    )
    redis_client.ping()
    logger.info("✓ Redis connected successfully")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}. Rate limiting will be disabled.")
    redis_client = None
