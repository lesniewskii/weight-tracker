from fastapi import APIRouter, HTTPException, Depends
from models import UserCreate, UserLogin, UserResponse
from database import database
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from asyncpg.exceptions import IntegrityConstraintViolationError
import os

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    query = "SELECT id, username, email, height, age FROM users WHERE username = $1"
    async with database.pool.acquire() as connection:
        user = await connection.fetchrow(query, username)
    if user is None:
        raise credentials_exception
    return dict(user)

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    hashed_password = get_password_hash(user.password)
    query = """
        INSERT INTO users (username, password_hash, email, height, age)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, username, email, height, age
    """
    try:
        async with database.pool.acquire() as connection:
            row = await connection.fetchrow(query, user.username, hashed_password, user.email, user.height, user.age)
        return dict(row)
    except IntegrityConstraintViolationError as e:
        if "users_email_key" in str(e):
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            raise HTTPException(status_code=400, detail=f"User registration failed: {e}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"User registration failed: {e}")

@router.post("/login")
async def login(user: UserLogin):
    query = "SELECT password_hash FROM users WHERE username = $1"
    async with database.pool.acquire() as connection:
        row = await connection.fetchrow(query, user.username)
    if not row or not verify_password(user.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user