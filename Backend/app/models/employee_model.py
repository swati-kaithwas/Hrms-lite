def employee_serializer(employee) -> dict:
    return {
        "employee_id": employee["employee_id"],
        "name": employee["name"],
        "email": employee["email"],
        "department": employee["department"]
    }
