# Backend API Changes Required for Quiz Master Enhancements

This document outlines the backend API changes required to support the new features implemented in the frontend.

## Table of Contents
1. [Existing Endpoints to Modify](#existing-endpoints-to-modify)
2. [New Endpoints to Create](#new-endpoints-to-create)
3. [Database Schema Updates](#database-schema-updates)
4. [Implementation Examples](#implementation-examples)

---

## Existing Endpoints to Modify

### 1. POST `/api/quiz/create`
**Status:** Already supports these fields (no changes needed)

**Expected Payload:**
```json
{
  "title": "Quiz Title",
  "description": "Quiz Description",
  "duration": 3620,
  "questions": [...],
  "orgName": "Organization Name",      // NEW (optional)
  "logoUrl": "https://cloudinary.../logo.png",  // NEW (optional)
  "negativeMarking": true              // NEW (optional)
}
```

### 2. GET `/api/quiz/questions/:code`
**Status:** NEEDS MODIFICATION

**Current Response:**
```json
{
  "endTime": "2024-01-15T10:30:00Z",
  "questions": [...]
}
```

**Updated Response Required:**
```json
{
  "endTime": "2024-01-15T10:30:00Z",
  "orgName": "Organization Name",     // ADD THIS
  "logoUrl": "https://cloudinary.../logo.png",  // ADD THIS
  "questions": [...]
}
```

**Implementation:**
```javascript
app.get("/api/quiz/questions/:code", async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.code });
    
    if (!quiz || quiz.status !== 'live') {
      return res.status(404).json({ msg: "Quiz not found or not started" });
    }
    
    res.json({
      endTime: quiz.endTime,
      orgName: quiz.orgName || null,        // ADD THIS LINE
      logoUrl: quiz.logoUrl || null,        // ADD THIS LINE
      questions: quiz.questions.map(q => ({
        text: q.text,
        options: q.options
      }))
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
```

### 3. POST `/api/upload-logo`
**Status:** Already implemented (confirmed in problem statement)

**Expected Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: File with field name `logo`
- Auth: Required (Bearer token)

**Expected Response:**
```json
{
  "url": "https://cloudinary.../logo.png",
  "msg": "Logo uploaded successfully"
}
```

---

## New Endpoints to Create

### 1. GET `/api/quiz/participant-pdf/:code/:rollNo`
**Status:** REQUIRED FOR PDF DOWNLOAD FEATURE

**Purpose:** Generate and download PDF result for a specific participant

**Auth Required:** Yes (JWT Bearer token)

**Request:**
- Method: GET
- Path Parameters:
  - `code`: Quiz code
  - `rollNo`: Student's roll number
- Headers:
  - `Authorization: Bearer <token>`

**Response:**
- Success: PDF file download (Content-Type: application/pdf)
- Error: JSON with error message

**Implementation Example:**
```javascript
app.get("/api/quiz/participant-pdf/:code/:rollNo", auth, async (req, res) => {
  try {
    const { code, rollNo } = req.params;
    
    // Find quiz
    const quiz = await Quiz.findOne({ code });
    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    
    // Verify quiz belongs to the authenticated creator
    if (quiz.creatorId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    
    // Find submission
    const submission = await Submission.findOne({ 
      quizCode: code, 
      rollNo: rollNo 
    });
    
    if (!submission) {
      return res.status(404).json({ msg: "Submission not found" });
    }
    
    // Calculate score (reuse existing scoring logic)
    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (submission.answers[i] === q.correctIndex) {
        score += 1;
      } else if (quiz.negativeMarking && submission.answers[i] !== undefined) {
        score -= 0.25;
      }
    });
    
    // Generate PDF (reuse existing PDF generation code)
    const pdfBuffer = await generatePDF({
      quiz: {
        title: quiz.title,
        orgName: quiz.orgName,
        logoUrl: quiz.logoUrl
      },
      participant: {
        name: submission.name,
        rollNo: submission.rollNo,
        branch: submission.branch,
        score: score,
        submittedAt: submission.submittedAt
      },
      questions: quiz.questions,
      answers: submission.answers
    });
    
    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quiz-result-${rollNo}.pdf`);
    res.send(pdfBuffer);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
```

### 2. GET `/api/quiz/submissions/:code` (Optional)
**Status:** OPTIONAL (for future enhancement)

**Purpose:** Get all submissions for a quiz (for more detailed results page)

**Auth Required:** Yes (JWT Bearer token)

**Request:**
- Method: GET
- Path Parameter: `code` - Quiz code
- Headers: `Authorization: Bearer <token>`

**Response:**
```json
{
  "quiz": {
    "code": "ABC123",
    "title": "Quiz Title",
    "status": "ended"
  },
  "submissions": [
    {
      "name": "John Doe",
      "rollNo": "2021001",
      "branch": "CSE",
      "score": 8.75,
      "submittedAt": "2024-01-15T10:25:00Z",
      "answers": [0, 1, 2, 3, ...]
    },
    ...
  ]
}
```

**Implementation Example:**
```javascript
app.get("/api/quiz/submissions/:code", auth, async (req, res) => {
  try {
    const { code } = req.params;
    
    // Find quiz
    const quiz = await Quiz.findOne({ code });
    if (!quiz) {
      return res.status(404).json({ msg: "Quiz not found" });
    }
    
    // Verify quiz belongs to the authenticated creator
    if (quiz.creatorId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    
    // Get all submissions
    const submissions = await Submission.find({ quizCode: code });
    
    // Calculate scores for each submission
    const submissionsWithScores = submissions.map(sub => {
      let score = 0;
      quiz.questions.forEach((q, i) => {
        if (sub.answers[i] === q.correctIndex) {
          score += 1;
        } else if (quiz.negativeMarking && sub.answers[i] !== undefined) {
          score -= 0.25;
        }
      });
      
      return {
        name: sub.name,
        rollNo: sub.rollNo,
        branch: sub.branch,
        score: score,
        submittedAt: sub.submittedAt,
        answers: sub.answers
      };
    });
    
    res.json({
      quiz: {
        code: quiz.code,
        title: quiz.title,
        status: quiz.status
      },
      submissions: submissionsWithScores
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});
```

---

## Database Schema Updates

### Quiz Model
**Add these optional fields to the Quiz schema:**

```javascript
const quizSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // NEW FIELDS
  orgName: {
    type: String,
    required: false,
    maxlength: 100
  },
  
  logoUrl: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        // Validate URL format
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid logo URL format'
    }
  },
  
  negativeMarking: {
    type: Boolean,
    default: false
  }
  
  // ... rest of schema ...
});
```

### Submission Model
**No changes required** - existing schema should work

---

## Implementation Checklist

### Priority 1: Essential for Core Features
- [x] ✅ POST `/api/quiz/create` - Already supports new fields
- [ ] 🔴 GET `/api/quiz/questions/:code` - MUST ADD orgName and logoUrl to response
- [x] ✅ POST `/api/upload-logo` - Already implemented
- [ ] 🔴 Database schema - ADD orgName, logoUrl, negativeMarking to Quiz model

### Priority 2: Required for Full Functionality
- [ ] 🟡 GET `/api/quiz/participant-pdf/:code/:rollNo` - For individual PDF downloads
- [ ] 🟡 Update scoring logic to support negative marking

### Priority 3: Optional Enhancements
- [ ] ⚪ GET `/api/quiz/submissions/:code` - For enhanced results view
- [ ] ⚪ Add PDF generation with logo in header

---

## Testing Endpoints

### Test Quiz Creation with New Fields
```bash
curl -X POST http://localhost:5000/api/quiz/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Quiz",
    "description": "Test Description",
    "duration": 3600,
    "orgName": "Test University",
    "logoUrl": "https://example.com/logo.png",
    "negativeMarking": true,
    "questions": [...]
  }'
```

### Test Questions Endpoint
```bash
curl -X GET http://localhost:5000/api/quiz/questions/ABC123
```

**Expected Response:**
```json
{
  "endTime": "2024-01-15T10:30:00Z",
  "orgName": "Test University",
  "logoUrl": "https://example.com/logo.png",
  "questions": [...]
}
```

### Test PDF Download
```bash
curl -X GET http://localhost:5000/api/quiz/participant-pdf/ABC123/2021001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output result.pdf
```

---

## Notes for Backend Developer

1. **Security Considerations:**
   - Validate all file uploads (size, type, malicious content)
   - Sanitize all user inputs before saving to database
   - Verify quiz ownership before allowing PDF downloads
   - Use proper authentication middleware for protected endpoints

2. **Performance Optimizations:**
   - Cache quiz data for frequently accessed quizzes
   - Use async/await properly to avoid blocking
   - Consider pagination for large submission lists

3. **Error Handling:**
   - Return appropriate HTTP status codes
   - Provide clear error messages
   - Log errors for debugging

4. **Negative Marking Logic:**
   - Correct answer: +1 point
   - Incorrect answer (when negative marking enabled): -0.25 points
   - Unanswered: 0 points

5. **Logo Upload:**
   - Already implemented via Cloudinary
   - Max file size: 5MB (enforced in frontend)
   - Accepted formats: image/* (enforced in frontend)

---

## Questions or Issues?

If you encounter any issues implementing these changes, please check:
1. Frontend console for error messages
2. Network tab for API responses
3. Backend logs for server errors
4. This documentation for correct request/response formats

For additional support, refer to the main implementation summary or contact the development team.
