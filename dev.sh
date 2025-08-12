#!/bin/bash
# Development helper script for QuickBite

echo "🚀 Starting QuickBite in development mode..."
echo "📁 This will mount your local source code for hot reload"
echo ""

# Start the services in development mode
docker-compose up --build identity-service postgres

echo ""
echo "✅ Development server started!"
echo "🔗 Identity Service: http://localhost:3001"
echo "📊 Database: postgresql://quickbite_user:quickbite_password@localhost:5432/quickbite_db"
echo ""
echo "💡 Code changes in ./services/identity-service/src will automatically reload the service"
echo "🛑 Press Ctrl+C to stop all services"
