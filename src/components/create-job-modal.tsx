'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JobSkillSelector } from '@/components/job-skill-selector';
import { AIDescriptionGenerator } from '@/components/ai-description-generator';
import { jobService, JobDescription, validateJobData } from '@/lib/job-service';
import { toast } from 'sonner';
import {
    Briefcase,
    Building,
    MapPin,
    DollarSign,
    Calendar,
    Clock,
    Save,
    Send,
    Loader2,
    X
} from 'lucide-react';

interface CreateJobModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJobCreated?: () => void;
}

interface FormData {
    title: string;
    company_name: string;
    location: string;
    salary: string;
    job_type: string;
    end_date: string;
    interview_duration: string;
    custom_requirements: string;
    company_details: string;
}

const JOB_TYPES = [
    'Full-time',
    'Part-time',
    'Contract',
    'Temporary',
    'Internship',
    'Freelance'
];

const EXPERIENCE_LEVELS = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (2-5 years)' },
    { value: 'senior', label: 'Senior Level (5+ years)' }
];

export function CreateJobModal({ open, onOpenChange, onJobCreated }: CreateJobModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState<string[]>([]);
    const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior'>('mid');
    const [description, setDescription] = useState<JobDescription | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        company_name: '',
        location: '',
        salary: '',
        job_type: 'Full-time',
        end_date: '',
        interview_duration: '45',
        custom_requirements: '',
        company_details: ''
    });

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleClose = () => {
        // Reset form when closing
        setFormData({
            title: '',
            company_name: '',
            location: '',
            salary: '',
            job_type: 'Full-time',
            end_date: '',
            interview_duration: '45',
            custom_requirements: '',
            company_details: ''
        });
        setSkills([]);
        setExperienceLevel('mid');
        setDescription(null);
        onOpenChange(false);
    };

    const validateForm = (): string[] => {
        const errors: string[] = [];

        if (!formData.title.trim()) errors.push('Job title is required');
        if (!formData.company_name.trim()) errors.push('Company name is required');
        if (!formData.location.trim()) errors.push('Location is required');
        if (!formData.end_date) errors.push('Application deadline is required');
        if (!formData.interview_duration || parseInt(formData.interview_duration) <= 0) {
            errors.push('Interview duration must be greater than 0');
        }
        if (skills.length === 0) errors.push('At least one skill is required');
        if (!description) errors.push('Job description is required - please generate one using AI');

        // Validate end date is in the future
        if (formData.end_date) {
            const endDate = new Date(formData.end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (endDate <= today) {
                errors.push('Application deadline must be in the future');
            }
        }

        return errors;
    };

    const handleSubmit = async (isDraft: boolean = false) => {
        if (!user?.id) {
            toast.error('You must be logged in to create a job');
            return;
        }

        const errors = validateForm();
        if (errors.length > 0) {
            toast.error(`Please fix the following errors:\n${errors.join('\n')}`);
            return;
        }

        if (!description) {
            toast.error('Please generate a job description first');
            return;
        }

        setLoading(true);
        try {
            const jobData = {
                recruiter_id: user.id,
                title: formData.title,
                company_name: formData.company_name,
                location: formData.location,
                description: description,
                salary: formData.salary || undefined,
                skills: skills.join(', '),
                job_type: formData.job_type,
                end_date: new Date(formData.end_date).toISOString(),
                interview_duration: parseInt(formData.interview_duration),
                status: isDraft ? 'inactive' as const : 'active' as const
            };

            console.log('Creating job with data:', jobData);

            const createdJob = await jobService.createJob(jobData);

            toast.success(`Job ${isDraft ? 'saved as draft' : 'created'} successfully!`);

            // Call callback and close modal
            onJobCreated?.();
            handleClose();
        } catch (error) {
            console.error('Error creating job:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = () => handleSubmit(true);
    const handlePublish = () => handleSubmit(false);

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[70vw] max-w-none h-[85vh] overflow-hidden sm:max-w-none flex flex-col" showCloseButton={false}>
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Create New Job
                        </DialogTitle>
                        <Button variant="ghost" size="sm" onClick={handleClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex flex-col flex-1 min-h-0">
                    <ScrollArea className="flex-1 overflow-y-auto pr-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 min-h-0">
                            {/* Left Column - Form */}
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Briefcase className="h-4 w-4" />
                                            Basic Information
                                        </CardTitle>
                                        <CardDescription>
                                            Enter the basic details about the job position
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Job Title *</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g. Senior Frontend Developer"
                                                value={formData.title}
                                                onChange={(e) => handleInputChange('title', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="company_name">Company Name *</Label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="company_name"
                                                    placeholder="e.g. Tech Innovations Inc."
                                                    value={formData.company_name}
                                                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="company_details">About the Company (Optional)</Label>
                                            <Textarea
                                                id="company_details"
                                                placeholder="Brief description about your company, culture, mission, or what makes it unique..."
                                                value={formData.company_details}
                                                onChange={(e) => handleInputChange('company_details', e.target.value)}
                                                className="min-h-[80px] resize-none"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                This information will be included in AI-generated job descriptions to make them more personalized.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="location">Location *</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="location"
                                                        placeholder="e.g. Remote, Mumbai"
                                                        value={formData.location}
                                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="job_type">Job Type</Label>
                                                <Select
                                                    value={formData.job_type}
                                                    onValueChange={(value) => handleInputChange('job_type', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {JOB_TYPES.map(type => (
                                                            <SelectItem key={type} value={type}>
                                                                {type}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="salary">Salary (Optional)</Label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="salary"
                                                        placeholder="e.g. ₹8–15 LPA"
                                                        value={formData.salary}
                                                        onChange={(e) => handleInputChange('salary', e.target.value)}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="interview_duration">Interview Duration (minutes) *</Label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="interview_duration"
                                                        type="number"
                                                        min="15"
                                                        max="180"
                                                        placeholder="45"
                                                        value={formData.interview_duration}
                                                        onChange={(e) => handleInputChange('interview_duration', e.target.value)}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">Application Deadline *</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="end_date"
                                                    type="date"
                                                    min={getMinDate()}
                                                    value={formData.end_date}
                                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Skills and Experience */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Skills & Experience</CardTitle>
                                        <CardDescription>
                                            Select required skills and experience level for this position
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Required Skills *</Label>
                                            <JobSkillSelector
                                                selectedSkills={skills}
                                                onSkillsChange={setSkills}
                                                placeholder="Select required skills..."
                                                maxSkills={15}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Experience Level</Label>
                                            <Select
                                                value={experienceLevel}
                                                onValueChange={(value: 'entry' | 'mid' | 'senior') => setExperienceLevel(value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EXPERIENCE_LEVELS.map(level => (
                                                        <SelectItem key={level.value} value={level.value}>
                                                            {level.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="custom_requirements">Additional Requirements (Optional)</Label>
                                            <Textarea
                                                id="custom_requirements"
                                                placeholder="Any specific requirements not covered by skills..."
                                                value={formData.custom_requirements}
                                                onChange={(e) => handleInputChange('custom_requirements', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - AI Description Generator */}
                            <div className="space-y-6">
                                <AIDescriptionGenerator
                                    formData={formData}
                                    skills={skills}
                                    experienceLevel={experienceLevel}
                                    description={description}
                                    onDescriptionChange={setDescription}
                                    customRequirements={formData.custom_requirements}
                                    companyDetails={formData.company_details}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Fixed Action Buttons */}
                    <div className="border-t bg-background/95 backdrop-blur-sm flex-shrink-0">
                        <div className="flex flex-col sm:flex-row gap-3 justify-end p-4">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 sm:flex-none"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleSaveDraft}
                                disabled={loading}
                                className="flex-1 sm:flex-none"
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="mr-2 h-4 w-4" />
                                )}
                                Save as Draft
                            </Button>
                            <Button
                                onClick={handlePublish}
                                disabled={loading}
                                className="flex-1 sm:flex-none"
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Briefcase className="mr-2 h-4 w-4" />
                                )}
                                Create Job
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
