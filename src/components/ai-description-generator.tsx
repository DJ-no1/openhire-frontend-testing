import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, RefreshCw, Edit3 } from 'lucide-react';
import { aiService, GenerateDescriptionRequest } from '@/lib/ai-service';
import { JobDescription } from '@/lib/job-service';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AIDescriptionGeneratorProps {
    formData: {
        title: string;
        company_name: string;
        location: string;
        salary?: string;
        job_type: string;
    };
    skills: string[];
    experienceLevel: 'entry' | 'mid' | 'senior';
    description: JobDescription | null;
    onDescriptionChange: (description: JobDescription) => void;
    customRequirements?: string;
    companyDetails?: string;
}

export const AIDescriptionGenerator: React.FC<AIDescriptionGeneratorProps> = ({
    formData,
    skills,
    experienceLevel,
    description,
    onDescriptionChange,
    customRequirements = '',
    companyDetails = ''
}) => {
    const [generating, setGenerating] = useState(false);
    const [editMode, setEditMode] = useState<string | null>(null);
    const [tempEdit, setTempEdit] = useState('');

    const canGenerate = formData.title && formData.company_name && skills.length > 0;

    const handleGenerate = async () => {
        if (!canGenerate) {
            toast.error('Please fill in the job title, company name, and at least one skill');
            return;
        }

        setGenerating(true);
        try {
            const request: GenerateDescriptionRequest = {
                title: formData.title,
                company_name: formData.company_name,
                skills: skills,
                experience_level: experienceLevel,
                job_type: formData.job_type,
                location: formData.location,
                salary: formData.salary,
                custom_requirements: customRequirements,
                company_details: companyDetails
            };

            // Generate description using frontend-only template system
            const generatedDescription = aiService.generateFallbackDescription(request);
            onDescriptionChange(generatedDescription);
            toast.success('Job description generated successfully!');
        } catch (error) {
            console.error('Error generating description:', error);
            toast.error('Failed to generate job description. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerateSection = async (section: keyof JobDescription) => {
        // For now, regenerate the entire description using frontend-only system
        // In a full implementation, you could have section-specific generation
        await handleGenerate();
    };

    const startEdit = (section: keyof JobDescription, currentValue: string[] | string) => {
        setEditMode(section);
        if (Array.isArray(currentValue)) {
            setTempEdit(currentValue.join('\n'));
        } else {
            setTempEdit(currentValue);
        }
    };

    const saveEdit = (section: keyof JobDescription) => {
        if (!description) return;

        const updatedDescription = { ...description };

        if (section === 'experience') {
            updatedDescription[section] = tempEdit;
        } else {
            // For array fields (requirements, responsibilities, benefits)
            updatedDescription[section as keyof Pick<JobDescription, 'requirements' | 'responsibilities' | 'benefits'>] =
                tempEdit.split('\n').filter(line => line.trim());
        }

        onDescriptionChange(updatedDescription);
        setEditMode(null);
        setTempEdit('');
    };

    const cancelEdit = () => {
        setEditMode(null);
        setTempEdit('');
    };

    const renderSection = (
        title: string,
        section: keyof JobDescription,
        content: string[] | string,
        icon: React.ReactNode
    ) => {
        const isEditing = editMode === section;
        const isArray = Array.isArray(content);

        return (
            <Card className="mb-4">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {icon}
                            {title}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(section, content)}
                                disabled={generating}
                            >
                                <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRegenerateSection(section)}
                                disabled={generating}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={tempEdit}
                                onChange={(e) => setTempEdit(e.target.value)}
                                placeholder={isArray ? "Enter each item on a new line" : "Enter description"}
                                rows={isArray ? 6 : 3}
                                className="min-h-[120px]"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => saveEdit(section)}>
                                    Save
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none">
                            {isArray ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {(content as string[]).map((item, index) => (
                                        <li key={index} className="text-sm">
                                            <ReactMarkdown >{item}</ReactMarkdown>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <ReactMarkdown >{content as string}</ReactMarkdown>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5" />
                        Smart Job Description Generator
                    </CardTitle>
                    <CardDescription>
                        Generate a professional job description based on your job details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Generation Info */}
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline">Title: {formData.title || 'Not set'}</Badge>
                            <Badge variant="outline">Company: {formData.company_name || 'Not set'}</Badge>
                            <Badge variant="outline">Skills: {skills.length}</Badge>
                            <Badge variant="outline">Level: {experienceLevel}</Badge>
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={!canGenerate || generating}
                            className="w-full"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    {description ? 'Regenerate Description' : 'Generate Description'}
                                </>
                            )}
                        </Button>

                        {!canGenerate && (
                            <p className="text-sm text-muted-foreground text-center">
                                Please fill in the job title, company name, and select at least one skill to generate a description
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Generated Description Sections */}
            {description && (
                <div className="space-y-4">
                    {renderSection(
                        'Job Requirements',
                        'requirements',
                        description.requirements,
                        <Badge className="h-4 w-4">R</Badge>
                    )}

                    {renderSection(
                        'Responsibilities',
                        'responsibilities',
                        description.responsibilities,
                        <Badge className="h-4 w-4">T</Badge>
                    )}

                    {renderSection(
                        'Benefits & Perks',
                        'benefits',
                        description.benefits,
                        <Badge className="h-4 w-4">B</Badge>
                    )}

                    {renderSection(
                        'Experience Level',
                        'experience',
                        description.experience,
                        <Badge className="h-4 w-4">E</Badge>
                    )}
                </div>
            )}
        </div>
    );
};
