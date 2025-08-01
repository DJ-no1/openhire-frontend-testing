// Demo data for testing AI Resume Analysis UI
import { type Job, type ReviewResponse } from './api';

// Extended demo jobs with complete information
export const DEMO_JOBS: any[] = [
    {
        id: "a074e7c3-2215-4901-8cc2-445f9f41b210",
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        description: "We are looking for an experienced Frontend Developer with expertise in React, TypeScript, and modern web technologies. The ideal candidate will have 5+ years of experience building scalable web applications, strong understanding of state management (Redux, Zustand), testing frameworks (Jest, React Testing Library), and experience with modern build tools (Webpack, Vite). Knowledge of CSS-in-JS solutions, responsive design, and accessibility best practices is required.\n\nResponsibilities:\n• Develop and maintain high-quality React applications\n• Collaborate with design and backend teams\n• Write comprehensive tests for all components\n• Optimize application performance\n• Mentor junior developers\n• Participate in code reviews and technical discussions",
        salary: "120000",
        skills: "React, TypeScript, JavaScript, Redux, Jest, Webpack, CSS3, HTML5",
        job_type: "Full-time",
        end_date: "2025-03-01T00:00:00Z",
        interview_duration: "45 minutes",
        status: "active",
        created_at: "2025-01-20T10:00:00Z",
        updated_at: "2025-01-20T10:00:00Z",
        recruiter_id: "recruiter-001",
        applications_count: 12,
        job_link: "/j/kLkO5h5u",
        requirements: "• 5+ years of React development experience\n• Strong TypeScript skills\n• Experience with modern state management\n• Knowledge of testing frameworks\n• Understanding of web performance optimization\n• Experience with responsive design\n• Familiarity with accessibility standards",
        benefits: "• Competitive salary with equity options\n• Health, dental, and vision insurance\n• 401(k) with company matching\n• Flexible work arrangements\n• Professional development budget\n• Unlimited PTO\n• Modern tech stack and equipment",
        experience_level: "Senior"
    },
    {
        id: "b184f8d4-3326-5012-9dd3-556g0g52c321",
        title: "Full Stack Python Developer",
        company: "DataFlow Systems",
        location: "Austin, TX",
        description: "Join our team as a Full Stack Python Developer. Experience with Django, FastAPI, React, and PostgreSQL required. 3+ years of experience in software development. You'll be working on cutting-edge data processing systems that handle millions of records daily.\n\nKey Responsibilities:\n• Design and implement scalable backend APIs using Django/FastAPI\n• Build responsive frontend interfaces with React\n• Optimize database queries and performance\n• Implement automated testing and CI/CD pipelines\n• Collaborate with data scientists and DevOps teams",
        salary: "110000",
        skills: "Python, Django, FastAPI, React, PostgreSQL, Docker, AWS",
        job_type: "Full-time",
        end_date: "2025-02-28T00:00:00Z",
        interview_duration: "60 minutes",
        status: "active",
        created_at: "2025-01-19T14:30:00Z",
        updated_at: "2025-01-19T14:30:00Z",
        recruiter_id: "recruiter-001",
        applications_count: 8,
        job_link: "/j/XrHktm64",
        requirements: "• 3+ years of Python development experience\n• Strong knowledge of Django or FastAPI\n• Frontend development skills with React\n• Database design and optimization experience\n• Understanding of RESTful API design\n• Experience with version control (Git)\n• Knowledge of testing frameworks",
        benefits: "• Competitive salary and performance bonuses\n• Comprehensive health benefits\n• Remote-first culture\n• Learning and development stipend\n• Latest MacBook Pro or equivalent\n• Flexible working hours\n• Team retreats and social events",
        experience_level: "Mid-level"
    },
    {
        id: "c295g9e5-4437-6123-0ee4-667h1h63d432",
        title: "Data Scientist",
        company: "AI Innovations Lab",
        location: "Remote",
        description: "We're seeking a Data Scientist with strong background in machine learning, Python, and statistical analysis. Experience with TensorFlow, scikit-learn, and data visualization tools. You'll work on exciting projects involving natural language processing, computer vision, and predictive analytics.\n\nWhat You'll Do:\n• Develop machine learning models for various business problems\n• Analyze large datasets to extract meaningful insights\n• Create data visualizations and reports for stakeholders\n• Collaborate with engineering teams to deploy models\n• Research and implement cutting-edge ML techniques",
        salary: "130000",
        skills: "Python, TensorFlow, scikit-learn, Pandas, NumPy, SQL, Tableau, R",
        job_type: "Full-time",
        end_date: "2025-03-15T00:00:00Z",
        interview_duration: "90 minutes",
        status: "active",
        created_at: "2025-01-18T09:15:00Z",
        updated_at: "2025-01-18T09:15:00Z",
        recruiter_id: "recruiter-002",
        applications_count: 15,
        job_link: "/j/RR-6Ko_v",
        requirements: "• PhD or Master's in Data Science, Statistics, or related field\n• 4+ years of hands-on ML experience\n• Proficiency in Python and R\n• Experience with deep learning frameworks\n• Strong statistical analysis skills\n• Experience with cloud platforms (AWS/GCP/Azure)\n• Excellent communication skills",
        benefits: "• Top-tier compensation package\n• Equity participation\n• Full remote work flexibility\n• Conference and training budget\n• Home office setup allowance\n• Health and wellness programs\n• Collaborative and innovative team environment",
        experience_level: "Senior"
    },
    {
        id: "d3a6h0f6-5548-7234-1ff5-778i2i74e543",
        title: "DevOps Engineer",
        company: "CloudScale Solutions",
        location: "Seattle, WA",
        description: "Looking for a DevOps Engineer experienced with AWS, Docker, Kubernetes, and CI/CD pipelines. 4+ years of experience in cloud infrastructure and automation. You'll be responsible for maintaining and scaling our cloud infrastructure that serves millions of users globally.\n\nCore Responsibilities:\n• Design and maintain scalable cloud infrastructure\n• Implement and optimize CI/CD pipelines\n• Monitor system performance and reliability\n• Automate deployment and scaling processes\n• Ensure security best practices across all systems",
        salary: "125000",
        skills: "AWS, Docker, Kubernetes, Terraform, Jenkins, Python, Bash, Monitoring",
        job_type: "Contract",
        end_date: "2025-02-20T00:00:00Z",
        interview_duration: "75 minutes",
        status: "active",
        created_at: "2025-01-17T16:45:00Z",
        updated_at: "2025-01-17T16:45:00Z",
        recruiter_id: "recruiter-002",
        applications_count: 6,
        job_link: "/j/ABC123XY",
        requirements: "• 4+ years of DevOps/SRE experience\n• Strong AWS/Azure/GCP knowledge\n• Experience with containerization (Docker, Kubernetes)\n• Infrastructure as Code experience (Terraform, CloudFormation)\n• Scripting skills (Python, Bash, PowerShell)\n• Monitoring and logging tools experience\n• Understanding of security best practices",
        benefits: "• Competitive hourly rate with potential for conversion\n• Flexible contract terms\n• Access to cutting-edge technology\n• Collaborative remote-friendly team\n• Professional development opportunities\n• Performance-based bonuses\n• Comprehensive contractor support",
        experience_level: "Senior"
    },
    {
        id: "e4b7i1g7-6659-8345-2gg6-889j3j85f654",
        title: "UI/UX Designer",
        company: "Design Studio Pro",
        location: "New York, NY",
        description: "We're looking for a creative UI/UX Designer to join our award-winning design team. You'll work on diverse projects ranging from mobile apps to web platforms, creating intuitive and beautiful user experiences.\n\nWhat You'll Be Doing:\n• Design user interfaces for web and mobile applications\n• Conduct user research and usability testing\n• Create wireframes, prototypes, and design systems\n• Collaborate with developers and product managers\n• Present design concepts to clients and stakeholders",
        salary: "95000",
        skills: "Figma, Sketch, Adobe Creative Suite, Prototyping, User Research, Design Systems",
        job_type: "Full-time",
        end_date: "2025-03-10T00:00:00Z",
        interview_duration: "60 minutes",
        status: "active",
        created_at: "2025-01-16T11:20:00Z",
        updated_at: "2025-01-16T11:20:00Z",
        recruiter_id: "recruiter-003",
        applications_count: 22,
        job_link: "/j/DESIGN99",
        requirements: "• 3+ years of UI/UX design experience\n• Proficiency in Figma, Sketch, or similar tools\n• Strong portfolio demonstrating design process\n• Experience with user research methodologies\n• Understanding of responsive design principles\n• Knowledge of accessibility standards\n• Excellent presentation and communication skills",
        benefits: "• Creative and inspiring work environment\n• Health and dental insurance\n• Professional development budget\n• Flexible work arrangements\n• State-of-the-art design tools and equipment\n• Regular team building activities\n• Opportunity to work on award-winning projects",
        experience_level: "Mid-level"
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
