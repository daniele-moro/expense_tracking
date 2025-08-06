# System Architecture - Expense Tracking Application

## 1. High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile Web    │    │   File Upload   │
│   (React SPA)   │    │   (Responsive)  │    │   Interface     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    API Gateway/Router   │
                    │    (Express.js/FastAPI) │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                       │                        │
┌───────▼────────┐    ┌─────────▼─────────┐    ┌────────▼────────┐
│ Auth Service   │    │ Document Service  │    │ Analytics       │
│ - JWT tokens   │    │ - Upload/OCR      │    │ Service         │
│ - User mgmt    │    │ - Classification  │    │ - Reporting     │
└────────────────┘    └─────────┬─────────┘    │ - Trends        │
                                │              └─────────────────┘
                      ┌─────────▼─────────┐
                      │ Processing Queue  │
                      │ - OCR jobs        │
                      │ - Classification  │
                      └─────────┬─────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐    ┌─────────▼─────────┐    ┌────────▼────────┐
│ OCR Engine     │    │ ML Classifier     │    │ Database        │
│ - Tesseract    │    │ - Rule-based      │    │ - SQLite/PG     │
│ - PaddleOCR    │    │ - scikit-learn    │    │ - File metadata │
└────────────────┘    └───────────────────┘    └─────────────────┘
                                                         │
                                               ┌─────────▼─────────┐
                                               │ File System       │
                                               │ - Document store  │
                                               │ - Image uploads   │
                                               └───────────────────┘
```

## 2. Technology Stack

### 2.1 Frontend
- **Framework**: React.js with TypeScript
- **UI Library**: Material-UI or Tailwind CSS
- **State Management**: React Context API or Zustand
- **Build Tool**: Vite or Create React App
- **HTTP Client**: Axios or Fetch API

### 2.2 Backend
- **Framework**: Python FastAPI or Node.js Express
- **Language**: Python 3.9+ or Node.js 18+
- **API Style**: RESTful JSON API
- **Validation**: Pydantic (FastAPI) or Joi (Express)
- **Authentication**: JWT with refresh tokens

### 2.3 Database
- **Development**: SQLite for simplicity
- **Production**: PostgreSQL for scalability
- **ORM**: SQLAlchemy (Python) or Prisma (Node.js)
- **Migrations**: Alembic (SQLAlchemy) or built-in migration tools

### 2.4 File Processing
- **OCR Engine**: Tesseract OCR with pytesseract wrapper or PaddleOCR
- **Image Processing**: Pillow (PIL) for image preprocessing
- **File Storage**: Local filesystem with organized directory structure
- **Supported Formats**: JPG, PNG, PDF

### 2.5 Machine Learning
- **Classification**: scikit-learn for expense categorization
- **Text Processing**: spaCy or NLTK for natural language processing
- **Model Storage**: Pickle files for trained models

### 2.6 Background Processing
- **Task Queue**: Celery with Redis (Python) or Bull with Redis (Node.js)
- **Scheduler**: APScheduler (Python) or node-cron (Node.js)
- **Workers**: Separate worker processes for OCR and classification

## 3. Component Details

### 3.1 Frontend Components

#### 3.1.1 Core Pages
- **Dashboard**: Financial overview, recent transactions, quick actions
- **Upload Interface**: Drag-and-drop file upload with progress indication
- **Verification Queue**: Review and correct OCR-extracted data
- **Expense Management**: List view, filtering, manual entry
- **Income Management**: Payslip processing and income tracking
- **Analytics**: Charts, reports, and spending insights
- **Settings**: User preferences and account management

#### 3.1.2 Reusable Components
- **FileUploader**: Drag-and-drop with validation and preview
- **DataVerificationForm**: Editable form for OCR corrections
- **TransactionTable**: Sortable, filterable transaction list
- **CategorySelector**: Hierarchical category selection
- **DateRangePicker**: Date filtering for reports
- **ProgressIndicator**: OCR processing status

### 3.2 Backend Services

#### 3.2.1 Authentication Service
```python
# Core responsibilities:
- User registration and login
- JWT token generation and validation
- Password hashing and verification
- Session management
- Role-based access control (if needed)
```

#### 3.2.2 Document Service
```python
# Core responsibilities:
- File upload handling and validation
- Image preprocessing (rotation, enhancement)
- OCR job queuing and management
- Document metadata storage
- File system organization
```

#### 3.2.3 Classification Service
```python
# Core responsibilities:
- Expense category prediction
- Merchant name normalization
- Line item classification
- Confidence scoring
- Model training and updates
```

#### 3.2.4 Analytics Service
```python
# Core responsibilities:
- Expense aggregation and grouping
- Trend analysis and reporting
- Budget tracking and alerts
- Export functionality (CSV, PDF)
- Data visualization support
```

## 4. Data Flow

### 4.1 Document Processing Flow
```
1. User uploads document → Frontend validation
2. File sent to Document Service → Temporary storage
3. OCR job queued → Background worker picks up
4. OCR extraction → Text and structured data extracted
5. Classification service → Categories and confidence scores
6. Human verification queue → User reviews results
7. User confirms/corrects → Final data stored
8. Document archived → Permanent file storage
```

### 4.2 API Request Flow
```
1. Frontend request → API Gateway
2. JWT validation → Auth middleware
3. Route to service → Business logic processing
4. Database query → Data retrieval/modification
5. Response formatting → JSON response
6. Frontend update → UI state change
```

## 5. File System Organization

```
/app_data/
├── uploads/              # Temporary upload storage
│   ├── receipts/
│   └── payslips/
├── documents/            # Permanent document storage
│   └── user_{id}/
│       ├── receipts/
│       │   └── YYYY/MM/  # Organized by date
│       └── payslips/
│           └── YYYY/MM/
├── models/              # ML model files
│   ├── category_classifier.pkl
│   └── merchant_normalizer.pkl
└── logs/               # Application logs
    ├── app.log
    └── ocr.log
```

## 6. Database Schema

### 6.1 Core Tables
```sql
-- Users
users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents
documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(20) CHECK (type IN ('receipt', 'payslip')),
    original_filename VARCHAR(255),
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    ocr_confidence DECIMAL(3,2),
    processing_status VARCHAR(20) DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Expenses
expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_id INTEGER REFERENCES documents(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    merchant VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    transaction_date DATE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Income
income (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_id INTEGER REFERENCES documents(id),
    gross_amount DECIMAL(10,2),
    net_amount DECIMAL(10,2) NOT NULL,
    source VARCHAR(255),
    income_type VARCHAR(50),
    pay_period_start DATE,
    pay_period_end DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Expense line items (for detailed receipts)
expense_items (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER REFERENCES expenses(id),
    item_name VARCHAR(255),
    quantity DECIMAL(8,3),
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    category VARCHAR(100),
    subcategory VARCHAR(100)
);
```

## 7. API Endpoints

### 7.1 Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
POST /api/auth/refresh     # Refresh JWT token
POST /api/auth/logout      # User logout
```

### 7.2 Document Management
```
POST /api/documents/upload          # Upload document
GET  /api/documents                 # List user documents
GET  /api/documents/{id}            # Get document details
PUT  /api/documents/{id}/verify     # Mark document as verified
DELETE /api/documents/{id}          # Delete document
```

### 7.3 Expense Management
```
GET    /api/expenses                # List expenses with filters
POST   /api/expenses                # Create manual expense
GET    /api/expenses/{id}           # Get expense details
PUT    /api/expenses/{id}           # Update expense
DELETE /api/expenses/{id}           # Delete expense
POST   /api/expenses/bulk-verify    # Bulk verify expenses
```

### 7.4 Income Management
```
GET    /api/income                  # List income records
POST   /api/income                  # Create manual income
GET    /api/income/{id}             # Get income details
PUT    /api/income/{id}             # Update income
DELETE /api/income/{id}             # Delete income
```

### 7.5 Analytics
```
GET /api/analytics/overview         # Financial overview stats
GET /api/analytics/trends           # Spending trends
GET /api/analytics/categories       # Category breakdown
GET /api/analytics/reports          # Generate reports
GET /api/analytics/export           # Export data (CSV/PDF)
```

## 8. Security Considerations

### 8.1 Authentication & Authorization
- JWT tokens with short expiration (15 minutes)
- Refresh token rotation
- Rate limiting on auth endpoints
- Password strength requirements
- HTTPS enforcement in production

### 8.2 File Security
- File type validation
- File size limits (10MB)
- Virus scanning (future enhancement)
- Secure file storage with proper permissions
- Input sanitization for file names

### 8.3 Data Protection
- Database encryption at rest
- Sensitive data hashing
- SQL injection prevention
- XSS protection
- CSRF tokens for state-changing operations

## 9. Performance Considerations

### 9.1 OCR Processing
- Asynchronous processing with job queues
- Image preprocessing for better accuracy
- Confidence thresholding to reduce manual review
- Batch processing for multiple documents

### 9.2 Database Optimization
- Proper indexing on frequently queried fields
- Database connection pooling
- Query optimization and pagination
- Archive old data to maintain performance

### 9.3 Frontend Optimization
- Code splitting and lazy loading
- Image optimization and caching
- Debounced search and filtering
- Virtual scrolling for large lists

## 10. Deployment Architecture

### 10.1 Development Environment
```
Docker Compose setup:
- Frontend container (React dev server)
- Backend container (FastAPI/Express with hot reload)
- Database container (SQLite or PostgreSQL)
- Redis container (for task queue)
- Worker container (OCR processing)
```

### 10.2 Production Deployment
```
- Reverse proxy (Nginx)
- Application server (Gunicorn/PM2)
- Database (PostgreSQL with backups)
- File storage (local with backup strategy)
- Process monitoring (Supervisor/PM2)
- Logging and monitoring (structured logs)
```