"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Edit,
    Save,
    X,
    MapPin,
    Calendar,
    DollarSign,
    Clock,
    Building,
    Users,
    CheckCircle,
    XCircle,
    Star,
    ArrowLeft
} from "lucide-react";
import { jobService, Job, JobDescription, UpdateJobData } from "@/lib/job-service";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from "react-markdown";
import { JobSkillSelector } from "@/components/job-skill-selector";
import { JobDataExtractor } from "@/components/job-data-extractor";

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit form state
    const [editData, setEditData] = useState<UpdateJobData>({
        id: "",
        title: "",
        company_name: "",
        location: "",
        description: {
            requirements: [],
            responsibilities: [],
            benefits: [],
            experience: ""
        },
        salary: "",
        skills: "",
        job_type: "",
        end_date: "",
        interview_duration: 30,
        status: "active" as "active" | "inactive",
        recruiter_id: ""
    });

    useEffect(() => {
        if (params.id && typeof params.id === 'string') {
            fetchJob(params.id);
        }
    }, [params.id]);

    const fetchJob = async (jobId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const jobData = await jobService.getJobById(jobId);

            // Verify the recruiter owns this job
            if (jobData.recruiter_id !== user?.id) {
                setError("You don't have permission to view this job.");
                return;
            }

            setJob(jobData);

            // Initialize edit form with current data
            setEditData({
                id: jobData.id,
                title: jobData.title,
                company_name: jobData.company_name,
                location: jobData.location,
                description: jobData.description,
                salary: jobData.salary || "",
                skills: jobData.skills,
                job_type: jobData.job_type,
                end_date: jobData.end_date,
                interview_duration: jobData.interview_duration,
                status: jobData.status === 'expired' ? 'inactive' : jobData.status as "active" | "inactive",
                recruiter_id: jobData.recruiter_id
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch job details");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);

            const updatedJob = await jobService.updateJob(editData);
            setJob(updatedJob);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update job");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (job) {
            setEditData({
                id: job.id,
                title: job.title,
                company_name: job.company_name,
                location: job.location,
                description: job.description,
                salary: job.salary || "",
                skills: job.skills,
                job_type: job.job_type,
                end_date: job.end_date,
                interview_duration: job.interview_duration,
                status: job.status === 'expired' ? 'inactive' : job.status as "active" | "inactive",
                recruiter_id: job.recruiter_id
            });
        }
        setIsEditing(false);
        setError(null);
    };

    const updateDescription = (field: keyof JobDescription, value: string | string[]) => {
        setEditData(prev => ({
            ...prev,
            description: {
                ...prev.description!,
                [field]: value
            }
        }));
    };

    const addToDescriptionArray = (field: 'requirements' | 'responsibilities' | 'benefits', item: string) => {
        if (!item.trim()) return;

        setEditData(prev => ({
            ...prev,
            description: {
                ...prev.description!,
                [field]: [...(prev.description![field] || []), item.trim()]
            }
        }));
    };

    const removeFromDescriptionArray = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
        setEditData(prev => ({
            ...prev,
            description: {
                ...prev.description!,
                [field]: (prev.description![field] || []).filter((_, i) => i !== index)
            }
        }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'inactive':
                return <XCircle className="h-4 w-4 text-gray-500" />;
            case 'expired':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            active: "default",
            inactive: "secondary",
            expired: "destructive"
        } as const;

        return (
            <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
                {getStatusIcon(status)}
                <span className="ml-1 capitalize">{status}</span>
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-muted-foreground">Loading job details...</div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="text-lg text-destructive">{error || "Job not found"}</div>
                    <Button onClick={() => router.push('/recruiters/jobs')} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Jobs
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/recruiters/jobs')}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{job.title}</h1>
                        <p className="text-muted-foreground">{job.company_name}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {getStatusBadge(job.status)}
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Job
                        </Button>
                    ) : (
                        <div className="flex space-x-2">
                            <Button onClick={handleSave} disabled={isSaving}>
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive">{error}</p>
                </div>
            )}

            {/* Job Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Building className="h-5 w-5 mr-2" />
                        Job Overview
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                    id="title"
                                    value={editData.title}
                                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company Name</Label>
                                <Input
                                    id="company"
                                    value={editData.company_name}
                                    onChange={(e) => setEditData(prev => ({ ...prev, company_name: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={editData.location}
                                    onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salary">Salary</Label>
                                <Input
                                    id="salary"
                                    value={editData.salary}
                                    onChange={(e) => setEditData(prev => ({ ...prev, salary: e.target.value }))}
                                    placeholder="e.g., $50,000 - $70,000"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_type">Job Type</Label>
                                <Select
                                    value={editData.job_type}
                                    onValueChange={(value) => setEditData(prev => ({ ...prev, job_type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full-time</SelectItem>
                                        <SelectItem value="part-time">Part-time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="end_date">Application Deadline</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={editData.end_date}
                                    onChange={(e) => setEditData(prev => ({ ...prev, end_date: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interview_duration">Interview Duration (minutes)</Label>
                                <Input
                                    id="interview_duration"
                                    type="number"
                                    value={editData.interview_duration}
                                    onChange={(e) => setEditData(prev => ({ ...prev, interview_duration: parseInt(e.target.value) || 30 }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={editData.status}
                                    onValueChange={(value: 'active' | 'inactive') => setEditData(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{job.location}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(job.end_date)}</span>
                            </div>

                            {job.salary && (
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>{job.salary}</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{job.interview_duration} min interview</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{job.applications_count || 0} applications</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Type:</span>
                                <Badge variant="outline">{job.job_type}</Badge>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Skills */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Star className="h-5 w-5 mr-2" />
                        Required Skills
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-2">
                            <Label>Skills</Label>
                            <JobSkillSelector
                                selectedSkills={editData.skills?.split(',').map(s => s.trim()).filter(Boolean) || []}
                                onSkillsChange={(skills: string[]) => setEditData(prev => ({ ...prev, skills: skills.join(', ') }))}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {job.skills.split(',').map((skill, index) => (
                                <Badge key={index} variant="secondary">
                                    {skill.trim()}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Job Description Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Requirements */}
                <Card>
                    <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <EditableList
                                items={editData.description?.requirements || []}
                                onAdd={(item) => addToDescriptionArray('requirements', item)}
                                onRemove={(index) => removeFromDescriptionArray('requirements', index)}
                                placeholder="Add a requirement..."
                            />
                        ) : (
                            <ul className="space-y-2">
                                {job.description.requirements.map((req, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <span className="text-muted-foreground mt-1">•</span>
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{req}</ReactMarkdown>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Responsibilities */}
                <Card>
                    <CardHeader>
                        <CardTitle>Responsibilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <EditableList
                                items={editData.description?.responsibilities || []}
                                onAdd={(item) => addToDescriptionArray('responsibilities', item)}
                                onRemove={(index) => removeFromDescriptionArray('responsibilities', index)}
                                placeholder="Add a responsibility..."
                            />
                        ) : (
                            <ul className="space-y-2">
                                {job.description.responsibilities.map((resp, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                        <span className="text-muted-foreground mt-1">•</span>
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>{resp}</ReactMarkdown>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Benefits */}
            <Card>
                <CardHeader>
                    <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <EditableList
                            items={editData.description?.benefits || []}
                            onAdd={(item) => addToDescriptionArray('benefits', item)}
                            onRemove={(index) => removeFromDescriptionArray('benefits', index)}
                            placeholder="Add a benefit..."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {job.description.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                                    <div className="prose prose-sm max-w-none">
                                        <ReactMarkdown>{benefit}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Experience Level */}
            <Card>
                <CardHeader>
                    <CardTitle>Experience Level</CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-2">
                            <Label htmlFor="experience">Experience Requirements</Label>
                            <Textarea
                                id="experience"
                                value={editData.description?.experience || ''}
                                onChange={(e) => updateDescription('experience', e.target.value)}
                                placeholder="Describe the experience level required for this position..."
                                className="min-h-[100px]"
                            />
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{job.description.experience}</ReactMarkdown>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Job Description Analysis */}
            {!isEditing && (
                <JobDataExtractor
                    description={job.description}
                    title="Job Description Analysis & Key Data"
                />
            )}
        </div>
    );
}

// Component for editing lists of items
interface EditableListProps {
    items: string[];
    onAdd: (item: string) => void;
    onRemove: (index: number) => void;
    placeholder: string;
}

function EditableList({ items, onAdd, onRemove, placeholder }: EditableListProps) {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (newItem.trim()) {
            onAdd(newItem);
            setNewItem('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-4">
            {/* Existing items */}
            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 border rounded-md">
                        <Textarea
                            value={item}
                            onChange={(e) => {
                                const newItems = [...items];
                                newItems[index] = e.target.value;
                                // Update the items directly through parent
                                onRemove(index);
                                setTimeout(() => onAdd(e.target.value), 0);
                            }}
                            className="flex-1 min-h-[60px] resize-none"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(index)}
                            className="text-destructive hover:text-destructive"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {/* Add new item */}
            <div className="flex space-x-2">
                <Textarea
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="flex-1 min-h-[60px] resize-none"
                />
                <Button onClick={handleAdd} disabled={!newItem.trim()}>
                    Add
                </Button>
            </div>
        </div>
    );
}
