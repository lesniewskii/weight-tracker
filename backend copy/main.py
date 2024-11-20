from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from asyncpg import create_pool
import os

app = FastAPI()

# Database connection settings
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "weight_tracker")
DB_USER = os.getenv("DB_USER", "myuser")
DB_PASSWORD = os.getenv("DB_PASSWORD", "mypassword")
DB_PORT = os.getenv("DB_PORT", "5432")

# CORS settings: Allow React app to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the database connection pool
@app.on_event("startup")
async def startup():
    app.state.db_pool = await create_pool(
        host=DB_HOST, 
        database=DB_NAME, 
        user=DB_USER, 
        password=DB_PASSWORD, 
        port=DB_PORT
    )

@app.on_event("shutdown")
async def shutdown():
    await app.state.db_pool.close()

# Pydantic model for adding a measurement
class Measurement(BaseModel):
    user_id: int
    measurement_date: str
    weight: float
    notes: str = ""

# Endpoint: Get all measurements
@app.get("/measurements")
async def get_measurements():
    query = """
        SELECT u.name, w.measurement_date, w.weight, w.notes 
        FROM weight_measurements w 
        JOIN users u ON w.user_id = u.id 
        ORDER BY w.measurement_date DESC;
    """
    async with app.state.db_pool.acquire() as connection:
        rows = await connection.fetch(query)
    measurements = [
        {"name": row["name"], "measurement_date": row["measurement_date"], 
         "weight": row["weight"], "notes": row["notes"]} 
        for row in rows
    ]
    return {"measurements": measurements}

# Endpoint: Add a new measurement
@app.post("/measurements")
async def add_measurement(measurement: Measurement):
    insert_query = """
        INSERT INTO weight_measurements (user_id, measurement_date, weight, notes) 
        VALUES ($1, $2, $3, $4);
    """
    async with app.state.db_pool.acquire() as connection:
        try:
            await connection.execute(insert_query, measurement.user_id, measurement.measurement_date, 
                                     measurement.weight, measurement.notes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error adding measurement: {e}")
    return {"message": "Measurement added successfully"}