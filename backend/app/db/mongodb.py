from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

db = MongoDB()

async def connect_to_mongo():
    """Connect to MongoDB."""
    logger.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.db = db.client[settings.MONGODB_DB_NAME]
    logger.info("Connected to MongoDB!")

async def close_mongo_connection():
    """Close MongoDB connection."""
    logger.info("Closing MongoDB connection...")
    try:
        if db.client:
            db.client.close()
        logger.info("MongoDB connection closed!")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")
        # Continue without raising the exception to allow clean shutdown

async def get_database():
    """Get database instance."""
    return db.db
