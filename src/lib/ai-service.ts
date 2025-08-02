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
        const { title, company_name, skills, experience_level, job_type, location } = request;

        // Create basic templates based on common patterns
        const baseRequirements = [
            `Bachelor's degree in relevant field or equivalent experience`,
            `${this.getExperienceText(experience_level)} experience in ${title.toLowerCase()} role`,
            `Strong knowledge of ${skills.slice(0, 3).join(', ')}`,
        ];

        const baseResponsibilities = [
            `Develop and maintain high-quality ${title.toLowerCase()} solutions`,
            `Collaborate with cross-functional teams to deliver projects`,
            `Participate in code reviews and maintain coding standards`,
            `Contribute to technical documentation and knowledge sharing`,
        ];

        const baseBenefits = [
            `Competitive salary and benefits package`,
            `Professional development opportunities`,
            `Flexible working arrangements`,
            `Health and wellness programs`,
        ];

        // Add company-specific context to the experience section
        const companyContext = `Join ${company_name} as a ${title} and be part of our dynamic team in ${location}. We are looking for talented individuals who are passionate about technology and innovation.`;

        if (skills.length > 3) {
            baseRequirements.push(`Experience with ${skills.slice(3).join(', ')} is a plus`);
        }

        return {
            requirements: baseRequirements,
            responsibilities: baseResponsibilities,
            benefits: baseBenefits,
            experience: `${companyContext}\n\n${this.getExperienceDescription(experience_level)}`
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
