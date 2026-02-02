from pydantic import BaseModel

class AttendanceCreate(BaseModel):
    employee_id: str
    date: str  # Received as string from frontend (YYYY-MM-DD format)
    status: str
