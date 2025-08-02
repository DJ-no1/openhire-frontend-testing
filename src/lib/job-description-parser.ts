// Utility to extract structured data from job descriptions
export interface ExtractedJobData {
    benefits: string[];
    requirements: string[];
    responsibilities: string[];
    experience: string;
}

export function extractStructuredData(description: any): ExtractedJobData {
    // If already structured, return as is
    if (description && typeof description === 'object' && description.benefits) {
        return {
            benefits: Array.isArray(description.benefits) ? description.benefits : [],
            requirements: Array.isArray(description.requirements) ? description.requirements : [],
            responsibilities: Array.isArray(description.responsibilities) ? description.responsibilities : [],
            experience: description.experience || ''
        };
    }

    // If it's a string, try to parse it
    if (typeof description === 'string') {
        return parseTextDescription(description);
    }

    // Default empty structure
    return {
        benefits: [],
        requirements: [],
        responsibilities: [],
        experience: ''
    };
}

function parseTextDescription(text: string): ExtractedJobData {
    const result: ExtractedJobData = {
        benefits: [],
        requirements: [],
        responsibilities: [],
        experience: ''
    };

    // Common section headers and their variations
    const sectionPatterns = {
        benefits: [
            /(?:^|\n)(?:benefits?|perks?|what we offer|compensation & benefits?)[\s\S]*?(?=\n(?:requirements?|responsibilities?|qualifications?|experience|about|$))/gi,
            /(?:^|\n)(?:•|\-|\*)\s*(?:health|dental|vision|insurance|401k|pto|vacation|remote|flexible|bonus)/gi
        ],
        requirements: [
            /(?:^|\n)(?:requirements?|qualifications?|skills?|what you need|you have)[\s\S]*?(?=\n(?:responsibilities?|benefits?|experience|about|$))/gi,
            /(?:^|\n)(?:•|\-|\*)\s*(?:experience|knowledge|bachelor|master|degree|proficient|familiar)/gi
        ],
        responsibilities: [
            /(?:^|\n)(?:responsibilities?|duties?|what you'll do|you will|role)[\s\S]*?(?=\n(?:requirements?|benefits?|qualifications?|experience|about|$))/gi,
            /(?:^|\n)(?:•|\-|\*)\s*(?:develop|create|manage|lead|collaborate|work|design|implement)/gi
        ],
        experience: [
            /(?:^|\n)(?:experience|seniority|level)[\s\S]*?(?=\n(?:requirements?|responsibilities?|benefits?|about|$))/gi,
            /\b(?:\d+\+?\s*years?|entry.?level|junior|senior|mid.?level|lead|principal)\b/gi
        ]
    };

    // Extract each section
    Object.entries(sectionPatterns).forEach(([section, patterns]) => {
        const matches: string[] = [];

        patterns.forEach(pattern => {
            const found = text.match(pattern);
            if (found) {
                found.forEach(match => {
                    // Clean up the match
                    const cleaned = match
                        .replace(/^[\n\r\s•\-\*]+/, '') // Remove leading chars
                        .replace(/[\n\r\s]+$/, '') // Remove trailing chars
                        .trim();

                    if (cleaned && cleaned.length > 3) {
                        // Split by bullet points or newlines for list items
                        const items = cleaned.split(/(?:\n|^)(?:•|\-|\*)\s*/)
                            .map(item => item.trim())
                            .filter(item => item && item.length > 3);

                        matches.push(...items);
                    }
                });
            }
        });

        // Deduplicate and clean matches
        const uniqueMatches = [...new Set(matches)]
            .map(match => match.replace(/^(?:•|\-|\*|\d+\.)\s*/, '').trim())
            .filter(match => match.length > 5);

        if (section === 'experience') {
            result.experience = uniqueMatches.join(' ');
        } else {
            (result as any)[section] = uniqueMatches.slice(0, 10); // Limit to 10 items
        }
    });

    // Fallback: if no structured data found, try to extract bullet points
    if (result.benefits.length === 0 && result.requirements.length === 0 && result.responsibilities.length === 0) {
        const bulletPoints = text.match(/(?:^|\n)(?:•|\-|\*)\s*[^\n]+/g);
        if (bulletPoints) {
            const cleaned = bulletPoints
                .map(point => point.replace(/^[\n•\-\*\s]+/, '').trim())
                .filter(point => point.length > 5);

            // Distribute bullet points based on keywords
            cleaned.forEach(point => {
                const lower = point.toLowerCase();
                if (lower.includes('benefit') || lower.includes('offer') || lower.includes('perk') ||
                    lower.includes('insurance') || lower.includes('vacation') || lower.includes('remote')) {
                    result.benefits.push(point);
                } else if (lower.includes('experience') || lower.includes('skill') || lower.includes('knowledge') ||
                    lower.includes('degree') || lower.includes('bachelor') || lower.includes('master')) {
                    result.requirements.push(point);
                } else if (lower.includes('develop') || lower.includes('manage') || lower.includes('lead') ||
                    lower.includes('create') || lower.includes('collaborate') || lower.includes('work')) {
                    result.responsibilities.push(point);
                } else {
                    // Default to requirements if unclear
                    result.requirements.push(point);
                }
            });
        }
    }

    return result;
}

// Helper to convert structured data back to display format
export function formatStructuredData(data: ExtractedJobData): string {
    const sections = [];

    if (data.responsibilities.length > 0) {
        sections.push('**Responsibilities:**\n' + data.responsibilities.map(item => `• ${item}`).join('\n'));
    }

    if (data.requirements.length > 0) {
        sections.push('**Requirements:**\n' + data.requirements.map(item => `• ${item}`).join('\n'));
    }

    if (data.benefits.length > 0) {
        sections.push('**Benefits:**\n' + data.benefits.map(item => `• ${item}`).join('\n'));
    }

    if (data.experience) {
        sections.push('**Experience Level:**\n' + data.experience);
    }

    return sections.join('\n\n');
}

// Key-value pairs extractor for display
export function extractKeyValuePairs(description: any): Record<string, any> {
    const structured = extractStructuredData(description);

    return {
        'Benefits Count': structured.benefits.length,
        'Requirements Count': structured.requirements.length,
        'Responsibilities Count': structured.responsibilities.length,
        'Has Experience Level': structured.experience ? 'Yes' : 'No',
        'Total Structured Items': structured.benefits.length + structured.requirements.length + structured.responsibilities.length,
        'Benefits': structured.benefits,
        'Requirements': structured.requirements,
        'Responsibilities': structured.responsibilities,
        'Experience Level': structured.experience
    };
}
