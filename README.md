# HRMS Lite

A lightweight Human Resource Management System with a React frontend and a FastAPI backend. It provides basic employee and attendance management with clean separation between client and server.

## Monorepo Structure
```
Hrms-lite/
├─ Backend/                  # FastAPI backend (Python)
│  ├─ app/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ schemas/
│  │  ├─ config.py
│  │  ├─ database.py
│  │  └─ main.py            # FastAPI app entry
│  ├─ .env.example
│  ├─ requirements.txt
│  └─ README.md (component-level)
├─ Frontend/                 # React frontend (JS)
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ services/
│  │  ├─ App.js
│  │  └─ index.js
│  ├─ package.json
│  ├─ postcss.config.js
│  └─ tailwind.config.js
└─ README.md (this file)
```

## Tech Stack
- Frontend: React + Tailwind CSS
- Backend: FastAPI + Pydantic + MongoDB (via a MongoDB driver such as Motor/PyMongo)
- Database: MongoDB

## Prerequisites
- Node.js 18+ and npm
- Python 3.10+ and pip
- MongoDB instance (local or hosted, e.g., MongoDB Atlas)

---

## Backend
Location: `Backend/`

### Environment Variables
Copy `.env.example` to `.env` and adjust as needed.
- MONGODB_URI: Mongo connection string, e.g., `mongodb://localhost:27017` or Atlas URI
- MONGODB_DB_NAME: Database name, e.g., `hrms_lite`
- APP_ENV: `development` | `production`
- APP_HOST: default `0.0.0.0`
- APP_PORT: default `8000`

### Install & Run (Windows)
1. Create and activate a virtual environment:
   - cmd:
     ```cmd
     cd Backend
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - PowerShell:
     ```powershell
     cd Backend
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server (dev):
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
4. API Docs when running locally:
   - Swagger: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Code Map
- `app/models/*`: Data models/schemas for MongoDB collections (employees, attendance)
- `app/schemas/*`: Pydantic validation schemas
- `app/routes/*`: API routers for employees and attendance
- `app/database.py`: MongoDB client/connection setup
- `app/config.py`: configuration via env vars
- `app/main.py`: FastAPI app and router mounting

---

## Frontend
Location: `Frontend/`

### Environment Variables
Create `Frontend/.env` and set the backend API base URL:
```
REACT_APP_API_BASE_URL=http://localhost:8000
```

### Install & Run
1. Install dependencies:
   ```bash
   cd Frontend
   npm install
   ```
2. Start the dev server:
   ```bash
   npm start
   ```
   Default dev URL: http://localhost:3000

### Code Map
- `src/pages/*`: Pages (Home, EmployeeManagement, AttendanceManagement)
- `src/components/*`: Reusable components (Navbar, LoadingSpinner)
- `src/services/api.js`: API helper configured with base URL from env
- `tailwind.config.js` + `postcss.config.js`: Tailwind setup

---

## Quick Start (Both Services)
Open two terminals:
1) Backend
```
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env   (or create .env)
# Edit .env with your MongoDB connection
# MONGODB_URI=mongodb://localhost:27017
# MONGODB_DB_NAME=hrms_lite
uvicorn app.main:app --reload --port 8000
```

2) Frontend
```
cd Frontend
npm install
# Ensure Frontend/.env sets REACT_APP_API_BASE_URL=http://localhost:8000
npm start
```

- Frontend: http://localhost:3000
- Backend API + Swagger: http://localhost:8000/docs

---

## Build & Production
- Frontend: `npm run build` generates a production build in `Frontend/build`.
- Backend: run with a production ASGI server (e.g., `uvicorn` behind a reverse proxy or `gunicorn` with `uvicorn.workers.UvicornWorker`). Use a managed MongoDB cluster (e.g., Atlas), configure indexes for query performance, and set secure environment variables.
