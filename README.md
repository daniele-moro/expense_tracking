# Expense Tracking Web Application

A web application for personal financial tracking that processes receipts and payslips using OCR technology for automatic expense categorization and income tracking.

## Features

- **Document Processing**: Upload receipts and payslips for automatic OCR extraction
- **Expense Tracking**: Categorize and track expenses with manual entry and receipt processing
- **Income Management**: Process payslips and track income sources
- **Human Verification**: Review and correct OCR-extracted data
- **Analytics**: Financial insights, spending trends, and category breakdowns
- **Local Processing**: No cloud dependencies - all processing done locally

## Architecture

- **Frontend**: React.js with TypeScript
- **Backend**: Python FastAPI
- **Database**: SQLite (development) / PostgreSQL (production)
- **OCR**: Tesseract OCR for local text extraction
- **Classification**: Local ML models for expense categorization

## Development Status

🚧 **Currently in development** - MVP phase

See [mvp-tasks.md](./mvp-tasks.md) for detailed development roadmap.

## Documentation

- [Requirements & Specifications](./requirements.md)
- [System Architecture](./architecture.md)
- [MVP Task Breakdown](./mvp-tasks.md)
- [Development Guide](./CLAUDE.md) - For Claude Code

## Getting Started

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone git@github.com:daniele-moro/expense_tracking.git
   cd expense_tracking
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Database Setup**
   ```bash
   # Still in backend directory with venv activated
   alembic upgrade head
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

**Option 1: Using individual commands**

1. **Start Backend** (Terminal 1)
   ```bash
   cd backend
   source venv/bin/activate
   python main.py
   ```
   Backend will run on http://localhost:8000

2. **Start Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on http://localhost:3000

**Option 2: Using npm scripts from project root**

```bash
# Install all dependencies
npm run install

# Run backend
npm run dev:backend

# Run frontend (in another terminal)
npm run dev:frontend
```

### Useful Commands

```bash
# Database migrations
npm run db:migrate              # Apply migrations
npm run db:migration -m "name"  # Create new migration

# Testing
npm run test:backend   # Run backend tests
npm run test:frontend  # Run frontend tests

# Build for production
npm run build:frontend
```

### API Documentation

Once the backend is running, visit:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Development Status

🚧 **Phase 1 Complete**: Project foundation and database setup
🔄 **Phase 2 In Progress**: Authentication system (custom JWT)

### Troubleshooting

**Backend won't start:**
- Make sure virtual environment is activated
- Check if port 8000 is already in use: `lsof -ti:8000 | xargs kill -9`

**Frontend won't start:**
- Make sure Node.js version is 16+
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Database issues:**
- Reset database: `rm expense_tracker.db` then run `alembic upgrade head`

## License

*License information to be added*