### docs/api.md

```markdown
# API Documentation

This document describes the API endpoints available in the Illinois Health Facilities Survey Data Processor application.

## Base URL

In development: `http://localhost:5000/api`

## Endpoints

### File Upload

**Endpoint:** `/upload`

**Method:** POST

**Description:** Upload a survey data file for processing

**Request:**
- Content-Type: multipart/form-data
- Form fields:
  - `file`: CSV or Excel file with survey data (required)
  - `facilityType`: Type of facility - hospital, astc, esrd, or ltc (required)

**Response:**
- Success (200):
```json
{
  "message": "File uploaded and processed successfully",
  "id": "unique-upload-id",
  "pdfCount": 10
}