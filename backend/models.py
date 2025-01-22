from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# SQLAlchemy Model for database table
class WeightMeasurement(Base):
    __tablename__ = "weight_measurements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    measurement_date = Column(Date, nullable=False)
    weight = Column(Float, nullable=False)
    notes = Column(String, default="")

# Pydantic model for API
class Measurement(BaseModel):
    user_id: int
    measurement_date: str
    weight: float
    notes: str = ""
