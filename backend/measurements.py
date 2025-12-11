from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from models import Measurement
from database import database
from auth import get_current_user
import datetime
import csv
import io

router = APIRouter()

@router.get("/measurements")
async def get_measurements(current_user: dict = Depends(get_current_user)):
    query = """
        SELECT w.id, w.measurement_date, w.weight, w.notes
        FROM weight_measurements w
        WHERE w.user_id = $1
        ORDER BY w.measurement_date DESC;
    """
    async with database.pool.acquire() as connection:
        rows = await connection.fetch(query, current_user["id"])
    return {
        "measurements": [
            {
                "id": row["id"],
                "measurement_date": row["measurement_date"],
                "weight": row["weight"],
                "notes": row["notes"],
            }
            for row in rows
        ]
    }

@router.get("/trends")
async def get_trends(current_user: dict = Depends(get_current_user)):
    # Get user info for BMI
    user_query = "SELECT height, age FROM users WHERE id = $1"
    async with database.pool.acquire() as connection:
        user = await connection.fetchrow(user_query, current_user["id"])
        measurements = await connection.fetch("""
            SELECT measurement_date, weight FROM weight_measurements
            WHERE user_id = $1 ORDER BY measurement_date
        """, current_user["id"])

    if not measurements:
        return {"trends": {}}

    weights = [m["weight"] for m in measurements]
    dates = [m["measurement_date"] for m in measurements]

    # Calculate averages
    avg_weight = sum(weights) / len(weights)
    weekly_avg = avg_weight  # placeholder
    monthly_avg = avg_weight  # placeholder

    # BMI if height available
    bmi = None
    if user["height"]:
        latest_weight = weights[-1]
        bmi = latest_weight / ((user["height"] / 100) ** 2)

    # Trend: simple linear regression slope
    if len(weights) > 1:
        x = list(range(len(weights)))
        slope = (sum((xi - sum(x)/len(x)) * (yi - avg_weight) for xi, yi in zip(x, weights)) /
                 sum((xi - sum(x)/len(x))**2 for xi in x)) if sum((xi - sum(x)/len(x))**2 for xi in x) != 0 else 0
    else:
        slope = 0

    # Calculate streak: consecutive days with measurements
    streak = 0
    if dates:
        sorted_dates = sorted(set(dates))
        current_streak = 0
        for i in range(len(sorted_dates) - 1):
            if (sorted_dates[i+1] - sorted_dates[i]).days == 1:
                current_streak += 1
            else:
                current_streak = 0
        streak = current_streak + 1 if sorted_dates else 0

    return {
        "trends": {
            "average_weight": round(avg_weight, 2),
            "weekly_average": round(weekly_avg, 2),  # TODO: calculate properly
            "monthly_average": round(monthly_avg, 2),  # TODO
            "bmi": round(bmi, 2) if bmi else None,
            "trend_slope": round(slope, 4),  # kg per measurement
            "total_measurements": len(weights),
            "date_range": f"{dates[0]} to {dates[-1]}" if dates else None,
            "current_streak": streak
        }
    }

@router.get("/export")
async def export_measurements(current_user: dict = Depends(get_current_user)):
    query = """
        SELECT measurement_date, weight, notes
        FROM weight_measurements
        WHERE user_id = $1
        ORDER BY measurement_date
    """
    async with database.pool.acquire() as connection:
        rows = await connection.fetch(query, current_user["id"])

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Weight", "Notes"])
    for row in rows:
        writer.writerow([row["measurement_date"], row["weight"], row["notes"]])

    return {"csv": output.getvalue()}

@router.post("/import")
async def import_measurements(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV")

    content = await file.read()
    csv_reader = csv.DictReader(io.StringIO(content.decode('utf-8')))

    async with database.pool.acquire() as connection:
        for row in csv_reader:
            try:
                date = datetime.datetime.strptime(row["Date"], "%Y-%m-%d").date()
                weight = float(row["Weight"])
                notes = row.get("Notes", "")
                await connection.execute("""
                    INSERT INTO weight_measurements (user_id, measurement_date, weight, notes)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT DO NOTHING
                """, current_user["id"], date, weight, notes)
            except Exception as e:
                continue  # Skip invalid rows

    return {"message": "Import completed"}

@router.post("/measurements")
async def add_measurement(measurement: Measurement, current_user: dict = Depends(get_current_user)):
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
                current_user["id"],
                measurement_date,
                measurement.weight,
                measurement.notes,
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error adding measurement: {e}")
    return {"message": "Measurement added successfully"}
