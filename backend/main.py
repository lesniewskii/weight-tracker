import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from asyncpg import create_pool
from fastapi.responses import JSONResponse

import logging

# REQUEST_COUNT = Counter(
#     "http_requests_total",
#     "Total number of HTTP requests",
#     ["method", "endpoint", "http_status"]
# )

# REQUEST_LATENCY = Histogram(
#     "http_request_latency_seconds",
#     "Latency of HTTP requests in seconds",
#     ["method", "endpoint"]
# )

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
    app.state.db_pool = await create_pool(
        host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASSWORD, port=DB_PORT
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


@app.get("/")
def read_root():
    return {"message": "Hello, World!!!"}


@app.get(
    "/health", summary="Health Check", response_description="Application Health Status"
)
async def health_check():
    return JSONResponse(content={"status": "healthy"}, status_code=200)


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
        {
            "name": row["name"],
            "measurement_date": row["measurement_date"],
            "weight": row["weight"],
            "notes": row["notes"],
        }
        for row in rows
    ]
    
    logger.info(f"Fetched measurements: {measurements}")
    # return jsonify(measurements)
    return {"measurements": measurements}


# @app.middleware("http")
# async def add_prometheus_metrics(request: Request, call_next):
#     start_time = time.time()
#     response = await call_next(request)
#     process_time = time.time() - start_time

#     # Record metrics
#     REQUEST_COUNT.labels(
#         method=request.method,
#         endpoint=request.url.path,
#         http_status=response.status_code
#     ).inc()
#     REQUEST_LATENCY.labels(
#         method=request.method,
#         endpoint=request.url.path
#     ).observe(process_time)

#     return response

# Expose metrics endpoint
# @app.get("/metrics")
# def get_metrics():
#     return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


# Endpoint: Add a new measurement
@app.post("/measurements")
async def add_measurement(measurement: Measurement):
    try:
        # Parse measurement_date into a datetime.date object
        measurement_date = datetime.strptime(
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
        raise HTTPException(status_code=400, detail=f"Error adding measurement: {e}")

    logger.info(f"Fetched measurements: {insert_query}")

    return {"message": "Measurement added successfully"}
