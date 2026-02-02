from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.employee_routes import router as employee_router
from app.routes.attendance_routes import router as attendance_router

app = FastAPI(title="HRMS Lite - MongoDB")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee_router)
app.include_router(attendance_router)

@app.get("/")
def root():
    return {"message": "HRMS Lite Backend (MongoDB) Running"}

