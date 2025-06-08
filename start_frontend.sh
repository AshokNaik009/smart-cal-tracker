#!/bin/bash

echo "Starting Smart Calorie Counter Frontend..."

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

# Start the React development server
echo "Starting React development server..."
npm start