'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { jobService, Job as JobType, JobDescription, validateJobData } from '@/lib/job-service';
import { JobSkillSelector } from '@/components/job-skill-selector';
import { AIDescriptionGenerator } from '@/components/ai-description-generator';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Briefcase,
    MapPin,
    DollarSign,
    Clock,
    Calendar,
    Users,
    Building,
    Edit,
    FileText,
    CheckCircle,
    XCircle,
    Eye,
    Share2,
    AlertCircle,
    Loader2,
    Save,
    X as XIcon
} from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company_name: string;
    location: string;
    salary?: string;
    skills: string[] | string;
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
    end_date: string;
    applications_count: number;
    interview_duration: string | number;
    description: string | JobDescription;
    job_type?: string;
    experience_level?: string;
    recruiter_id?: string;
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

const INTERVIEW_DURATIONS = [
    { value: '5', label: '5 minutes' },
    { value: '10', label: '10 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '20', label: '20 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' }
];

const navigationItems = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/recruiters/dashboard',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        id: 'jobs',
        label: 'Jobs',
        href: '/recruiters/dashboard',
        icon: <Briefcase className="h-4 w-4" />
    },
];

export default function JobDetailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [rawJobDescription, setRawJobDescription] = useState<any>(null); // Store the original description

    // Form state for editing
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
        custom_requirements: ''
    });

    const convertApiJobToLocal = (apiJob: JobType): Job => {
        console.log('Converting API job for details:', apiJob);

        const extractStringFromDescription = (desc: any): string => {
            if (typeof desc === 'string') return desc;
            if (typeof desc === 'object' && desc !== null) {
                const parts = [];
                if (desc.responsibilities?.length) {
                    parts.push(`**Responsibilities:**\n${desc.responsibilities.join('\n• ')}`);
                }
                if (desc.requirements?.length) {
                    parts.push(`**Requirements:**\n${desc.requirements.join('\n• ')}`);
                }
                if (desc.benefits?.length) {
                    parts.push(`**Benefits:**\n${desc.benefits.join('\n• ')}`);
                }
                if (desc.experience) {
                    parts.push(`**Experience:**\n${desc.experience}`);
                }
                return parts.join('\n\n') || 'No description available';
            }
            return 'No description available';
        };

        return {
            ...apiJob,
            salary: apiJob.salary || 'Not specified',
            skills: apiJob.skills ? (typeof apiJob.skills === 'string' ? apiJob.skills.split(', ') : apiJob.skills) : [],
            applications_count: (apiJob as any).applications_count || 0,
            job_type: apiJob.job_type || 'Full-time',
            experience_level: 'Not specified',
            company_name: (apiJob as any).company || (apiJob as any).company_name || 'Company Not Specified',
            location: (apiJob as any).location || 'Location Not Specified',
            interview_duration: typeof apiJob.interview_duration === 'number' ? `${apiJob.interview_duration} min` : (apiJob.interview_duration || 'Not specified'),
            status: (apiJob as any).status || 'active' as const,
            description: extractStringFromDescription(apiJob.description)
        };
    };

    // Function to convert raw description to JobDescription format for editing
    const convertRawToJobDescription = (rawDesc: any): JobDescription => {
        console.log('Converting raw description:', rawDesc, typeof rawDesc);

        if (typeof rawDesc === 'object' && rawDesc !== null && rawDesc.requirements) {
            // Already in JobDescription format
            console.log('Already in JobDescription format');
            return rawDesc as JobDescription;
        }

        if (typeof rawDesc === 'string') {
            console.log('Parsing string description');
            // Try to parse the string description
            const sections = rawDesc.split('\n\n');
            let requirements: string[] = [];
            let responsibilities: string[] = [];
            let benefits: string[] = [];
            let experience = 'Mid Level (2-5 years)';

            sections.forEach(section => {
                if (section.includes('**Requirements:**') || section.includes('**Job Requirements:**')) {
                    const lines = section.split('\n').slice(1); // Skip the header
                    requirements = lines
                        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
                        .map(line => line.replace(/^[•\-]\s*/, '').trim())
                        .filter(Boolean);
                } else if (section.includes('**Responsibilities:**')) {
                    const lines = section.split('\n').slice(1);
                    responsibilities = lines
                        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
                        .map(line => line.replace(/^[•\-]\s*/, '').trim())
                        .filter(Boolean);
                } else if (section.includes('**Benefits:**')) {
                    const lines = section.split('\n').slice(1);
                    benefits = lines
                        .filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
                        .map(line => line.replace(/^[•\-]\s*/, '').trim())
                        .filter(Boolean);
                } else if (section.includes('**Experience:**')) {
                    const lines = section.split('\n').slice(1);
                    if (lines.length > 0) {
                        experience = lines[0].trim();
                    }
                }
            });

            // If we didn't find proper sections, create default ones
            if (requirements.length === 0) {
                requirements = [
                    'Bachelor\'s degree in relevant field or equivalent experience',
                    '0-2 years experience in related role',
                    'Strong technical skills'
                ];
            }
            if (responsibilities.length === 0) {
                responsibilities = [
                    'Develop and maintain software solutions',
                    'Collaborate with cross-functional teams',
                    'Participate in code reviews'
                ];
            }
            if (benefits.length === 0) {
                benefits = [
                    'Competitive salary package',
                    'Health and wellness benefits',
                    'Professional development opportunities'
                ];
            }

            return {
                requirements,
                responsibilities,
                benefits,
                experience,
                industry: 'Technology',
                resume_threshold: 'Medium'
            };
        }

        // Fallback: create a clean structure for editing
        console.log('Using fallback structure');
        return {
            requirements: [
                'Bachelor\'s degree in relevant field or equivalent experience',
                '0-2 years experience in related role',
                'Strong technical skills'
            ],
            responsibilities: [
                'Develop and maintain software solutions',
                'Collaborate with cross-functional teams',
                'Participate in code reviews'
            ],
            benefits: [
                'Competitive salary package',
                'Health and wellness benefits',
                'Professional development opportunities'
            ],
            experience: experienceLevel === 'entry' ? 'Entry Level (0-2 years)' :
                experienceLevel === 'mid' ? 'Mid Level (2-5 years)' :
                    'Senior Level (5+ years)',
            industry: 'Technology',
            resume_threshold: 'Medium'
        };
    };

    const fetchJobDetails = async () => {
        setLoading(true);
        try {
            const jobData = await jobService.getJobById(jobId);

            // Verify the recruiter owns this job
            if (jobData.recruiter_id !== user?.id) {
                toast.error("You don't have permission to view this job.");
                router.push('/recruiters/dashboard');
                return;
            }

            // Store the raw description for editing
            console.log('Raw description from API:', jobData.description);
            setRawJobDescription(jobData.description);

            const convertedJob = convertApiJobToLocal(jobData);
            setJob(convertedJob);

            // Initialize form data with job data
            const jobSkills = typeof jobData.skills === 'string'
                ? jobData.skills.split(', ').filter(Boolean)
                : Array.isArray(jobData.skills) ? jobData.skills : [];

            setSkills(jobSkills);
            setFormData({
                title: jobData.title,
                company_name: jobData.company_name || '',
                location: jobData.location || '',
                salary: jobData.salary || '',
                job_type: jobData.job_type || 'Full-time',
                end_date: jobData.end_date ? new Date(jobData.end_date).toISOString().split('T')[0] : '',
                interview_duration: typeof jobData.interview_duration === 'number'
                    ? jobData.interview_duration.toString()
                    : (jobData.interview_duration as string)?.replace(/\D/g, '') || '45',
                custom_requirements: ''
            });

            // Set description for editing - use the raw description from API
            const editingDescription = convertRawToJobDescription(jobData.description);
            console.log('Converted description for editing:', editingDescription);
            setDescription(editingDescription);

        } catch (error) {
            console.error('Error fetching job details:', error);
            toast.error('Failed to load job details');
            router.push('/recruiters/dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (jobId && user?.id) {
            fetchJobDetails();
        }
    }, [jobId, user?.id]);

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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

    const handleUpdateJob = async () => {
        if (!user?.id || !job?.id) {
            toast.error('Authentication required');
            return;
        }

        const errors = validateForm();
        if (errors.length > 0) {
            toast.error(`Please fix the following errors:\n${errors.join('\n')}`);
            return;
        }

        setFormLoading(true);
        try {
            const jobData = {
                id: job.id,
                recruiter_id: user.id,
                title: formData.title,
                company_name: formData.company_name,
                location: formData.location,
                description: description || {
                    requirements: ['As specified in the job description'],
                    responsibilities: ['Job responsibilities will be discussed during interview'],
                    benefits: ['Competitive benefits package'],
                    experience: experienceLevel === 'entry' ? 'Entry Level (0-2 years)' :
                        experienceLevel === 'mid' ? 'Mid Level (2-5 years)' :
                            'Senior Level (5+ years)',
                    industry: 'Technology',
                    resume_threshold: 'Medium'
                },
                salary: formData.salary || undefined,
                skills: skills.join(', '),
                job_type: formData.job_type,
                end_date: new Date(formData.end_date).toISOString(),
                interview_duration: parseInt(formData.interview_duration),
                status: job.status as 'active' | 'inactive'
            };

            console.log('Updating job with data:', jobData);

            const updatedJob = await jobService.updateJob(jobData);
            const convertedUpdatedJob = convertApiJobToLocal(updatedJob);
            setJob(convertedUpdatedJob);

            toast.success('Job updated successfully!');
            setIsEditing(false);
            await fetchJobDetails(); // Refresh the data
        } catch (error) {
            console.error('Error updating job:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to update job');
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleCancelEdit = () => {
        // Reset form data to original job data
        if (job) {
            setFormData({
                title: job.title,
                company_name: job.company_name || '',
                location: job.location || '',
                salary: job.salary === 'Not specified' ? '' : job.salary || '',
                job_type: job.job_type || 'Full-time',
                end_date: job.end_date ? new Date(job.end_date).toISOString().split('T')[0] : '',
                interview_duration: typeof job.interview_duration === 'string'
                    ? job.interview_duration.replace(/\D/g, '') || '45'
                    : job.interview_duration?.toString() || '45',
                custom_requirements: ''
            });

            // Reset skills
            const jobSkills = Array.isArray(job.skills)
                ? job.skills
                : typeof job.skills === 'string'
                    ? job.skills.split(', ').filter(Boolean)
                    : [];
            setSkills(jobSkills);
        }
        setIsEditing(false);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: {
                label: 'Active',
                className: 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle className="h-3 w-3" />
            },
            inactive: {
                label: 'Inactive',
                className: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: <XCircle className="h-3 w-3" />
            },
            expired: {
                label: 'Expired',
                className: 'bg-red-100 text-red-800 border-red-200',
                icon: <AlertCircle className="h-3 w-3" />
            }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        return (
            <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: job?.title,
                    text: `Check out this job opportunity: ${job?.title} at ${job?.company_name}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Job link copied to clipboard');
        }
    };

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <AppNavigation
                    items={navigationItems}
                    title="Job Details"
                />
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Loading job details...</h3>
                            <p className="text-muted-foreground">
                                Please wait while we fetch the job information
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-background">
                <AppNavigation
                    items={navigationItems}
                    title="Job Details"
                />
                <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Job not found</h3>
                            <p className="text-muted-foreground mb-4">
                                The job you're looking for doesn't exist or has been removed.
                            </p>
                            <Button onClick={() => router.push('/recruiters/dashboard')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AppNavigation
                items={navigationItems}
                title="Job Details"
            />

            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="flex-1" />
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button onClick={handleEditToggle}>
                            <Edit className="mr-2 h-4 w-4" />
                            {isEditing ? 'Cancel Edit' : 'Edit Job'}
                        </Button>
                    </div>
                </div>

                {/* Inline Edit Form */}
                {isEditing && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Edit className="h-5 w-5" />
                                Edit Job: {job.title}
                            </CardTitle>
                            <CardDescription>
                                Update job details and requirements. All changes will be saved when you click "Update Job".
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column - Form */}
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                Basic Information
                                            </CardTitle>
                                            <CardDescription>
                                                Update the basic details about the job position
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit_title">Job Title *</Label>
                                                <Input
                                                    id="edit_title"
                                                    placeholder="e.g. Senior Frontend Developer"
                                                    value={formData.title}
                                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="edit_company_name">Company Name *</Label>
                                                <div className="relative">
                                                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="edit_company_name"
                                                        placeholder="e.g. Tech Innovations Inc."
                                                        value={formData.company_name}
                                                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_location">Location *</Label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="edit_location"
                                                            placeholder="e.g. Remote, Mumbai"
                                                            value={formData.location}
                                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_job_type">Job Type</Label>
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
                                                    <Label htmlFor="edit_salary">Salary (Optional)</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="edit_salary"
                                                            placeholder="e.g. ₹8–15 LPA"
                                                            value={formData.salary}
                                                            onChange={(e) => handleInputChange('salary', e.target.value)}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_interview_duration">Interview Duration (minutes) *</Label>
                                                    <Select
                                                        value={formData.interview_duration}
                                                        onValueChange={(value) => handleInputChange('interview_duration', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select duration" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {INTERVIEW_DURATIONS.map(duration => (
                                                                <SelectItem key={duration.value} value={duration.value}>
                                                                    {duration.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="edit_end_date">Application Deadline *</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="edit_end_date"
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
                                            <CardTitle>Skills & Experience</CardTitle>
                                            <CardDescription>
                                                Update required skills and experience level for this position
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
                                                <Label htmlFor="edit_custom_requirements">Additional Requirements (Optional)</Label>
                                                <Textarea
                                                    id="edit_custom_requirements"
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
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={formLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdateJob}
                                    disabled={formLoading}
                                >
                                    {formLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update Job
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Job Header */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center space-x-3">
                                        <CardTitle className="text-3xl">{job.title}</CardTitle>
                                        {getStatusBadge(job.status)}
                                    </div>
                                    <div className="flex items-center space-x-2 text-lg text-muted-foreground">
                                        <Building className="h-5 w-5" />
                                        <span>{job.company_name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Key Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{job.salary}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{job.interview_duration} interview</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{job.applications_count} applications</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Job Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Job Description</CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-sm max-w-none">
                                <div className="text-sm leading-relaxed space-y-4">
                                    {typeof job.description === 'string' ? (
                                        job.description.split('\n\n').map((section, index) => {
                                            if (section.includes('**') && section.includes(':**')) {
                                                // This is a section with a header (like "**Requirements:**")
                                                const [header, ...content] = section.split('\n');
                                                const cleanHeader = header.replace(/\*\*/g, '');
                                                const listItems = content.filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
                                                const otherContent = content.filter(line => !line.trim().startsWith('•') && !line.trim().startsWith('-'));

                                                return (
                                                    <div key={index} className="space-y-2">
                                                        <h4 className="font-semibold text-gray-900">{cleanHeader}</h4>
                                                        {listItems.length > 0 && (
                                                            <ul className="list-disc list-inside space-y-1 ml-2">
                                                                {listItems.map((item, itemIndex) => (
                                                                    <li key={itemIndex} className="text-gray-700">
                                                                        {item.replace(/^[•\-]\s*/, '')}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                        {otherContent.map((line, lineIndex) => (
                                                            line.trim() && (
                                                                <p key={lineIndex} className="text-gray-700">
                                                                    {line}
                                                                </p>
                                                            )
                                                        ))}
                                                    </div>
                                                );
                                            } else if (section.includes('•') || section.includes('-')) {
                                                // This is a list without a header
                                                const lines = section.split('\n');
                                                const listItems = lines.filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'));
                                                const otherLines = lines.filter(line => !line.trim().startsWith('•') && !line.trim().startsWith('-'));

                                                return (
                                                    <div key={index} className="space-y-2">
                                                        {otherLines.map((line, lineIndex) => (
                                                            line.trim() && (
                                                                <p key={lineIndex} className="text-gray-700">
                                                                    {line}
                                                                </p>
                                                            )
                                                        ))}
                                                        {listItems.length > 0 && (
                                                            <ul className="list-disc list-inside space-y-1 ml-2">
                                                                {listItems.map((item, itemIndex) => (
                                                                    <li key={itemIndex} className="text-gray-700">
                                                                        {item.replace(/^[•\-]\s*/, '')}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                );
                                            } else {
                                                // Regular paragraph
                                                return (
                                                    <p key={index} className="text-gray-700">
                                                        {section}
                                                    </p>
                                                );
                                            }
                                        })
                                    ) : (
                                        <p className="text-gray-500">No description available</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Job Overview */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Job Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Job Type</div>
                                    <div className="text-sm font-semibold">{job.job_type || 'Full-time'}</div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Experience Level</div>
                                    <div className="text-sm font-semibold">{job.experience_level || 'Mid-level'}</div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Posted</div>
                                    <div className="text-sm font-semibold">{formatDate(job.created_at)}</div>
                                </div>
                                <Separator />
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Application Deadline</div>
                                    <div className="text-sm font-semibold">{formatDate(job.end_date)}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Skills Required */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Skills Required</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(job.skills)
                                        ? job.skills.map((skill: string) => (
                                            <Badge key={skill} variant="secondary">
                                                {skill}
                                            </Badge>
                                        ))
                                        : typeof job.skills === 'string'
                                            ? job.skills.split(',').map((skill: string) => (
                                                <Badge key={skill.trim()} variant="secondary">
                                                    {skill.trim()}
                                                </Badge>
                                            ))
                                            : []
                                    }
                                </div>
                            </CardContent>
                        </Card>

                        {/* Application Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Applications</span>
                                    <span className="text-sm font-semibold">{job.applications_count}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Views</span>
                                    <span className="text-sm font-semibold">--</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Response Rate</span>
                                    <span className="text-sm font-semibold">--</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
