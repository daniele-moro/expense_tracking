# Expense Tracker Application Makefile
# Provides convenient targets for development, testing, and linting

.PHONY: help install test lint run clean build setup

# Default target
help:
	@echo "Available targets:"
	@echo "  setup     - Install dependencies for both frontend and backend"
	@echo "  install   - Install dependencies for both frontend and backend"
	@echo "  test      - Run tests for both frontend and backend"
	@echo "  lint      - Run linters for both frontend and backend"
	@echo "  run       - Start both frontend and backend development servers"
	@echo "  build     - Build both frontend and backend for production"
	@echo "  clean     - Clean build artifacts and dependencies"
	@echo ""
	@echo "Backend targets:"
	@echo "  backend-install  - Install Python dependencies"
	@echo "  backend-test     - Run Python tests"
	@echo "  backend-lint     - Run Python linter (ruff)"
	@echo "  backend-run      - Start FastAPI development server"
	@echo "  backend-migrate  - Run database migrations"
	@echo ""
	@echo "Frontend targets:"
	@echo "  frontend-install - Install Node.js dependencies"
	@echo "  frontend-test    - Run React tests"
	@echo "  frontend-lint    - Run ESLint"
	@echo "  frontend-run     - Start React development server"
	@echo "  frontend-build   - Build React app for production"

# Setup - Install all dependencies
setup: backend-install frontend-install
	@echo "✅ All dependencies installed successfully"

install: setup

# Test all components
test: backend-test frontend-test
	@echo "✅ All tests completed"

# Lint all code
lint: backend-lint frontend-lint
	@echo "✅ All linting completed"

# Run both development servers
run:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:8000"
	@echo "Frontend will run on http://localhost:3000"
	@echo "Press Ctrl+C to stop both servers"
	@trap 'kill %1; kill %2' INT; \
	make backend-run & \
	make frontend-run & \
	wait

# Build for production
build: backend-build frontend-build
	@echo "✅ Production build completed"

# Clean all build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/__pycache__/
	rm -rf backend/.pytest_cache/
	rm -rf backend/app/__pycache__/
	rm -rf backend/app/*/__pycache__/
	rm -rf backend/.ruff_cache/
	rm -rf frontend/build/
	rm -rf frontend/node_modules/.cache/
	@echo "✅ Cleanup completed"

# Backend targets
backend-install:
	@echo "Installing Python dependencies..."
	cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

backend-test:
	@echo "Running Python tests..."
	cd backend && source venv/bin/activate && python -m pytest tests/ -v

backend-lint:
	@echo "Running Python linter..."
	cd backend && source venv/bin/activate && ruff check .

backend-run:
	@echo "Starting FastAPI server on http://localhost:8000..."
	cd backend && source venv/bin/activate && python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload

backend-migrate:
	@echo "Running database migrations..."
	cd backend && source venv/bin/activate && alembic upgrade head

backend-build:
	@echo "Backend build completed (FastAPI doesn't require building)"

# Frontend targets
frontend-install:
	@echo "Installing Node.js dependencies..."
	cd frontend && npm install

frontend-test:
	@echo "Running React tests..."
	cd frontend && npm test -- --watchAll=false --verbose

frontend-lint:
	@echo "Running ESLint..."
	cd frontend && npx eslint src/ --ext .ts,.tsx

frontend-run:
	@echo "Starting React development server on http://localhost:3000..."
	cd frontend && npm start

frontend-build:
	@echo "Building React app for production..."
	cd frontend && npm run build

# Development helpers
dev-backend:
	@echo "Starting backend development mode with auto-reload..."
	cd backend && source venv/bin/activate && python main.py

dev-frontend:
	@echo "Starting frontend development server..."
	make frontend-run

# Database helpers
db-reset:
	@echo "Resetting database..."
	cd backend && rm -f expense_tracker.db && source venv/bin/activate && alembic upgrade head

db-shell:
	@echo "Opening database shell..."
	cd backend && sqlite3 expense_tracker.db

# Check if all tools are available
check-tools:
	@echo "Checking required tools..."
	@command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 is required but not installed."; exit 1; }
	@command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }
	@echo "✅ All required tools are available"