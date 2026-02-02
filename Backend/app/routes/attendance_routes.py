from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.database import attendance_collection, employee_collection
from app.schemas.attendance_schema import AttendanceCreate
from app.models.attendance_model import attendance_serializer

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/")
def mark_attendance(attendance: AttendanceCreate):
    if not employee_collection.find_one({"employee_id": attendance.employee_id}):
        raise HTTPException(status_code=404, detail="Employee not found")

    # Convert date string to datetime for MongoDB BSON serialization
    attendance_data = attendance.dict()
    date_obj = datetime.strptime(attendance.date, "%Y-%m-%d")
    attendance_data["date"] = date_obj

    # Check if attendance already marked for this employee on this date
    existing = attendance_collection.find_one({
        "employee_id": attendance.employee_id,
        "date": {
            "$gte": date_obj.replace(hour=0, minute=0, second=0, microsecond=0),
            "$lt": date_obj.replace(hour=23, minute=59, second=59, microsecond=999999)
        }
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Attendance already marked for {attendance.employee_id} on {attendance.date}"
        )

    attendance_collection.insert_one(attendance_data)
    return {"message": "Attendance marked successfully"}

@router.get("/{employee_id}")
def get_attendance(employee_id: str):
    return [
        attendance_serializer(a)
        for a in attendance_collection.find({"employee_id": employee_id})
    ]
