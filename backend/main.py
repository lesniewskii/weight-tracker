import os
import logging
import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from asyncpg import create_pool

app = FastAPI()

logger = logging.getLogger(__name__)
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)

# Database connection settings
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "weight_tracker")
DB_USER = os.getenv("DB_USER", "myuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "mypassword")
DB_PORT = os.getenv("DB_PORT", "5432")


# CORS settings
origins = [
    "http://localhost",  # Allow frontend if running locally
    "http://localhost:3000",  # React app port (if locally running)
    "http://10.42.0.240:80",  # If using LoadBalancer, replace with actual IP
    "*",  # Or use "*" to allow all origins (not recommended for production)
]

# CORS settings: Allow React app to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Directly pass the list of origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize the database connection pool
@app.on_event("startup")
async def startup():
    """
    Initializes resources during the application startup phase.

    Creates a database connection pool and attaches it to the application state.
    """
    app.state.db_pool = await create_pool(
        host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASSWORD, port=DB_PORT
    )


@app.on_event("shutdown")
async def shutdown():
    """
    Cleans up resources during the application shutdown phase.

    Closes the database connection pool.
    """
    await app.state.db_pool.close()


class Measurement(BaseModel):
    """
    Pydantic model for adding a measurement
    """
    user_id: int
    measurement_date: str
    weight: float
    notes: str = ""


@app.get("/")
def read_root():
    """
    root path of the backend with some greetins
    """
    return {"message": "Hello, World!!!"}


@app.get(
    "/health", summary="Health Check", response_description="Application Health Status"
)
async def health_check():
    """
    healthz check
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
    # return jsonify(measurements)
    return {"measurements": measurements}


@app.post("/measurements")
async def add_measurement(measurement: Measurement):
    """
    Endpoint: Add a new measurement
    """
    try:
        # Parse measurement_date into a datetime.date object
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
                measurement_date,  # Use the parsed date
                measurement.weight,
                measurement.notes,
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error adding measurement: {e}") from e
    logger.info("Fetched measurements %s", insert_query)

    return {"message": "Measurement added successfully"}
