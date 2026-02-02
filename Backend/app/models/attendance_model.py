def attendance_serializer(record) -> dict:
    return {
        "employee_id": record["employee_id"],
        "date": record["date"],
        "status": record["status"]
    }
