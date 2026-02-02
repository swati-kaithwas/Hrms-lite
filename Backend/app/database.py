from pymongo import MongoClient
from app.config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

employee_collection = db["employees"]
attendance_collection = db["attendance"]