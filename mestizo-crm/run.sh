#!/bin/bash

# Mestizo CRM - Run Script
# This script starts the entire stack with Docker Compose

set -e

echo "🌿 Mestizo CRM - Starting..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env created. You may want to edit it before continuing."
    echo ""
fi

# Build and start containers
echo "🐳 Starting Docker containers..."
docker compose up --build

echo ""
echo "🌿 Mestizo CRM is running!"
echo "   Frontend: http://localhost:5173"
echo "   API:      http://localhost:8000/api/"
echo "   Swagger:  http://localhost:8000/api/schema/swagger/"
echo "   Admin:    http://localhost:8000/admin/"
echo ""
echo "   Demo login: demo@demo.com / demo1234"
