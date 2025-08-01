'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SkillSelector } from './SkillSelector';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { jobService, validateJobData, formatJobData } from '@/lib/job-service';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Save, X } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
    skills: string[];
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
    end_date: string;
    applications_count: number;
    interview_duration: string;
    description: string;
}

interface JobEditModalProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    onJobUpdated: () => void;
}

const skillGroups = [
    {
        label: "Programming",
        skills: [
            { label: "JavaScript", value: "JavaScript" },
            { label: "TypeScript", value: "TypeScript" },
            { label: "Python", value: "Python" },
            { label: "Java", value: "Java" },
            { label: "C#", value: "C#" },
            { label: "C++", value: "C++" },
            { label: "Go", value: "Go" },
            { label: "Rust", value: "Rust" },
            { label: "PHP", value: "PHP" },
            { label: "Ruby", value: "Ruby" },
        ],
    },
    {
        label: "Frontend",
        skills: [
            { label: "React", value: "React" },
            { label: "Vue.js", value: "Vue.js" },
            { label: "Angular", value: "Angular" },
            { label: "HTML", value: "HTML" },
            { label: "CSS", value: "CSS" },
            { label: "Sass", value: "Sass" },
            { label: "Tailwind CSS", value: "Tailwind CSS" },
        ],
    },
    {
        label: "Backend",
        skills: [
            { label: "Node.js", value: "Node.js" },
            { label: "Express.js", value: "Express.js" },
            { label: "Django", value: "Django" },
            { label: "Flask", value: "Flask" },
            { label: "Spring Boot", value: "Spring Boot" },
            { label: "Laravel", value: "Laravel" },
            { label: "Ruby on Rails", value: "Ruby on Rails" },
        ],
    },
    {
        label: "Mobile",
        skills: [
            { label: "React Native", value: "React Native" },
            { label: "Flutter", value: "Flutter" },
            { label: "iOS Development", value: "iOS Development" },
            { label: "Android Development", value: "Android Development" },
            { label: "Xamarin", value: "Xamarin" },
            { label: "Ionic", value: "Ionic" },
        ],
    },
    {
        label: "Database",
        skills: [
            { label: "MySQL", value: "MySQL" },
            { label: "PostgreSQL", value: "PostgreSQL" },
            { label: "MongoDB", value: "MongoDB" },
            { label: "Redis", value: "Redis" },
            { label: "SQLite", value: "SQLite" },
            { label: "Oracle", value: "Oracle" },
        ],
    },
    {
        label: "AI & Data",
        skills: [
            { label: "TensorFlow", value: "TensorFlow" },
            { label: "PyTorch", value: "PyTorch" },
            { label: "Scikit-learn", value: "Scikit-learn" },
            { label: "Keras", value: "Keras" },
            { label: "Pandas", value: "Pandas" },
            { label: "NumPy", value: "NumPy" },
        ],
    },
    {
        label: "Other",
        skills: [
            { label: "Product Strategy", value: "Product Strategy" },
            { label: "Analytics", value: "Analytics" },
            { label: "User Research", value: "User Research" },
            { label: "Design", value: "Design" },
            { label: "Marketing", value: "Marketing" },
            { label: "Sales", value: "Sales" },
        ],
    },
];

const locationsList = ["Remote", "Onsite", "Hybrid", "USA", "Europe", "Asia", "New York", "San Francisco", "London", "Berlin", "Toronto"];
const interviewDurations = ["15 min", "30 min", "45 min", "60 min", "90 min"];

export default function JobEditModal({ job, isOpen, onClose, onJobUpdated }: JobEditModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        company: '',
        location: '',
        salary: '',
        expiry: '',
        duration: '',
        description: '',
    });

    const [skills, setSkills] = useState<string[]>([]);
    const [jobStatus, setJobStatus] = useState(false);

    // Initialize form with job data when modal opens
    useEffect(() => {
        if (job && isOpen) {
            setForm({
                title: job.title,
                company: job.company,
                location: job.location,
                salary: job.salary || '',
                expiry: job.end_date,
                duration: job.interview_duration,
                description: job.description,
            });
            setSkills(job.skills);
            setJobStatus(job.status === 'active');
            setError(null);
        }
    }, [job, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSkillChange = React.useCallback((skill: string) => {
        setSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    }, []);

    const handleStatusChange = () => {
        setJobStatus(!jobStatus);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user?.id || !job?.id) {
            setError("Authentication required");
            return;
        }

        // Validate the form
        const jobData = {
            recruiter_id: user.id,
            title: form.title,
            company: form.company,
            location: form.location,
            description: form.description,
            salary: form.salary,
            skills: skills.join(', '),
            job_type: 'full-time',
            end_date: form.expiry,
            interview_duration: form.duration,
            status: jobStatus ? 'active' as const : 'inactive' as const
        };

        const validationErrors = validateJobData(jobData);
        if (validationErrors.length > 0) {
            setError(validationErrors[0]);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await jobService.updateJob({
                id: job.id,
                ...jobData
            });

            toast.success("Job updated successfully!");
            onClose();
            onJobUpdated();
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (!job) return null;

    const skillChips = skills.map((skill) => (
        <span key={skill} className="inline-flex items-center px-3 py-1 rounded bg-muted text-sm">
            {skill}
            <button
                type="button"
                className="ml-2 text-muted-foreground hover:text-destructive"
                onClick={() => handleSkillChange(skill)}
                aria-label={`Remove ${skill}`}
            >
                ×
            </button>
        </span>
    ));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[1100px] w-full h-[90vh] mx-auto overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Job: {job.title}</DialogTitle>
                    <p className="text-muted-foreground">Update the job details below</p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-6">
                        {/* Job Title */}
                        <div>
                            <label htmlFor="title" className="block mb-2 font-medium">
                                Job Title *
                            </label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="e.g. Software Engineer"
                                value={form.title}
                                onChange={handleChange}
                                className="h-12 text-base"
                                required
                            />
                        </div>

                        {/* Company Name */}
                        <div>
                            <label htmlFor="company" className="block mb-2 font-medium">
                                Company Name *
                            </label>
                            <Input
                                id="company"
                                name="company"
                                placeholder="e.g. Acme Inc."
                                value={form.company}
                                onChange={handleChange}
                                className="h-12 text-base"
                                required
                            />
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block mb-2 font-medium">Required Skills *</label>
                            <SkillSelector
                                skillGroups={skillGroups}
                                selectedSkills={skills}
                                onSkillChange={handleSkillChange}
                            />
                            {skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {skillChips}
                                </div>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label htmlFor="location" className="block mb-2 font-medium">
                                Location *
                            </label>
                            <Select value={form.location} onValueChange={value => setForm(f => ({ ...f, location: value }))}>
                                <SelectTrigger className="h-12 w-full text-base">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    {locationsList.map((loc) => (
                                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Salary */}
                        <div>
                            <label htmlFor="salary" className="block mb-2 font-medium">
                                Salary (Optional)
                            </label>
                            <Input
                                id="salary"
                                name="salary"
                                placeholder="e.g. $80,000 - $100,000"
                                value={form.salary}
                                onChange={handleChange}
                                className="h-12 text-base"
                            />
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label htmlFor="expiry" className="block mb-2 font-medium">
                                Expiry Date *
                            </label>
                            <Input
                                id="expiry"
                                type="date"
                                name="expiry"
                                value={form.expiry}
                                onChange={handleChange}
                                className="h-12 text-base"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        {/* Interview Duration */}
                        <div>
                            <label htmlFor="duration" className="block mb-2 font-medium">
                                Interview Duration *
                            </label>
                            <Select value={form.duration} onValueChange={value => setForm(f => ({ ...f, duration: value }))}>
                                <SelectTrigger className="h-12 w-full text-base">
                                    <SelectValue placeholder="Select interview duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {interviewDurations.map((d) => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Job Status */}
                        <div className="flex flex-col justify-between">
                            <label className="block mb-2 font-medium">Job Status</label>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant={jobStatus ? "default" : "outline"}
                                    onClick={handleStatusChange}
                                    size="sm"
                                    className="px-4"
                                >
                                    {jobStatus ? "Active" : "Inactive"}
                                </Button>
                                <span className="text-muted-foreground text-sm">
                                    Set whether this job is active and visible to candidates
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Job Description */}
                    <div>
                        <label htmlFor="description" className="block mb-2 font-medium">
                            Job Description *
                        </label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Enter job description..."
                            value={form.description}
                            onChange={handleChange}
                            className="h-32 text-base"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Provide a detailed description of the role, responsibilities, and requirements.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
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
                </form>
            </DialogContent>
        </Dialog>
    );
}
