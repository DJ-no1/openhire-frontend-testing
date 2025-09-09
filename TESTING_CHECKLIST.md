# Resume Analysis Tab Testing Checklist

## 🔧 Pre-Testing Setup

### 1. Database Verification

- [ ] Verify Supabase environment variables are set correctly
- [ ] Check that `user_resume` table exists and has data
- [ ] Confirm `applications` table has records with valid `resume_url` references
- [ ] Test Row Level Security (RLS) policies allow recruiter access

### 2. Application Setup

- [ ] Start the development server: `pnpm dev`
- [ ] Navigate to a valid application: `/recruiters/dashboard/applications/[id]/interview-analysis`
- [ ] Open browser developer tools (F12)
- [ ] Switch to Console and Network tabs

## 🧪 Testing Scenarios

### Scenario 1: Application with Complete Resume Data

**URL**: `/recruiters/dashboard/applications/[valid-app-id]/interview-analysis`

Expected Results:

- [ ] Loading state appears briefly
- [ ] Resume tab loads with analysis cards
- [ ] Overall score displays prominently
- [ ] Six analysis cards show with real data
- [ ] Expandable content works correctly
- [ ] No console errors

Debug Steps:

- [ ] Click "Debug Data" button (development mode)
- [ ] Check console for data structure
- [ ] Verify scoring_details is parsed correctly

### Scenario 2: Application with Resume but No Analysis

**Expected**: Application exists, resume uploaded, but scoring_details is null

Expected Results:

- [ ] Shows "Resume Analysis Pending" state
- [ ] Displays candidate and job information
- [ ] Shows resume upload status
- [ ] "Check for Updates" button works

### Scenario 3: Application with No Resume

**Expected**: Application exists but no resume uploaded

Expected Results:

- [ ] Shows "No Resume Data Available" state
- [ ] Displays helpful message
- [ ] "Check Again" button works
- [ ] No errors in console

### Scenario 4: Invalid Application ID

**URL**: `/recruiters/dashboard/applications/invalid-id/interview-analysis`

Expected Results:

- [ ] Shows error state with clear message
- [ ] Retry button available
- [ ] Graceful error handling

### Scenario 5: Network/Database Issues

**Test**: Disconnect network or break Supabase connection

Expected Results:

- [ ] Loading state appears
- [ ] Error state shows after timeout
- [ ] Retry functionality works when connection restored

## 🔍 Debug Information to Check

### Console Logs

Look for these log messages:

- [ ] "🔍 Fetching resume data for application: [id]"
- [ ] "✅ Application data fetched: [data]"
- [ ] "📄 Resume data fetched: [data]"
- [ ] "🎯 Transformed data ready for component: [data]"

### Network Requests

Check Network tab for:

- [ ] POST request to Supabase (applications table)
- [ ] POST request to Supabase (user_resume table)
- [ ] Successful responses (200 status)
- [ ] Response data includes expected fields

### Data Structure Verification

Use Debug Data button to verify:

```javascript
{
  actualApplicationDetails: {
    candidate_name: "...",
    job_title: "...",
    resume_data: {
      scoring_details: { /* JSONB object */ }
    }
  }
}
```

## 🐛 Common Issues and Solutions

### Issue: "No Resume Data Available"

**Causes**:

- [ ] Application ID doesn't exist in database
- [ ] RLS policies block access
- [ ] No resume record with matching application_id

**Debug**:

```sql
-- Check in Supabase SQL editor
SELECT * FROM applications WHERE id = 'your-app-id';
SELECT * FROM user_resume WHERE application_id = 'your-app-id';
```

### Issue: "Resume Analysis Pending"

**Causes**:

- [ ] Resume exists but scoring_details is null
- [ ] scoring_details is empty object {}
- [ ] JSONB parsing failed

**Debug**:

```sql
SELECT scoring_details FROM user_resume WHERE application_id = 'your-app-id';
```

### Issue: Loading Forever

**Causes**:

- [ ] Network connectivity issues
- [ ] Supabase authentication problems
- [ ] RLS policy blocking query

**Debug**:

- Check Network tab for failed requests
- Verify environment variables
- Test direct Supabase queries

### Issue: Console Errors

**Common Errors**:

- [ ] `Cannot read property 'dimension_breakdown' of undefined`
- [ ] `Supabase client error`
- [ ] `Authentication required`

**Solutions**:

- Check data structure in debug logs
- Verify Supabase client initialization
- Ensure user is authenticated

## ✅ Success Criteria

### Component Functionality

- [ ] Loads resume data from Supabase correctly
- [ ] Displays all analysis cards with real data
- [ ] Shows proper loading and error states
- [ ] Handles missing data gracefully
- [ ] Refresh/retry functionality works

### Data Quality

- [ ] scoring_details JSONB is parsed correctly
- [ ] All dimension scores display properly
- [ ] Risk flags and hard failures show correctly
- [ ] Evidence arrays are displayed in cards

### User Experience

- [ ] Visual feedback during loading
- [ ] Clear error messages
- [ ] Actionable next steps
- [ ] Smooth animations and interactions

### Performance

- [ ] Data loads within 2 seconds
- [ ] No memory leaks or excessive re-renders
- [ ] Efficient database queries

## 📋 Test Results Template

```
Date: [Date]
Tester: [Name]
Application ID: [ID]

✅ Scenario 1 (Complete Data): PASS/FAIL
✅ Scenario 2 (Pending Analysis): PASS/FAIL
✅ Scenario 3 (No Resume): PASS/FAIL
✅ Scenario 4 (Invalid ID): PASS/FAIL
✅ Scenario 5 (Network Issues): PASS/FAIL

Issues Found:
- [ ] Issue 1: Description
- [ ] Issue 2: Description

Notes:
- Performance: [Excellent/Good/Needs Improvement]
- Data Accuracy: [Verified/Issues Found]
- Error Handling: [Robust/Needs Work]
```

## 🚀 Production Readiness

Before deployment, ensure:

- [ ] All test scenarios pass
- [ ] No console errors in production build
- [ ] RLS policies properly configured
- [ ] Performance benchmarks met
- [ ] Error monitoring configured
- [ ] Database indexes optimized for queries
