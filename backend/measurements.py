from fastapi import APIRouter, HTTPException
from models import Measurement
from database import database
import datetime

router = APIRouter()

@router.get("/measurements")
async def get_measurements():
    query = """
        SELECT u.name, w.measurement_date, w.weight, w.notes 
        FROM weight_measurements w 
        JOIN users u ON w.user_id = u.id 
        ORDER BY w.measurement_date DESC;
    """
    async with database.pool.acquire() as connection:
        rows = await connection.fetch(query)
    return {
        "measurements": [
            {
                "name": row["name"],
                "measurement_date": row["measurement_date"],
                "weight": row["weight"],
                "notes": row["notes"],
            }
            for row in rows
        ]
    }

@router.post("/measurements")
async def add_measurement(measurement: Measurement):
    try:
        measurement_date = datetime.datetime.strptime(
            measurement.measurement_date, "%Y-%m-%d"
        ).date()

        query = """
            INSERT INTO weight_measurements (user_id, measurement_date, weight, notes) 
            VALUES ($1, $2, $3, $4);
        """
        async with database.pool.acquire() as connection:
            await connection.execute(
                query,
                measurement.user_id,
                measurement_date,
                measurement.weight,
                measurement.notes,
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error adding measurement: {e}")
    return {"message": "Measurement added successfully"}
