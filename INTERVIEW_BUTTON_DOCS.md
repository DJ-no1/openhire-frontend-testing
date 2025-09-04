# InterviewButton Component

A dynamic button component that determines its state based on resume threshold, score comparison, and interview status.

## Features

- **Smart Logic**: Automatically determines button state based on job requirements and candidate data
- **Multiple States**: Handles various scenarios from blocking interviews to showing results
- **Visual Feedback**: Color-coded buttons with appropriate icons and tooltips
- **Error Handling**: Graceful handling of missing data and database errors

## Usage

```tsx
import { InterviewButton } from '@/components/interview-button';

function ApplicationPage() {
    return (
        <InterviewButton 
            applicationId="your-application-id"
            className="optional-custom-classes"
        />
    );
}
```

## Button States

### 1. Loading State
- **Text**: "Loading..."
- **Color**: Gray
- **Status**: Disabled
- **When**: Data is being fetched

### 2. No Resume Threshold (Default Allow)
- **Text**: "Start Interview"
- **Color**: Blue  
- **Status**: Enabled
- **When**: `job.description.resume_threshold` is null/undefined

### 3. Score Below Threshold (Blocked)
- **Text**: "Not Allowed to Interview"
- **Color**: Red
- **Status**: Disabled
- **When**: `resume_score < resume_threshold`
- **Tooltip**: Shows actual scores vs requirement

### 4. Score Meets Threshold - No Interview
- **Text**: "Start Interview"
- **Color**: Blue
- **Status**: Enabled
- **When**: `resume_score >= resume_threshold` AND no interview exists

### 5. Score Meets Threshold - Interview Completed
- **Text**: "View Results"
- **Color**: Green
- **Status**: Enabled
- **When**: `resume_score >= resume_threshold` AND interview status is "completed"

### 6. Score Meets Threshold - Interview In Progress
- **Text**: "Resume Interview"
- **Color**: Blue
- **Status**: Enabled
- **When**: `resume_score >= resume_threshold` AND interview exists but not completed

## Error States

### No Resume Found
- **Text**: "No Resume Found"
- **Color**: Orange
- **Status**: Disabled
- **When**: Application has no associated resume

### Invalid Threshold
- **Text**: "Invalid Threshold"
- **Color**: Orange
- **Status**: Disabled
- **When**: Resume threshold is not a valid number

### Database Error
- **Text**: "Error Loading"
- **Color**: Gray
- **Status**: Disabled
- **When**: Database query fails

## Database Requirements

The component expects the following database structure:

### Tables Used
- `applications` - Main application data
- `jobs` - Job details including resume threshold
- `user_resume` - Resume data with scores
- `interviews` - Interview records
- `interview_artifacts` - Interview results and status

### Key Fields
- `jobs.description.resume_threshold` - Minimum score requirement (string)
- `user_resume.score` - Candidate's resume score (number)
- `interview_artifacts.status` - Interview completion status
- `applications.resume_url` - Link to resume record (UUID)

## Navigation

The button automatically navigates to appropriate pages:
- **Start Interview**: `/dashboard/application/{id}/permission`
- **Resume Interview**: `/dashboard/application/{id}/interview`
- **View Results**: `/dashboard/application/{id}/interview-result`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `applicationId` | `string` | Required | The application ID to fetch data for |
| `className` | `string` | `""` | Additional CSS classes to apply |

## Implementation Notes

1. **Performance**: Data is fetched only once on component mount
2. **Error Handling**: All database errors are handled gracefully
3. **Accessibility**: Includes tooltips for disabled states
4. **Responsive**: Works with any container size
5. **Type Safety**: Full TypeScript support

## Testing

Use the `InterviewButtonTestPage` component to test different scenarios:

```tsx
import { InterviewButtonTestPage } from '@/components/interview-button-test';
```

## Customization

The component uses Tailwind CSS classes and can be customized via:
- `className` prop for additional styles
- CSS variables for color overrides
- Component-level style modifications
