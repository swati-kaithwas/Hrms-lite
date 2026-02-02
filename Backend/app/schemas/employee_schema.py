from pydantic import BaseModel, EmailStr, Field, validator

class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, description="Employee ID is required")
    name: str = Field(..., min_length=2, description="Full Name is required (minimum 2 characters)")
    email: EmailStr = Field(..., description="Valid Email is required")
    department: str = Field(..., min_length=1, description="Department is required")

    @validator('employee_id', pre=True, always=True)
    def validate_employee_id(cls, v):
        if not v or not str(v).strip():
            raise ValueError('Employee ID cannot be empty')
        return str(v).strip()

    @validator('name', pre=True, always=True)
    def validate_name(cls, v):
        if not v or not str(v).strip():
            raise ValueError('Full Name cannot be empty')
        v_str = str(v).strip()
        if len(v_str) < 2:
            raise ValueError('Full Name must be at least 2 characters')
        return v_str

    @validator('department', pre=True, always=True)
    def validate_department(cls, v):
        if not v or not str(v).strip():
            raise ValueError('Department cannot be empty')
        return str(v).strip()
