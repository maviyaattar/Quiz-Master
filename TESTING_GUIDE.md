# Quiz Master Enhancement - Testing Guide

## Overview
This guide provides instructions for testing the newly implemented features in the Quiz Master application.

## Prerequisites
- Backend server running at: `https://quiz-backend-production-4aaf.up.railway.app`
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Valid user account for authentication

## Testing Scenarios

### 1. Quiz Creation with New Features

#### Test Case 1.1: Create Quiz with Organization Branding
**Steps:**
1. Navigate to `/create.html`
2. Fill in the required fields:
   - Test Title: "Sample Quiz"
   - Description: "Test Description"
   - Duration: "30" minutes
3. Fill in the optional Organization Name: "Test Organization"
4. Click "Choose Logo" button
5. Upload a PNG or JPG image (max 5MB)
6. Verify logo preview appears
7. Check the "Enable Negative Marking" checkbox
8. Add at least one question
9. Click "Create Test"

**Expected Results:**
- Logo preview displays correctly
- Upload progress indicator shown
- Success message appears
- Redirect to dashboard
- Quiz created with all metadata

#### Test Case 1.2: Create Quiz Without Optional Fields
**Steps:**
1. Navigate to `/create.html`
2. Fill in only required fields (title, description, duration, questions)
3. Leave Organization Name empty
4. Do not upload a logo
5. Leave Negative Marking unchecked
6. Click "Create Test"

**Expected Results:**
- Quiz creates successfully
- No errors for missing optional fields
- Backward compatibility maintained

#### Test Case 1.3: Logo Upload Validation
**Steps:**
1. Navigate to `/create.html`
2. Try uploading an SVG file

**Expected Results:**
- Error message: "Please upload a valid image file (PNG, JPG, JPEG)"
- File input cleared

**Steps:**
1. Try uploading a file larger than 5MB

**Expected Results:**
- Error message: "File size must be less than 5MB"
- File input cleared

#### Test Case 1.4: Remove Logo
**Steps:**
1. Upload a valid logo image
2. Click the "X" button on logo preview

**Expected Results:**
- Logo preview disappears
- Logo URL cleared from state
- Can upload a different logo

### 2. Test Taking Experience

#### Test Case 2.1: Quiz Header Display with Branding
**Steps:**
1. Join a quiz that has organization name and logo
2. Wait for quiz to start

**Expected Results:**
- Quiz info header displays at top
- Organization logo shows (max 60px height)
- Organization name displayed
- Quiz title displayed
- Header is responsive

#### Test Case 2.2: Quiz Without Branding
**Steps:**
1. Join a quiz without organization name/logo
2. Wait for quiz to start

**Expected Results:**
- Quiz functions normally
- No broken layout
- Only quiz title shows (if available)

#### Test Case 2.3: Broken Logo URL
**Steps:**
1. Manually create a quiz with invalid logo URL in database
2. Join the quiz

**Expected Results:**
- Logo fails to load gracefully
- No broken image icon
- Rest of quiz functions normally

### 3. Results Page

#### Test Case 3.1: Navigate to Results Page
**Steps:**
1. Navigate to quiz dashboard (`/test.html?code=XXXXX`)
2. Click "Show Results" button

**Expected Results:**
- Navigate to `/results.html?code=XXXXX`
- Page loads successfully
- Quiz title and description displayed

#### Test Case 3.2: Participants Tab
**Steps:**
1. On results page, ensure "Participants" tab is selected
2. View participants table

**Expected Results:**
- Table displays with columns: Name, Roll No, Branch, Score, Submitted At, Actions
- All participants shown
- PDF download button for each participant

#### Test Case 3.3: Search Functionality
**Steps:**
1. On Participants tab, type in search box
2. Enter partial name: "John"
3. Clear search and enter roll number

**Expected Results:**
- Table filters in real-time
- Shows only matching participants
- Clear search shows all participants again

#### Test Case 3.4: Download Participant PDF
**Steps:**
1. Click "PDF" button for a participant

**Expected Results:**
- Loading indicator appears
- PDF downloads successfully
- File named: `{rollNo}_results.pdf`
- Success notification appears

#### Test Case 3.5: Leaderboard Tab
**Steps:**
1. Click "Leaderboard" tab
2. View leaderboard

**Expected Results:**
- Participants sorted by score (highest first)
- Top 3 have medal icons (🥇 🥈 🥉)
- All participants show rank, name, roll no, score

#### Test Case 3.6: Summary Tab
**Steps:**
1. Click "Summary" tab
2. View statistics

**Expected Results:**
- Three cards displayed:
  - Total Participants count
  - Highest Score
  - Average Score (2 decimal places)
- Cards have appropriate icons

#### Test Case 3.7: Tab Switching
**Steps:**
1. Click through all three tabs multiple times

**Expected Results:**
- Tabs switch smoothly
- Active tab highlighted
- Content loads correctly each time
- No data loss between switches

#### Test Case 3.8: Back Button
**Steps:**
1. On results page, click back arrow
2. Verify navigation

**Expected Results:**
- Returns to quiz dashboard
- Quiz details still visible

### 4. Mobile Responsiveness

#### Test Case 4.1: Create Form on Mobile
**Steps:**
1. Open `/create.html` on mobile device or browser dev tools (width < 768px)
2. Test all form interactions

**Expected Results:**
- Form fields stack vertically
- Logo preview responsive
- All buttons accessible
- No horizontal scrolling

#### Test Case 4.2: Quiz Header on Mobile
**Steps:**
1. Take quiz on mobile device
2. View quiz header

**Expected Results:**
- Logo and text stack vertically
- Content centered
- Readable and accessible

#### Test Case 4.3: Results Page on Mobile
**Steps:**
1. View results page on mobile
2. Test all tabs

**Expected Results:**
- Table scrollable horizontally if needed
- Tabs wrap appropriately
- Search bar full width
- Summary cards stack vertically
- All interactions work

### 5. Security Testing

#### Test Case 5.1: XSS Prevention
**Steps:**
1. Try to create quiz with title: `<script>alert('XSS')</script>`
2. View the quiz

**Expected Results:**
- Script tag rendered as text
- No script execution
- Content properly escaped

#### Test Case 5.2: File Upload Security
**Steps:**
1. Try to upload various file types
2. Test with renamed files (e.g., .txt renamed to .png)

**Expected Results:**
- Only PNG, JPG, JPEG accepted
- SVG files rejected
- File type validation works correctly

### 6. Backward Compatibility

#### Test Case 6.1: Existing Quizzes
**Steps:**
1. View quizzes created before this update
2. Attempt to edit them
3. Take those quizzes

**Expected Results:**
- All existing quizzes work normally
- No errors for missing new fields
- Edit functionality preserved

### 7. Error Handling

#### Test Case 7.1: Network Errors
**Steps:**
1. Disconnect network during logo upload
2. Try to load results with no connection

**Expected Results:**
- Appropriate error messages
- No crashes or blank pages
- Graceful degradation

#### Test Case 7.2: Invalid Quiz Code
**Steps:**
1. Navigate to `/results.html?code=INVALID`

**Expected Results:**
- Error message displayed
- Option to return to dashboard
- No console errors

## Performance Testing

### Load Time
- **Create page**: Should load < 2 seconds
- **Results page**: Should load < 3 seconds
- **Logo upload**: Should complete < 5 seconds for 1MB file

### Search Performance
- Search should filter instantly (< 100ms)
- No lag with up to 1000 participants

## Browser Compatibility

Test all features on:
- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Enter key submits forms
- [ ] Escape key closes modals
- [ ] Arrow keys work in dropdowns

### Screen Reader
- [ ] All buttons have labels
- [ ] Form fields have labels
- [ ] Tables have headers
- [ ] Loading states announced

## Bug Reporting

If you find any issues, please report:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and version
5. Screenshots if applicable

## Test Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Quiz Creation - Org Name | ⏳ Pending | Backend required |
| Quiz Creation - Logo Upload | ⏳ Pending | Backend required |
| Quiz Creation - Negative Marking | ⏳ Pending | Backend required |
| Test Taking - Quiz Header | ⏳ Pending | Backend required |
| Results - Participants Tab | ⏳ Pending | Backend required |
| Results - Search | ✅ Ready | Client-side only |
| Results - PDF Download | ⏳ Pending | Backend required |
| Results - Leaderboard | ⏳ Pending | Backend required |
| Results - Summary | ⏳ Pending | Backend required |
| Mobile Responsive | ✅ Ready | Frontend only |
| Security - XSS Prevention | ✅ Verified | CodeQL passed |

**Legend:**
- ✅ Ready: Can be tested with current frontend
- ⏳ Pending: Requires backend implementation
- ❌ Failed: Issue found

---

**Last Updated:** February 11, 2026
**Version:** 1.0.0
