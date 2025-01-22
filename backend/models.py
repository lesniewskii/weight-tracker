from pydantic import BaseModel

class Measurement(BaseModel):
    """
    Pydantic model for adding a measurement
    """
    user_id: int
    measurement_date: str
    weight: float
    notes: str = ""