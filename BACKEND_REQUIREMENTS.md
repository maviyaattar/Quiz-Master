# Backend API Requirements for Quiz Master Enhancement

## Overview
This document outlines the backend API endpoints that need to be implemented or updated to support the new Quiz Master features. This is a reference for the backend repository.

## Required Backend Endpoints

### 1. Logo Upload Endpoint (Already Implemented)
**Endpoint:** `POST /api/upload-logo`
- **Authentication:** Required (Bearer token)
- **Purpose:** Upload organization logo to Cloudinary
- **Request:** FormData with 'logo' file field
- **Response:** 
  ```json
  {
    "url": "https://res.cloudinary.com/.../logo.png"
  }
  ```

### 2. Quiz Schema Updates (Already Implemented)
The Quiz model should include:
- `orgName` (String, optional): Organization name
- `logoUrl` (String, optional): URL to uploaded logo
- `negativeMarking` (Boolean, default: false): Enable negative marking

### 3. Updated Endpoint: Get Quiz Questions
**Endpoint:** `GET /api/quiz/questions/:code`
- **Authentication:** Not required (public for participants)
- **Purpose:** Get quiz questions for participants
- **Changes Needed:** Include quiz metadata in response
- **Response:**
  ```json
  {
    "questions": [...],
    "endTime": "2024-...",
    "title": "Quiz Title",
    "orgName": "Organization Name",
    "logoUrl": "https://..."
  }
  ```

### 4. New Endpoint: Get All Participants
**Endpoint:** `GET /api/quiz/participants/:code`
- **Authentication:** Required (Bearer token)
- **Authorization:** Verify quiz belongs to authenticated creator
- **Purpose:** Get detailed information about all participants
- **Response:**
  ```json
  [
    {
      "name": "John Doe",
      "rollNo": "12345",
      "branch": "Computer Science",
      "score": 85,
      "submittedAt": "2024-01-15T10:30:00Z",
      "answers": [0, 2, 1, 3, ...]
    },
    ...
  ]
  ```

### 5. New Endpoint: Download Participant PDF
**Endpoint:** `GET /api/quiz/participant-pdf/:code/:rollNo`
- **Authentication:** Required (Bearer token)
- **Authorization:** Verify quiz belongs to authenticated creator
- **Purpose:** Generate and download PDF for specific participant
- **Response:** PDF file (application/pdf)
- **Features:** 
  - Include logo and organization name if provided
  - Show participant details, answers, score
  - Same format as submit endpoint PDF

### 6. Quiz Creation Endpoint Updates
**Endpoint:** `POST /api/quiz/create`
- **Changes Needed:** Accept new fields in request body
- **Request Body:**
  ```json
  {
    "title": "Quiz Title",
    "description": "Quiz Description",
    "duration": 3620,
    "questions": [...],
    "orgName": "Optional Organization Name",
    "logoUrl": "Optional Logo URL",
    "negativeMarking": false
  }
  ```

### 7. Score Calculation Updates (Already Implemented)
- When `negativeMarking` is true: Deduct 0.25 points for wrong answers
- When `negativeMarking` is false: No deduction for wrong answers

## Notes
- All endpoints should maintain backward compatibility
- Handle missing logo URLs gracefully
- Ensure PDF generation works even if logo URL is broken
- Validate file types for logo upload (png, jpg, jpeg, svg)
