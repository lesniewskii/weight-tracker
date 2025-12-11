from typing import Optional
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# SQLAlchemy Model for database table
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    height = Column(Float, nullable=True)  # for BMI calculation
    age = Column(Integer, nullable=True)

class WeightMeasurement(Base):
    __tablename__ = "weight_measurements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    measurement_date = Column(Date, nullable=False)
    weight = Column(Float, nullable=False)
    notes = Column(String, default="")

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_weight = Column(Float, nullable=False)
    target_date = Column(Date, nullable=False)
    start_weight = Column(Float, nullable=False)

# Pydantic models for API
class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    height: Optional[float] = None
    age: Optional[int] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    height: Optional[float] = None
    age: Optional[int] = None

class Measurement(BaseModel):
    measurement_date: str
    weight: float
    notes: str = ""

class GoalCreate(BaseModel):
    target_weight: float
    target_date: str
    start_weight: float

class GoalResponse(BaseModel):
    id: int
    user_id: int
    target_weight: float
    target_date: str
    start_weight: float
