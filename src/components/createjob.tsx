import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { SkillSelector } from "./SkillSelector";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
// You may need to use shadcn's Select, MultiSelect, Switch, DatePicker, etc. If not present, install them.

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
        label: "Ai",
        skills: [
            { label: "TensorFlow", value: "TensorFlow" },
            { label: "PyTorch", value: "PyTorch" },
            { label: "Scikit-learn", value: "Scikit-learn" },
            { label: "Keras", value: "Keras" },
        ],
    },
];

const locationsList = ["Remote", "Onsite", "Hybrid", "USA", "Europe", "Asia"];
const interviewDurations = ["15 min", "30 min", "45 min", "60 min"];

interface JobFormState {
    title: string;
    company: string;
    location: string;
    salary: string;
    expiry: string;
    duration: string;
    description: string;
}

export default function CreateJob() {
    // Remove showSuccess state, use Sonner toast instead
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [skills, setSkills] = useState<string[]>([]);
    const [jobStatus, setJobStatus] = useState(false);
    const [form, setForm] = useState<JobFormState>({
        title: "",
        company: "",
        location: "",
        salary: "",
        expiry: "",
        duration: "",
        description: "",
    });

    // Handler for multi-select skills (memoized)
    const handleSkillChange = React.useCallback((skill: string) => {
        setSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    }, []);

    // Memoized skill chips
    const skillChips = React.useMemo(() => (
        skills.map((skill) => (
            <span key={skill} className="inline-flex items-center px-3 py-1 rounded bg-muted text-sm">
                {skill}
                <button
                    type="button"
                    className="ml-2 text-muted-foreground hover:text-destructive"
                    onClick={() => handleSkillChange(skill)}
                    aria-label={`Remove ${skill}`}
                    tabIndex={0}
                >
                    ×
                </button>
            </span>
        ))
    ), [skills, handleSkillChange]);

    // Handler for selecting a skill from CommandItem
    const handleSkillSelect = React.useCallback((skill: string) => () => {
        handleSkillChange(skill);
    }, [handleSkillChange]);

    // Handler for checkbox change
    const handleSkillCheckboxChange = React.useCallback((skill: string) => () => {
        handleSkillChange(skill);
    }, [handleSkillChange]);

    // Handler for form fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handler for job status toggle
    const handleStatusChange = () => {
        setJobStatus((prev) => !prev);
    };

    // Handler for AI generation (stub)
    const handleAIGenerate = async () => {
        setAiLoading(true);
        // TODO: Integrate AI job description generation
        await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulate async
        setForm({ ...form, description: "Generated job description..." });
        setAiLoading(false);
    };

    // Handler for submit (to be integrated with backend)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.company || !form.location || !form.expiry || !form.duration || skills.length === 0) {
            setError("Please fill all required fields and select at least one skill.");
            return;
        }
        setError(null);
        try {
            const res = await fetch("http://localhost:8000/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    recruiter_id: "440b5abb-cd64-4df3-9c01-caa28d9a1862", // Replace with actual recruiter id if available
                    title: form.title,
                    description: form.description,
                    salary: form.salary,
                    skills: skills.join(", "),
                    job_type: "full-time",
                    end_date: form.expiry
                })
            });
            if (!res.ok) {
                let errorMsg = "Failed to create job.";
                try {
                    const errData = await res.json();
                    errorMsg = errData.detail || errData.message || errorMsg;
                } catch { }
                throw new Error(errorMsg);
            }
            const data = await res.json();
            setOpen(false);
            setForm({
                title: "",
                company: "",
                location: "",
                salary: "",
                expiry: "",
                duration: "",
                description: "",
            });
            setSkills([]);
            setJobStatus(false);
            toast.success("Job created successfully!");
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <Button onClick={() => setOpen(true)} size="lg" className="px-6 py-3 text-lg">Create New Job</Button>
                <DialogContent className="max-w-[1100px] w-full h-[90vh] mx-auto overflow-y-auto bg-background dark:bg-zinc-900 dark:text-white border dark:border-zinc-800 p-8 rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold mb-1">Create New Job</DialogTitle>
                        <span className="text-muted-foreground text-base mb-4">Fill in the details to create a new job posting.</span>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="text-destructive text-base mb-2">{error}</div>
                        )}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="title" className="block mb-2 font-medium dark:text-white">Job Title</label>
                                <Input id="title" name="title" placeholder="e.g. Software Engineer" value={form.title} onChange={handleChange} className="h-12 text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700" />
                            </div>
                            <div>
                                <label htmlFor="company" className="block mb-2 font-medium dark:text-white">Company Name</label>
                                <Input id="company" name="company" placeholder="e.g. Acme Inc." value={form.company} onChange={handleChange} className="h-12 text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700" />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium dark:text-white">Skills</label>
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
                            <div>
                                <label htmlFor="location" className="block mb-2 font-medium dark:text-white">Location</label>
                                <Select value={form.location} onValueChange={value => setForm(f => ({ ...f, location: value }))}>
                                    <SelectTrigger className="h-12 w-full text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                                        <SelectValue placeholder="Select location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {locationsList.map((loc) => (
                                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="salary" className="block mb-2 font-medium dark:text-white">Salary (Optional)</label>
                                <Input id="salary" name="salary" placeholder="e.g. $80,000 - $100,000" value={form.salary} onChange={handleChange} className="h-12 text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700" />
                            </div>
                            <div>
                                <label htmlFor="expiry" className="block mb-2 font-medium dark:text-white">Expiry Date</label>
                                <Input id="expiry" type="date" name="expiry" value={form.expiry} onChange={handleChange} className="h-12 text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700" />
                            </div>
                            <div>
                                <label htmlFor="duration" className="block mb-2 font-medium dark:text-white">Interview Duration</label>
                                <Select value={form.duration} onValueChange={value => setForm(f => ({ ...f, duration: value }))}>
                                    <SelectTrigger className="h-12 w-full text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                                        <SelectValue placeholder="Select interview duration *" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {interviewDurations.map((d) => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="text-muted-foreground text-xs mt-1 block">Set the maximum duration for the AI interview session (required)</span>
                            </div>
                            <div className="flex flex-col justify-between">
                                <label className="block mb-2 font-medium dark:text-white">Job Status</label>
                                <div className="flex items-center gap-3 mb-2">
                                    <Button type="button" variant={jobStatus ? "default" : "outline"} onClick={handleStatusChange} size="sm" className="px-4">
                                        {jobStatus ? "Active" : "Inactive"}
                                    </Button>
                                    <span className="text-muted-foreground text-sm dark:text-zinc-400">Set whether this job is active and visible to candidates</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block mb-2 font-medium dark:text-white">Job Description</label>
                            <div className="flex gap-2 items-start">
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter job description or generate with AI"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="flex-1 h-32 text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                                />
                                <Button type="button" onClick={handleAIGenerate} disabled={aiLoading} className="h-12 px-4 text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700">
                                    {aiLoading ? "Generating..." : "Generate with AI"}
                                </Button>
                            </div>
                            <span className="text-muted-foreground text-xs mt-1 block">You can manually enter the job description or use AI to generate one based on the job title, company, and role.</span>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button type="submit" size="lg" className="h-12 px-8 text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700">Create Job</Button>
                            <Button type="button" onClick={() => setOpen(false)} variant="outline" size="lg" className="h-12 px-8 text-base ml-4 dark:bg-zinc-800 dark:text-white dark:border-zinc-700">Cancel</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <Toaster position="top-right" richColors />
        </>
    );
}
