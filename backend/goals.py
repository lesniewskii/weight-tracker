from fastapi import APIRouter, HTTPException, Depends
from models import GoalCreate, GoalResponse
from database import database
from auth import get_current_user
import datetime

router = APIRouter()

@router.post("/goals", response_model=GoalResponse)
async def create_goal(goal: GoalCreate, current_user: dict = Depends(get_current_user)):
    query = """
        INSERT INTO goals (user_id, target_weight, target_date, start_weight)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, target_weight, target_date, start_weight
    """
    try:
        row = await database.pool.fetchrow(query, current_user["id"], goal.target_weight, goal.target_date, goal.start_weight)
        return dict(row)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Goal creation failed: {e}")

@router.get("/goals")
async def get_goals(current_user: dict = Depends(get_current_user)):
    query = "SELECT id, target_weight, target_date, start_weight FROM goals WHERE user_id = $1 ORDER BY target_date DESC"
    async with database.pool.acquire() as connection:
        rows = await connection.fetch(query, current_user["id"])
    return {"goals": [dict(row) for row in rows]}