'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Calendar,
    MapPin,
    DollarSign,
    Clock,
    Users,
    Briefcase,
    Edit,
    Eye,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

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

interface JobDetailsModalProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (jobId: string) => void;
    onToggleStatus: (jobId: string) => void;
}

export default function JobDetailsModal({
    job,
    isOpen,
    onClose,
    onEdit,
    onToggleStatus
}: JobDetailsModalProps) {
    if (!job) return null;

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
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'inactive':
                return <XCircle className="h-4 w-4 text-gray-600" />;
            case 'expired':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return <XCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { label: 'Active', className: 'bg-green-100 text-green-800 border-green-200' },
            inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800 border-gray-200' },
            expired: { label: 'Expired', className: 'bg-red-100 text-red-800 border-red-200' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        return (
            <Badge variant="outline" className={config.className}>
                {getStatusIcon(status)}
                <span className="ml-1">{config.label}</span>
            </Badge>
        );
    };

    const isExpiring = () => {
        const today = new Date();
        const endDate = new Date(job.end_date);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    };

    const isExpired = () => {
        const today = new Date();
        const endDate = new Date(job.end_date);
        return endDate < today;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
                            <div className="flex items-center space-x-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span className="text-lg text-muted-foreground">{job.company}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusBadge(job.status)}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Alert for expiring/expired jobs */}
                    {isExpired() && (
                        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="text-red-800 font-medium">This job posting has expired</span>
                        </div>
                    )}
                    {isExpiring() && !isExpired() && (
                        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                            <span className="text-yellow-800 font-medium">
                                This job posting expires in {Math.ceil((new Date(job.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                            </span>
                        </div>
                    )}

                    {/* Key Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-medium">{job.location}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <DollarSign className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Salary</p>
                                    <p className="font-medium">{job.salary || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Interview Duration</p>
                                    <p className="font-medium">{job.interview_duration}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Applications</p>
                                    <p className="font-medium">{job.applications_count} candidates</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Created</p>
                                    <p className="font-medium">{formatDate(job.created_at)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Expires</p>
                                    <p className="font-medium">{formatDate(job.end_date)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Required Skills */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-sm">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Job Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                        <div className="prose prose-sm max-w-none">
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {job.description}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Job Statistics */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Job Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <Eye className="h-5 w-5 text-blue-600" />
                                    <span className="text-blue-800 font-medium">Views</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-900 mt-1">
                                    {Math.floor(Math.random() * 200) + 50}
                                </p>
                                <p className="text-xs text-blue-700">Total page views</p>
                            </div>

                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <Users className="h-5 w-5 text-green-600" />
                                    <span className="text-green-800 font-medium">Applications</span>
                                </div>
                                <p className="text-2xl font-bold text-green-900 mt-1">
                                    {job.applications_count}
                                </p>
                                <p className="text-xs text-green-700">Candidates applied</p>
                            </div>

                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    <span className="text-purple-800 font-medium">Conversion</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-900 mt-1">
                                    {job.applications_count > 0 ? Math.round((job.applications_count / (Math.floor(Math.random() * 200) + 50)) * 100) : 0}%
                                </p>
                                <p className="text-xs text-purple-700">View to application</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onToggleStatus(job.id)}
                            className="flex items-center space-x-2"
                        >
                            {job.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            <span>{job.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                        </Button>
                        <Button
                            onClick={() => onEdit(job.id)}
                            className="flex items-center space-x-2"
                        >
                            <Edit className="h-4 w-4" />
                            <span>Edit Job</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
