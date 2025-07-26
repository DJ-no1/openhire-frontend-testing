// Demo data for testing AI Resume Analysis UI
import { type Job, type ReviewResponse } from './api';

export const DEMO_JOBS: Job[] = [
    {
        id: "job-001",
        title: "Senior Frontend Developer",
        description: "We are looking for an experienced Frontend Developer with expertise in React, TypeScript, and modern web technologies. The ideal candidate will have 5+ years of experience building scalable web applications.",
        recruiter_id: "recruiter-001",
        job_type: "full-time",
        salary: 120000,
        created_at: "2025-01-20T10:00:00Z"
    },
    {
        id: "job-002",
        title: "Full Stack Python Developer",
        description: "Join our team as a Full Stack Python Developer. Experience with Django, FastAPI, React, and PostgreSQL required. 3+ years of experience in software development.",
        recruiter_id: "recruiter-001",
        job_type: "full-time",
        salary: 110000,
        created_at: "2025-01-19T14:30:00Z"
    },
    {
        id: "job-003",
        title: "Data Scientist",
        description: "We're seeking a Data Scientist with strong background in machine learning, Python, and statistical analysis. Experience with TensorFlow, scikit-learn, and data visualization tools.",
        recruiter_id: "recruiter-002",
        job_type: "full-time",
        salary: 130000,
        created_at: "2025-01-18T09:15:00Z"
    },
    {
        id: "job-004",
        title: "DevOps Engineer",
        description: "Looking for a DevOps Engineer experienced with AWS, Docker, Kubernetes, and CI/CD pipelines. 4+ years of experience in cloud infrastructure and automation.",
        recruiter_id: "recruiter-002",
        job_type: "contract",
        created_at: "2025-01-17T16:45:00Z"
    }
];

export const DEMO_ANALYSIS: ReviewResponse = {
    jd: "We are looking for an experienced Frontend Developer with expertise in React, TypeScript, and modern web technologies. The ideal candidate will have 5+ years of experience building scalable web applications, strong understanding of state management (Redux, Zustand), testing frameworks (Jest, React Testing Library), and experience with modern build tools (Webpack, Vite). Knowledge of CSS-in-JS solutions, responsive design, and accessibility best practices is required.",
    resume: "John Smith\nSenior Frontend Developer\n\nEXPERIENCE:\nSenior Frontend Developer at TechCorp (2020-2025)\n- Built scalable React applications serving 1M+ users\n- Implemented TypeScript migration reducing bugs by 40%\n- Led team of 4 developers using Agile methodologies\n- Optimized performance improving load times by 60%\n\nFrontend Developer at StartupXYZ (2018-2020)\n- Developed responsive web applications with React and Redux\n- Implemented testing suite with Jest and React Testing Library\n- Collaborated with UX/UI designers on user-centered design\n\nSKILLS:\n- JavaScript, TypeScript, React, Redux, Next.js\n- HTML5, CSS3, SASS, Styled Components\n- Jest, React Testing Library, Cypress\n- Git, Webpack, Vite, AWS\n\nEDUCATION:\nB.S. Computer Science, University of Technology (2018)",
    analysis: {
        overall_score: 87.5,
        passed_hard_filters: true,
        confidence: 0.94,
        hard_filter_failures: [],
        risk_flags: [
            "Gap in continuous learning - no recent certifications mentioned",
            "Limited backend experience may affect full-stack collaboration"
        ],
        dimension_breakdown: {
            skill_match: {
                score: 92.0,
                weight: 0.30,
                evidence: [
                    "Strong React and TypeScript experience matches core requirements",
                    "Redux and state management expertise directly relevant",
                    "Modern tooling experience with Webpack and Vite",
                    "Testing experience with Jest and React Testing Library"
                ]
            },
            experience_fit: {
                score: 88.0,
                weight: 0.15,
                evidence: [
                    "7+ years total experience exceeds 5+ year requirement",
                    "Senior-level role demonstrates progression",
                    "Experience with scalable applications (1M+ users)",
                    "Team leadership experience valuable for senior role"
                ]
            },
            impact_outcomes: {
                score: 85.0,
                weight: 0.15,
                evidence: [
                    "Quantified performance improvements (60% load time reduction)",
                    "Measurable bug reduction (40% through TypeScript)",
                    "Scale metrics provided (1M+ users)",
                    "Team leadership responsibilities clearly stated"
                ]
            },
            role_alignment: {
                score: 90.0,
                weight: 0.10,
                evidence: [
                    "Current title matches target role exactly",
                    "Responsibilities align with job requirements",
                    "Experience level appropriate for senior position",
                    "Technical focus matches frontend specialization"
                ]
            },
            project_tech_depth: {
                score: 82.0,
                weight: 0.10,
                evidence: [
                    "Migration projects show technical depth",
                    "Performance optimization demonstrates advanced skills",
                    "Modern build tools experience",
                    "Testing implementation shows quality focus"
                ]
            },
            career_trajectory: {
                score: 89.0,
                weight: 0.07,
                evidence: [
                    "Clear progression from Developer to Senior Developer",
                    "Increasing responsibilities over time",
                    "Consistent growth in technical complexity",
                    "Leadership role development"
                ]
            },
            communication_clarity: {
                score: 78.0,
                weight: 0.05,
                evidence: [
                    "Well-structured resume format",
                    "Clear and concise bullet points",
                    "Quantified achievements included",
                    "Could benefit from more detailed project descriptions"
                ]
            },
            certs_education: {
                score: 75.0,
                weight: 0.05,
                evidence: [
                    "Relevant Computer Science degree",
                    "Education timeline aligns with career start",
                    "No additional certifications mentioned",
                    "Degree from recognized institution"
                ]
            },
            extras: {
                score: 80.0,
                weight: 0.03,
                evidence: [
                    "Leadership experience adds value",
                    "Agile methodology experience",
                    "UX/UI collaboration experience",
                    "AWS cloud experience beneficial"
                ]
            }
        }
    }
};

// Helper function to simulate API delay
export const simulateApiDelay = (ms: number = 2000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Demo mode flag (can be set via environment variable)
export const IS_DEMO_MODE = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
