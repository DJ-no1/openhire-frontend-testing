# Job Detail Page & Data Extraction System

## Overview

This implementation provides a comprehensive job management system for recruiters with the following key features:

1. **Job Detail View Page** (`/recruiters/jobs/[id]`)
2. **Structured Data Extraction** from job descriptions
3. **Edit Mode** with React Markdown support and Textarea components
4. **Key-Value Pair Analysis** of job data

## Features

### 📄 Job Detail Page

**Route**: `/recruiters/jobs/[id]`
**Component**: `src/app/recruiters/jobs/[id]/page.tsx`

#### View Mode

- **Job Overview**: Title, company, location, salary, type, deadline, interview duration
- **Skills Display**: Badge-based skill visualization
- **Structured Sections**:
  - Requirements (with bullet points)
  - Responsibilities (with bullet points)
  - Benefits (with checkmark icons)
  - Experience Level (markdown formatted)
- **Job Statistics**: Application count, creation date, status
- **Data Analysis Card**: Extracted key-value pairs from description

#### Edit Mode

- **Form Fields**: All job details editable
- **Skill Selector**: Interactive skill selection component
- **Textarea Components**: For editing experience requirements
- **Editable Lists**: Add/remove/edit requirements, responsibilities, and benefits
- **Save/Cancel**: Persistent changes to database

### 🔍 Data Extraction System

**Module**: `src/lib/job-description-parser.ts`

#### Extracted Data Structure

```typescript
interface ExtractedJobData {
  benefits: string[];
  requirements: string[];
  responsibilities: string[];
  experience: string;
}
```

#### Key-Value Pairs Analysis

- **Benefits Count**: Number of benefits listed
- **Requirements Count**: Number of requirements
- **Responsibilities Count**: Number of responsibilities
- **Experience Level**: Whether experience info exists
- **Total Structured Items**: Sum of all structured elements
- **Individual Arrays**: Full benefits, requirements, responsibilities lists

#### Smart Parsing

The parser intelligently extracts structured data from:

- **Already Structured JSON**: Direct extraction
- **Text Descriptions**: Pattern-based parsing
- **Bullet Points**: Automatic categorization
- **Section Headers**: Recognition of common patterns

#### Pattern Recognition

- **Benefits**: "benefits", "perks", "what we offer", insurance, vacation, remote
- **Requirements**: "requirements", "qualifications", "skills", experience, degree
- **Responsibilities**: "responsibilities", "duties", "what you'll do", develop, manage
- **Experience**: Years of experience, seniority levels, entry/senior/mid-level

### 🎨 Components

#### JobDataExtractor

**File**: `src/components/job-data-extractor.tsx`

- **Visual Analysis**: Color-coded categories
- **Smart Rendering**: Different display formats for arrays, booleans, numbers
- **Badge System**: Organized display of extracted data
- **Responsive Layout**: Grid-based responsive design

#### JobSkillSelector Integration

- **Multi-select**: Choose from predefined skill categories
- **Custom Skills**: Add custom skills not in predefined list
- **Validation**: Proper type safety and skill management

### 🛠️ Technical Implementation

#### Navigation

- **From Jobs List**: Click on job title or "View Details"
- **Edit Action**: "Edit Job" button or dropdown menu option
- **Back Navigation**: Breadcrumb-style back button

#### Error Handling

- **Job Not Found**: Proper error display
- **Permission Check**: Verify recruiter owns the job
- **Loading States**: Skeleton loading while fetching
- **Save Errors**: Display API errors during updates

#### TypeScript Safety

- **Type Definitions**: Full type safety for all job interfaces
- **Error Boundaries**: Proper error handling
- **Optional Chaining**: Safe access to nested properties

### 📱 UI/UX Features

#### Responsive Design

- **Mobile Friendly**: Responsive grid layouts
- **Card Layout**: Clean card-based organization
- **Icon Integration**: Lucide React icons throughout
- **Status Badges**: Visual status indicators

#### Interactive Elements

- **Clickable Titles**: Navigate to detail view from list
- **Dropdown Menus**: Action menus for each job
- **Modal Forms**: Job creation via modal instead of page
- **Editable Lists**: Dynamic add/remove for list items

#### Visual Indicators

- **Status Colors**: Green (active), Gray (inactive), Red (expired)
- **Category Colors**: Different colors for benefits, requirements, etc.
- **Progress Indicators**: Loading states and saving feedback

### 🔄 Data Flow

#### Job Fetching

1. **API Call**: `jobService.getJobById(jobId)`
2. **Permission Check**: Verify recruiter ownership
3. **Data Processing**: Extract structured data
4. **State Update**: Update component state with job data

#### Job Updating

1. **Form Validation**: Validate all required fields
2. **Data Transformation**: Convert form data to API format
3. **API Update**: `jobService.updateJob(updateData)`
4. **State Sync**: Update local state with response
5. **UI Feedback**: Success/error notifications

#### Data Extraction

1. **Input Analysis**: Determine if data is structured or text
2. **Pattern Matching**: Apply regex patterns for text parsing
3. **Categorization**: Sort extracted items into appropriate categories
4. **Deduplication**: Remove duplicate entries
5. **Formatting**: Clean and format extracted data

### 🚀 Usage Examples

#### Viewing Job Details

```typescript
// Navigate programmatically
router.push(`/recruiters/jobs/${jobId}`);

// Or click from jobs list
<button onClick={() => router.push(`/recruiters/jobs/${job.id}`)}>
  {job.title}
</button>;
```

#### Extracting Data

```typescript
import { extractKeyValuePairs } from "@/lib/job-description-parser";

const keyValueData = extractKeyValuePairs(job.description);
console.log("Benefits:", keyValueData.Benefits);
console.log("Requirements:", keyValueData.Requirements);
```

#### Using JobDataExtractor

```jsx
<JobDataExtractor
  description={job.description}
  title="Job Description Analysis"
/>
```

### 🔧 Configuration

#### Environment Setup

Ensure the following are configured:

- **API Base URL**: Set in `src/lib/api.ts`
- **Authentication**: User context available
- **Job Service**: Properly configured endpoints

#### Dependencies

- **React Markdown**: For formatted text display
- **Shadcn/UI**: Textarea, Card, Badge, Button components
- **Lucide React**: Icons for UI elements
- **TypeScript**: Full type safety

### 📋 Key Benefits

1. **Complete CRUD Operations**: View, edit, update job postings
2. **Intelligent Data Parsing**: Extract structure from any job description format
3. **Rich Text Support**: Markdown rendering for formatted content
4. **Type Safety**: Full TypeScript implementation
5. **Responsive Design**: Works on all device sizes
6. **User Experience**: Intuitive navigation and editing
7. **Data Insights**: Visual analysis of job description components
8. **Accessibility**: Proper semantic HTML and ARIA labels

### 🔮 Future Enhancements

- **Bulk Operations**: Edit multiple jobs at once
- **Template Library**: Pre-defined job description templates
- **Analytics Dashboard**: Job performance metrics
- **AI Suggestions**: Smart recommendations for improvements
- **Export Features**: PDF/CSV export of job details
- **Version History**: Track changes over time
- **Collaboration**: Multi-recruiter editing support

This system provides a comprehensive solution for managing job postings with intelligent data extraction and a modern, intuitive user interface.
