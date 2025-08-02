import { NextRequest, NextResponse } from 'next/server';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

// This implements AI job description generation using Gemini 2.5-flash-lite

interface GenerateDescriptionRequest {
    title: string;
    company_name: string;
    skills: string[];
    experience_level: 'entry' | 'mid' | 'senior';
    job_type: string;
    location: string;
    salary?: string;
    custom_requirements?: string;
    company_details?: string;
}

interface JobDescription {
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    experience: string;
}

// Zod schema for structured output validation
const JobDescriptionSchema = z.object({
    requirements: z.array(z.string()).describe("5-8 specific job requirements and qualifications"),
    responsibilities: z.array(z.string()).describe("5-8 key job responsibilities and daily tasks"),
    benefits: z.array(z.string()).describe("5-7 attractive benefits and perks"),
    experience: z.string().describe("2-3 sentences describing the experience level and growth opportunities")
});

export async function POST(request: NextRequest) {
    try {
        const body: GenerateDescriptionRequest = await request.json();

        // Validate required fields
        if (!body.title || !body.company_name || !body.skills || body.skills.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: title, company_name, and skills are required' },
                { status: 400 }
            );
        }

        // Check if API key is available
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not found, using fallback template');
            const mockDescription: JobDescription = generateFallbackDescription(body);
            return NextResponse.json(mockDescription);
        }

        try {
            // Try AI generation first
            const aiDescription = await generateWithAI(body);
            return NextResponse.json(aiDescription);
        } catch (aiError) {
            console.error('AI generation failed, using fallback:', aiError);
            // Fallback to template if AI fails
            const mockDescription: JobDescription = generateFallbackDescription(body);
            return NextResponse.json(mockDescription);
        }

    } catch (error) {
        console.error('Error generating job description:', error);
        return NextResponse.json(
            { error: 'Failed to generate job description' },
            { status: 500 }
        );
    }
}

// AI-powered generation using Gemini 2.5-flash-lite
async function generateWithAI(request: GenerateDescriptionRequest): Promise<JobDescription> {
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash-exp",
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.7,
        maxRetries: 2,
    });

    const experienceLevelMap = {
        entry: "Entry level (0-2 years experience)",
        mid: "Mid-level (2-5 years experience)",
        senior: "Senior level (5+ years experience)"
    };

    const prompt = `You are a professional HR specialist and job description writer. Create a comprehensive job description for the following position.

JOB DETAILS:
- Title: ${request.title}
- Company: ${request.company_name}
- Location: ${request.location}
- Job Type: ${request.job_type}
- Experience Level: ${experienceLevelMap[request.experience_level]}
- Required Skills: ${request.skills.join(', ')}
${request.salary ? `- Salary Range: ${request.salary}` : ''}
${request.custom_requirements ? `- Additional Requirements: ${request.custom_requirements}` : ''}
${request.company_details ? `- About the Company: ${request.company_details}` : ''}

INSTRUCTIONS:
Generate a professional job description with exactly these 4 sections:

1. **requirements**: An array of 5-8 specific, actionable job requirements including:
   - Educational background
   - Years of experience in relevant technologies
   - Technical skills (emphasize the provided skills)
   - Soft skills
   - Any certifications or additional qualifications
   
2. **responsibilities**: An array of 5-8 key daily responsibilities including:
   - Core job functions
   - Collaboration aspects
   - Technical tasks
   - Growth/learning responsibilities
   - Team interaction duties

3. **benefits**: An array of 5-7 attractive benefits and perks including:
   - Compensation benefits
   - Work-life balance perks
   - Professional development opportunities
   - Health/wellness benefits
   - Company-specific perks

4. **experience**: A detailed paragraph (2-4 sentences) describing:
   - Experience level expectations
   - Brief company introduction (mention ${request.company_name})
   - What makes this role attractive at this company
   - Career growth potential
   - Company culture benefits

4. **experience**: A 2-3 sentence description that:
   - Explains what this experience level means for this role
   - Describes growth opportunities
   - Mentions mentorship (giving or receiving based on level)

Make the content:
- Specific to the ${request.title} role
- Appropriate for ${experienceLevelMap[request.experience_level]}
- Professional yet engaging
- Industry-standard but unique to this position
- Focused on the provided skills: ${request.skills.slice(0, 5).join(', ')}

Return ONLY a valid JSON object matching this exact schema:
{
  "requirements": ["requirement1", "requirement2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...], 
  "benefits": ["benefit1", "benefit2", ...],
  "experience": "experience description text"
}`;

    try {
        const response = await model.invoke(prompt);
        let content = response.content as string;

        // Clean up the response to extract JSON
        content = content.trim();

        // Remove markdown code blocks if present
        if (content.startsWith('```json')) {
            content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (content.startsWith('```')) {
            content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Parse and validate the JSON response
        const parsedResponse = JSON.parse(content);
        const validatedResponse = JobDescriptionSchema.parse(parsedResponse);

        return validatedResponse;

    } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        throw new Error('AI returned invalid response format');
    }
}

// Fallback function to generate structured description when AI is unavailable
function generateFallbackDescription(request: GenerateDescriptionRequest): JobDescription {
    const { title, company_name, skills, experience_level, job_type, location, custom_requirements } = request;

    const experienceText = {
        entry: '0-2 years',
        mid: '2-5 years',
        senior: '5+ years'
    };

    // Generate dynamic requirements based on input
    const requirements = [
        `Bachelor's degree in Computer Science, Engineering, or related field`,
        `${experienceText[experience_level]} of professional experience in ${title.toLowerCase()} role`,
        `Strong proficiency in ${skills.slice(0, 3).join(', ')}`,
        `Experience with modern development practices and methodologies`,
        `Excellent problem-solving and analytical skills`,
        `Strong communication and teamwork abilities`,
    ];

    if (skills.length > 3) {
        requirements.push(`Knowledge of ${skills.slice(3, 6).join(', ')} is preferred`);
    }

    if (custom_requirements) {
        requirements.push(custom_requirements);
    }

    // Generate responsibilities
    const responsibilities = [
        `Design, develop, and maintain high-quality ${title.toLowerCase()} solutions`,
        `Collaborate with cross-functional teams including product managers, designers, and other developers`,
        `Write clean, efficient, and well-documented code following best practices`,
        `Participate in code reviews and provide constructive feedback to team members`,
        `Troubleshoot and debug applications to optimize performance`,
        `Stay updated with the latest industry trends and technologies`,
        `Contribute to architectural decisions and technical documentation`,
    ];

    if (experience_level === 'senior') {
        responsibilities.push('Mentor junior developers and lead technical initiatives');
        responsibilities.push('Drive technical excellence and establish coding standards');
    }

    // Generate benefits
    const benefits = [
        `Competitive salary and comprehensive benefits package`,
        `Flexible working arrangements and remote work options`,
        `Professional development opportunities and learning budget`,
        `Health and wellness programs`,
        `Collaborative and inclusive work environment`,
        `Opportunity to work with cutting-edge technologies`,
        `Performance-based bonuses and career advancement opportunities`,
    ];

    if (location.toLowerCase().includes('remote')) {
        benefits.push('Fully remote work environment with flexible hours');
    }

    // Generate experience description
    const experienceDescription = experience_level === 'entry'
        ? `Entry-level position perfect for recent graduates or professionals with 0-2 years of experience. We provide comprehensive training, mentorship, and growth opportunities to help you build a successful career in ${title.toLowerCase()}.`
        : experience_level === 'mid'
            ? `Mid-level position requiring ${experienceText[experience_level]} of hands-on experience. You'll work on challenging projects while having opportunities to mentor junior team members and grow your technical leadership skills.`
            : `Senior-level position for experienced professionals with ${experienceText[experience_level]} of expertise. You'll lead technical initiatives, mentor team members, and drive architectural decisions while working on complex, high-impact projects.`;

    return {
        requirements,
        responsibilities,
        benefits,
        experience: experienceDescription
    };
}

