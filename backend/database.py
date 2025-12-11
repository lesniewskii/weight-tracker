import asyncio
import os
from asyncpg import create_pool

# Database connection settings
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "weight_tracker")
DB_USER = os.getenv("DB_USER", "myuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "mypassword")
DB_PORT = int(os.getenv("DB_PORT", "5432"))

class Database:
    def __init__(self):
        self.pool = None

    async def connect(self):
        retry_attempts = 5
        for attempt in range(1, retry_attempts + 1):
            try:
                self.pool = await create_pool(
                    host=DB_HOST,
                    database=DB_NAME,
                    user=DB_USER,
                    password=DB_PASSWORD,
                    port=DB_PORT,
                )
                return
            except Exception:
                if attempt == retry_attempts:
                    raise
                await asyncio.sleep(2)

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

database = Database()
