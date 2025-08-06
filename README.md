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

*Development setup instructions will be added as the project progresses.*

## License

*License information to be added*