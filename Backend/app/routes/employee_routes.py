from fastapi import APIRouter, HTTPException
from app.database import employee_collection
from app.schemas.employee_schema import EmployeeCreate
from app.models.employee_model import employee_serializer

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.post("/")
def add_employee(employee: EmployeeCreate):
    try:
        # Check if employee_id or email already exists
        if employee_collection.find_one({
            "$or": [
                {"employee_id": employee.employee_id},
                {"email": employee.email}
            ]
        }):
            raise HTTPException(status_code=400, detail="Employee with this ID or email already exists")

        # Insert employee
        employee_data = employee.dict()
        result = employee_collection.insert_one(employee_data)
        
        if result.inserted_id:
            return {"message": "Employee added successfully", "employee_id": employee.employee_id}
        else:
            raise HTTPException(status_code=500, detail="Failed to save employee")
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/")
def get_employees():
    return [employee_serializer(emp) for emp in employee_collection.find()]

@router.put("/{employee_id}")
def update_employee(employee_id: str, employee: EmployeeCreate):
    try:
        # Check if employee exists
        existing = employee_collection.find_one({"employee_id": employee_id})
        if not existing:
            raise HTTPException(status_code=404, detail="Employee not found")
        
        # Check if new email is already used by another employee
        if employee.email != existing.get("email"):
            if employee_collection.find_one({"email": employee.email}):
                raise HTTPException(status_code=400, detail="Email already in use by another employee")
        
        # Update employee
        update_data = employee.dict()
        result = employee_collection.update_one(
            {"employee_id": employee_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0 or result.matched_count > 0:
            return {"message": "Employee updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update employee")
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/{employee_id}")
def delete_employee(employee_id: str):
    try:
        # Delete all attendance records for this employee first (cascade delete)
        from app.database import attendance_collection
        attendance_collection.delete_many({"employee_id": employee_id})
        
        # Delete the employee
        result = employee_collection.delete_one({"employee_id": employee_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"message": "Employee deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
