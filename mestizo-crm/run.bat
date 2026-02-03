@echo off
REM Mestizo CRM - Run Script for Windows
REM This script starts the entire stack with Docker Compose

echo.
echo 🌿 Mestizo CRM - Starting...
echo.

REM Check if .env exists
if not exist .env (
    echo 📋 Creating .env from .env.example...
    copy .env.example .env
    echo ✅ .env created. You may want to edit it before continuing.
    echo.
)

REM Build and start containers
echo 🐳 Starting Docker containers...
docker compose up --build

echo.
echo 🌿 Mestizo CRM is running!
echo    Frontend: http://localhost:5173
echo    API:      http://localhost:8000/api/
echo    Swagger:  http://localhost:8000/api/schema/swagger/
echo    Admin:    http://localhost:8000/admin/
echo.
echo    Demo login: demo@demo.com / demo1234
