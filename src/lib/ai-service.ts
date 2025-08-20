// AI Service for Job Description Generation
import { JobDescription } from './job-service';

export interface GenerateDescriptionRequest {
    title: string;
    company_name: string;
    skills: string[];
    experience_level: 'entry' | 'mid' | 'senior';
    job_type: string;
    location: string;
    salary?: string;
    custom_requirements?: string;
    company_details?: string; // New field for company information
    industry?: string;
    resume_threshold?: string;
}

export interface GenerateDescriptionResponse {
    success: boolean;
    data?: JobDescription;
    error?: string;
}

class AIService {
    private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    async generateJobDescription(request: GenerateDescriptionRequest): Promise<GenerateDescriptionResponse> {
        try {
            console.log('Generating job description with AI:', request);

            const response = await fetch(`${this.baseUrl}/api/generate-job-description`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.message || 'Failed to generate job description');
            }

            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error generating job description:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // Fallback method for when AI service is unavailable
    generateFallbackDescription(request: GenerateDescriptionRequest): JobDescription {
        const { title, company_name, skills, experience_level, job_type, location, custom_requirements, company_details, industry, resume_threshold } = request;

        // Create more dynamic templates based on job title and skills
        const isEngineeringRole = title.toLowerCase().includes('engineer') || title.toLowerCase().includes('developer');
        const isManagementRole = title.toLowerCase().includes('manager') || title.toLowerCase().includes('lead');
        const isDesignRole = title.toLowerCase().includes('designer') || title.toLowerCase().includes('design');

        // Base requirements with dynamic content
        const baseRequirements = [
            `Bachelor's degree in relevant field or equivalent experience`,
            `${this.getExperienceText(experience_level)} experience in ${title.toLowerCase()} or related role`,
            `Strong proficiency in ${skills.slice(0, 3).join(', ')}`,
        ];

        // Add role-specific requirements
        if (isEngineeringRole) {
            baseRequirements.push(`Experience with software development lifecycle and best practices`);
            baseRequirements.push(`Strong problem-solving and analytical skills`);
        } else if (isManagementRole) {
            baseRequirements.push(`Proven leadership and team management experience`);
            baseRequirements.push(`Excellent communication and project management skills`);
        } else if (isDesignRole) {
            baseRequirements.push(`Strong portfolio demonstrating design thinking and creativity`);
            baseRequirements.push(`Proficiency in design tools and user experience principles`);
        }

        // Add additional skills if available
        if (skills.length > 3) {
            baseRequirements.push(`Experience with ${skills.slice(3, 6).join(', ')} is a plus`);
        }

        // Add custom requirements if provided
        if (custom_requirements?.trim()) {
            baseRequirements.push(custom_requirements.trim());
        }

        // Dynamic responsibilities based on role
        const baseResponsibilities = [
            `Design, develop, and maintain high-quality ${title.toLowerCase()} solutions`,
            `Collaborate with cross-functional teams to deliver exceptional results`,
            `Participate in code/design reviews and maintain quality standards`,
            `Contribute to technical documentation and knowledge sharing`,
        ];

        if (isEngineeringRole) {
            baseResponsibilities.push(`Write clean, maintainable, and efficient code`);
            baseResponsibilities.push(`Debug and optimize application performance`);
        } else if (isManagementRole) {
            baseResponsibilities.push(`Lead and mentor team members`);
            baseResponsibilities.push(`Drive strategic planning and execution`);
        } else if (isDesignRole) {
            baseResponsibilities.push(`Create user-centered design solutions`);
            baseResponsibilities.push(`Conduct user research and usability testing`);
        }

        // Enhanced benefits
        const baseBenefits = [
            `Competitive salary and comprehensive benefits package`,
            `Professional development and learning opportunities`,
            `Flexible working arrangements and work-life balance`,
            `Health and wellness programs`,
            `Collaborative and innovative work environment`,
        ];

        // Add location-specific benefits
        if (location.toLowerCase().includes('remote')) {
            baseBenefits.push(`Remote work flexibility with modern collaboration tools`);
        }

        // Create personalized experience section
        let companyContext = `Join ${company_name} as a ${title} and be part of our dynamic team`;
        if (location && !location.toLowerCase().includes('remote')) {
            companyContext += ` in ${location}`;
        }
        companyContext += `. We are looking for talented individuals who are passionate about technology and innovation.`;

        // Add company details if provided
        if (company_details?.trim()) {
            companyContext += `\n\n${company_details.trim()}`;
        }

        return {
            requirements: baseRequirements,
            responsibilities: baseResponsibilities,
            benefits: baseBenefits,
            experience: `${companyContext}\n\n${this.getExperienceDescription(experience_level)}`,
            industry: industry || "IT",
            resume_threshold: resume_threshold || "none"
        };
    }

    private getExperienceText(level: string): string {
        switch (level) {
            case 'entry': return '0-2 years';
            case 'mid': return '2-5 years';
            case 'senior': return '5+ years';
            default: return '2-5 years';
        }
    }

    private getExperienceDescription(level: string): string {
        switch (level) {
            case 'entry':
                return 'Entry-level position suitable for recent graduates or those with 0-2 years of relevant experience. Training and mentorship provided.';
            case 'mid':
                return 'Mid-level position requiring 2-5 years of relevant experience. Opportunity to work on challenging projects and mentor junior team members.';
            case 'senior':
                return 'Senior-level position requiring 5+ years of experience. Leadership responsibilities and strategic decision-making involved.';
            default:
                return 'Mid-level position requiring 2-5 years of relevant experience.';
        }
    }
}

export const aiService = new AIService();
