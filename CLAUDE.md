# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an expense tracking web application that processes financial documents (receipts, payslips) using OCR and machine learning for automatic categorization. The app tracks expenses, income, and investments with a human verification workflow for document processing.

## Architecture

The application follows a modern web stack architecture:

- **Frontend**: Modern web framework (React/Vue.js planned)
- **Backend**: RESTful API (Node.js/Python planned) 
- **Database**: PostgreSQL or MongoDB for structured data
- **File Storage**: Cloud storage for documents (AWS S3/Google Cloud)
- **OCR Service**: Google Cloud Vision API or Amazon Textract
- **ML Classification**: Custom model or cloud ML services for expense categorization

## Core Components

- **Document Processing Pipeline**: Upload → OCR → ML Classification → Human Verification → Storage
- **Authentication & User Management**: User accounts and session handling
- **Classification Engine**: Automatic categorization of expenses and income
- **Verification Interface**: Human review of OCR-extracted data
- **Analytics Dashboard**: Financial reporting and trend analysis
- **Document Archive**: Permanent storage and retrieval of financial documents

## Data Models

Key entities include:
- **User**: Authentication and profile data
- **Expense**: Transaction records with categories, merchants, and receipt links
- **Income**: Salary and income tracking with payslip references  
- **Document**: OCR-processed receipts and payslips with confidence scores
- **ExpenseItem**: Itemized receipt line items for detailed tracking

## Processing Workflows

### Receipt Processing
1. User uploads receipt → OCR extraction → ML categorization → Confidence check
2. Low confidence → Request re-upload; High confidence → Human verification
3. User reviews/corrects → Save to database → Archive document

### Payslip Processing  
1. Upload payslip → OCR income data extraction → Human verification
2. User confirms/corrects values → Create income record → Archive document

## Development Status

**Current State**: Project is in requirements/planning phase with only a requirements.md file present. No code has been implemented yet.

**Next Steps**: Set up initial project structure, choose technology stack, and begin implementing core components starting with the document upload and OCR processing pipeline.

## Code Style
- Follow PEP8 code standards
- always write tests, try doing TDD
- leave meaningful comments. A head comment to the file quickly describing what the file is doing, and in-line comments when really needed and the code is not straighforward
- before committing run tests using the makefile, if needed extend the makefile to add new tests
- at the end of each task, commit the code, and mark the task as done
