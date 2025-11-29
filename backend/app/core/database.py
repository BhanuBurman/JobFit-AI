from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv
from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row # Import this for LangGraph compatibility

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# ==========================================
# 1. SYNCHRONOUS ORM (For standard API endpoints)
# ==========================================
engine = create_engine(
    DATABASE_URL,
    # This ensures your standard queries also respect the 'jobfit' schema
    connect_args={"options": "-csearch_path=jobfit"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is the class your models will inherit from
Base = declarative_base()

def get_db():
    """Dependency for standard FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# 2. ASYNCHRONOUS RAW POOL (For LangGraph)
# ==========================================
class AsyncDatabase:
    def __init__(self) -> None:
        self.pool: AsyncConnectionPool = None

    async def connect(self) -> None:
        if not self.pool:
            self.pool = AsyncConnectionPool(
                conninfo=DATABASE_URL,
                max_size=20,
                open=False, # Fixes Deprecation Warning
                # Configure the pool to return dictionaries (required for LangGraph)
                # NOTE: 'configure' must NOT be in kwargs. 'row_factory' works here.
                kwargs={
                    "autocommit": True,
                    "row_factory": dict_row, 
                    "options": "-c search_path=jobfit"
                }
            )
            # Explicitly open the pool (Fixes Deprecation Warning)
            await self.pool.open()
            print("✅ Async Chat DB Pool Connected (Schema: jobfit)")

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            print("🛑 Async Chat DB Pool Closed")

    # Helper to get a checkpointer quickly
    async def get_checkpointer(self):
        from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
        
        if not self.pool:
             raise RuntimeError("Database pool is not initialized")

        # We assume the pool is already connected via lifespan
        async with self.pool.connection() as conn:
            checkpointer = AsyncPostgresSaver(conn)
            yield checkpointer

# Global instance
async_db = AsyncDatabase()