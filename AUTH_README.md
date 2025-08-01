# OpenHire - AI-Powered Recruitment Platform

## Authentication System

We have successfully implemented a comprehensive authentication system for both recruiters and candidates with the following features:

### Features Implemented

#### 🔐 **Authentication**

- **Role-based authentication** (Recruiters and Candidates)
- **Supabase integration** for user management
- **Email/password authentication**
- **Password reset functionality**
- **Automatic redirects** based on user roles

#### 🛡️ **Security**

- **Protected routes** with middleware
- **Role-based access control**
- **Authentication context** for state management
- **Secure session handling**

#### 🎨 **User Interface**

- **Modern design** with Tailwind CSS and shadcn/ui
- **Responsive layouts** for all screen sizes
- **Dark mode support**
- **Professional landing page**
- **Intuitive dashboards** for both user types

### Project Structure

```
src/
├── app/
│   ├── auth/                    # Candidate authentication
│   │   ├── signin/page.tsx      # Candidate sign in
│   │   └── signup/page.tsx      # Candidate sign up
│   ├── recruiters/
│   │   ├── auth/                # Recruiter authentication
│   │   │   ├── signin/page.tsx  # Recruiter sign in
│   │   │   └── signup/page.tsx  # Recruiter sign up
│   │   └── dashboard/page.tsx   # Recruiter dashboard
│   ├── dashboard/page.tsx       # Candidate dashboard
│   ├── layout.tsx               # Root layout with AuthProvider
│   └── page.tsx                 # Landing page
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── app-navigation.tsx       # Navigation component
│   └── protected-route.tsx      # Route protection wrapper
├── hooks/
│   └── use-auth.tsx            # Authentication context & hook
├── lib/
│   ├── auth.ts                 # Authentication utilities
│   ├── supabaseClient.ts       # Supabase client configuration
│   └── utils.ts                # Utility functions
└── middleware.ts               # Route protection middleware
```

### Database Schema

The application uses the following Supabase tables:

#### `users` table

- `id` (uuid, primary key)
- `email` (text, unique)
- `role` (text, 'recruiter' or 'candidate')
- `name` (text)
- `created_at` (timestamp)

#### `jobs` table

- `id` (uuid, primary key)
- `recruiter_id` (uuid, foreign key to users)
- `title` (text)
- `description` (text)
- `salary` (text)
- `skills` (text)
- `job_type` (text)
- `created_at` (timestamp)
- `end_date` (timestamp)
- `job_link` (text)

#### `applications` table

- `id` (uuid, primary key)
- `job_id` (uuid, foreign key to jobs)
- `candidate_id` (uuid, foreign key to users)
- `resume_url` (uuid, foreign key to user_resume)
- `status` (text, default 'applied')
- `created_at` (timestamp)

#### `interviews` table

- `id` (uuid, primary key)
- `application_id` (uuid, foreign key to applications)
- `start_time` (timestamp)
- `end_time` (timestamp)
- `ai_summary` (text)
- `confidence` (integer)
- `knowledge_score` (integer)
- `result` (text)
- `created_at` (timestamp)

#### `interview_artifacts` table

- `id` (uuid, primary key)
- `interview_id` (uuid, foreign key to interviews)
- `conversation` (jsonb)
- `image_url` (text)
- `timestamp` (timestamp)
- `detailed_score` (jsonb)
- `overall_score` (numeric)
- `overall_feedback` (text)
- `status` (text)

#### `user_resume` table

- `id` (uuid, primary key)
- `application_id` (uuid, foreign key to applications)
- `file_path` (text)
- `score` (numeric)
- `scoring_details` (jsonb)
- `created_at` (timestamp)

### Routes

#### **Public Routes**

- `/` - Landing page with role selection
- `/auth/signin` - Candidate sign in
- `/auth/signup` - Candidate sign up
- `/recruiters/auth/signin` - Recruiter sign in
- `/recruiters/auth/signup` - Recruiter sign up

#### **Protected Routes**

- `/dashboard` - Candidate dashboard (candidates only)
- `/recruiters/dashboard` - Recruiter dashboard (recruiters only)

### Environment Variables

Make sure to set up the following environment variables in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

### Getting Started

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with your Supabase credentials

3. **Set up Supabase:**

   - Create the database tables using the schema provided
   - Configure authentication in Supabase dashboard

4. **Run the development server:**

   ```bash
   pnpm dev
   ```

5. **Visit the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Key Features

#### **For Recruiters:**

- 📊 **Comprehensive dashboard** with hiring metrics
- 📝 **Job posting and management**
- 👥 **Candidate application tracking**
- 📈 **Performance analytics**
- 🎯 **AI-powered candidate screening**

#### **For Candidates:**

- 🔍 **Job search and discovery**
- 📄 **Application tracking**
- 💼 **Profile management**
- 🎯 **Personalized job recommendations**
- 📊 **Application status monitoring**

### Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Supabase** - Backend and authentication
- **Lucide React** - Icons

### Next Steps

The authentication system is now complete and ready for further development. You can:

1. **Extend the dashboards** with more functionality
2. **Add job posting features** for recruiters
3. **Implement resume upload** for candidates
4. **Add messaging system** between recruiters and candidates
5. **Integrate AI-powered features** for better matching

The foundation is solid and scalable for building a comprehensive recruitment platform!
