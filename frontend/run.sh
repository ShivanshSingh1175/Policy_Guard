#!/bin/bash
# Frontend development server runner

echo "Starting PolicyGuard Frontend..."
echo "Installing dependencies..."
flutter pub get

echo "Running Flutter web app..."
flutter run -d chrome --web-port=3000
