import os
import logging
import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from asyncpg import create_pool

from .models import Measurement  # Import Pydantic models
from .database import database   # Import database setup

# Initialize app with lifespan
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_pool = await create_pool(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "weight_tracker"),
        user=os.getenv("DB_USER", "myuser"),
        password=os.getenv("DB_PASSWORD", "mypassword"),
        port=os.getenv("DB_PORT", "5432"),
    )
    yield
    await app.state.db_pool.close()

app = FastAPI(lifespan=lifespan)

# Logging configuration
logger = logging.getLogger(__name__)
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)

# CORS configuration
origins = [
    "http://localhost",  # Allow frontend if running locally
    "http://localhost:3000",  # React app port (if locally running)
    "http://10.42.0.240:80",  # If using LoadBalancer, replace with actual IP
    "*",  # Or use "*" to allow all origins (not recommended for production)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """
    Root path of the backend with greetings
    """
    return {"message": "Hello, World!!!"}

@app.get("/health", summary="Health Check", response_description="Application Health Status")
async def health_check():
    """
    Health check endpoint
    """
    return JSONResponse(content={"status": "healthy"}, status_code=200)

@app.get("/measurements")
async def get_measurements():
    """
    Endpoint: Get all measurements
    """
    query = """
        SELECT u.name, w.measurement_date, w.weight, w.notes 
        FROM weight_measurements w 
        JOIN users u ON w.user_id = u.id 
        ORDER BY w.measurement_date DESC;
    """
    async with app.state.db_pool.acquire() as connection:
        rows = await connection.fetch(query)
    measurements = [
        {
            "name": row["name"],
            "measurement_date": row["measurement_date"],
            "weight": row["weight"],
            "notes": row["notes"],
        }
        for row in rows
    ]
    logger.info("Fetched measurements: %s", measurements)
    return {"measurements": measurements}

@app.post("/measurements")
async def add_measurement(measurement: Measurement):
    """
    Endpoint: Add a new measurement
    """
    try:
        measurement_date = datetime.datetime.strptime(
            measurement.measurement_date, "%Y-%m-%d"
        ).date()

        insert_query = """
            INSERT INTO weight_measurements (user_id, measurement_date, weight, notes) 
            VALUES ($1, $2, $3, $4);
        """
        async with app.state.db_pool.acquire() as connection:
            await connection.execute(
                insert_query,
                measurement.user_id,
                measurement_date,
                measurement.weight,
                measurement.notes,
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error adding measurement: {e}") from e
    logger.info("Added measurement: %s", measurement)

    return {"message": "Measurement added successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
