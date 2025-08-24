'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { AppNavigation } from '@/components/app-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService, type DatabaseApplication, type DatabaseUserResume, type DatabaseJob, type DatabaseUser } from '@/lib/database';
import { toast } from 'sonner';
import {
    Briefcase,
    Users,
    FileText,
    Calendar,
    MapPin,
    DollarSign,
    Clock,
    ArrowLeft,
    Download,
    Building,
    CheckCircle,
    XCircle,
    AlertCircle,
    BarChart3,
    User,
    Mail,
    Phone,
    Star,
    Eye,
    Loader2,
    TrendingUp,
    Award,
    Target,
    Shield,
    Brain,
    Zap,
    BookOpen,
    Code,
    AlertTriangle,
    Lightbulb
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const navigationItems = [
    {
        label: 'Dashboard',
        href: '/recruiters/dashboard',
        icon: <BarChart3 className="h-4 w-4" />
    },
    {
        label: 'My Jobs',
        href: '/recruiters/jobs',
        icon: <Briefcase className="h-4 w-4" />
    },
    {
        label: 'Candidates',
        href: '/recruiters/dashboard/candidates',
        icon: <Users className="h-4 w-4" />
    },
    {
        label: 'Applications',
        href: '/recruiters/dashboard/applications',
        icon: <FileText className="h-4 w-4" />
    },
];

interface ApplicationWithDetails extends DatabaseApplication {
    user_resume: DatabaseUserResume[];
    job?: DatabaseJob;
    candidate?: DatabaseUser;
}

export default function ApplicationDetailPage() {
    const { user } = useAuth();
    const router = useRouter();
    const params = useParams();
    const applicationId = params.id as string;

    const [application, setApplication] = useState<ApplicationWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (applicationId) {
            fetchApplicationDetails();
        }
    }, [applicationId]);

    const fetchApplicationDetails = async () => {
        setLoading(true);
        try {
            // Get application details
            const applicationData = await DatabaseService.getApplicationById(applicationId);
            setApplication(applicationData as ApplicationWithDetails);
        } catch (error) {
            console.error('Error fetching application details:', error);
            toast.error('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!application) return;

        setUpdatingStatus(true);
        try {
            await DatabaseService.updateApplicationStatus(application.id, newStatus);
            setApplication(prev => prev ? { ...prev, status: newStatus } : null);
            toast.success('Application status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update application status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
            reviewed: { label: 'Reviewed', variant: 'default' as const, icon: CheckCircle },
            'in-progress': { label: 'In Progress', variant: 'default' as const, icon: AlertCircle },
            rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
            accepted: { label: 'Accepted', variant: 'default' as const, icon: CheckCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
            label: status,
            variant: 'secondary' as const,
            icon: AlertCircle
        };

        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getMatchScore = () => {
        if (application?.user_resume?.[0]?.score) {
            return application.user_resume[0].score;
        }
        return Math.floor(Math.random() * 40 + 40); // Random score for demo
    };

    const parseResumeAnalysis = (resume: DatabaseUserResume) => {
        console.log('Resume data:', resume); // Debug log

        // Try to parse scoring details if available
        if (resume.scoring_details) {
            try {
                const scoringData = typeof resume.scoring_details === 'string'
                    ? JSON.parse(resume.scoring_details)
                    : resume.scoring_details;
                console.log('Parsed scoring data:', scoringData); // Debug log

                // The actual structure is: scoring_details.analysis, not scoring_details directly
                const details = scoringData.analysis || scoringData;
                console.log('Analysis details:', details); // Debug log
                console.log('Dimension breakdown:', details.dimension_breakdown); // Debug dimension breakdown

                // Return the actual data structure from your database
                if (details && typeof details === 'object') {
                    // Get dimension breakdown with proper structure
                    const breakdown = details.dimension_breakdown || {};
                    console.log('Individual breakdowns:', breakdown); // Debug individual breakdown

                    return {
                        confidence: details.confidence ?? 0,
                        overall_score: details.overall_score ?? resume.score ?? 0,
                        risk_flags: details.risk_flags ?? [],
                        hard_filter_failures: details.hard_filter_failures ?? [],
                        passed_hard_filters: details.passed_hard_filters ?? true,
                        dimension_breakdown: breakdown,
                        // Extract individual dimensions from breakdown, handling both score and weight properly
                        extras: {
                            score: breakdown.extras?.score ?? 0,
                            weight: breakdown.extras?.weight ?? 0,
                            evidence: breakdown.extras?.evidence ?? []
                        },
                        skill_match: {
                            score: breakdown.skill_match?.score ?? 0,
                            weight: breakdown.skill_match?.weight ?? 0,
                            evidence: breakdown.skill_match?.evidence ?? []
                        },
                        experience_fit: {
                            score: breakdown.experience_fit?.score ?? 0,
                            weight: breakdown.experience_fit?.weight ?? 0,
                            evidence: breakdown.experience_fit?.evidence ?? []
                        },
                        role_alignment: {
                            score: breakdown.role_alignment?.score ?? 0,
                            weight: breakdown.role_alignment?.weight ?? 0,
                            evidence: breakdown.role_alignment?.evidence ?? []
                        },
                        certs_education: {
                            score: breakdown.certs_education?.score ?? 0,
                            weight: breakdown.certs_education?.weight ?? 0,
                            evidence: breakdown.certs_education?.evidence ?? []
                        },
                        impact_outcomes: {
                            score: breakdown.impact_outcomes?.score ?? 0,
                            weight: breakdown.impact_outcomes?.weight ?? 0,
                            evidence: breakdown.impact_outcomes?.evidence ?? []
                        },
                        career_trajectory: {
                            score: breakdown.career_trajectory?.score ?? 0,
                            weight: breakdown.career_trajectory?.weight ?? 0,
                            evidence: breakdown.career_trajectory?.evidence ?? []
                        },
                        project_tech_depth: {
                            score: breakdown.project_tech_depth?.score ?? 0,
                            weight: breakdown.project_tech_depth?.weight ?? 0,
                            evidence: breakdown.project_tech_depth?.evidence ?? []
                        },
                        communication_clarity: {
                            score: breakdown.communication_clarity?.score ?? 0,
                            weight: breakdown.communication_clarity?.weight ?? 0,
                            evidence: breakdown.communication_clarity?.evidence ?? []
                        }
                    };
                }
            } catch (error) {
                console.error('Error parsing scoring details:', error);
            }
        }

        console.log('No valid scoring details found, using fallback'); // Debug log
        // If no valid scoring details, return empty structure
        return {
            confidence: 0,
            overall_score: resume.score ?? 0,
            risk_flags: [],
            hard_filter_failures: [],
            passed_hard_filters: true,
            dimension_breakdown: {},
            extras: { score: 0, weight: 0, evidence: [] },
            skill_match: { score: 0, weight: 0, evidence: [] },
            experience_fit: { score: 0, weight: 0, evidence: [] },
            role_alignment: { score: 0, weight: 0, evidence: [] },
            certs_education: { score: 0, weight: 0, evidence: [] },
            impact_outcomes: { score: 0, weight: 0, evidence: [] },
            career_trajectory: { score: 0, weight: 0, evidence: [] },
            project_tech_depth: { score: 0, weight: 0, evidence: [] },
            communication_clarity: { score: 0, weight: 0, evidence: [] }
        };
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-green-600 bg-green-100';
        if (score >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <AppNavigation items={navigationItems} title="Application Details" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">Loading application details...</span>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!application) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50">
                    <AppNavigation items={navigationItems} title="Application Details" />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Application Not Found</h3>
                            <p className="text-gray-600 mb-4">The application you're looking for doesn't exist or has been removed.</p>
                            <Button onClick={() => router.back()}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    const matchScore = getMatchScore();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <AppNavigation items={navigationItems} title="Application Details" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Applications
                            </Button>
                        </div>

                        {/* Enhanced Header Card */}
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <User className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                                {application.candidate?.name || 'Anonymous Candidate'}
                                            </h1>
                                            <p className="text-lg text-gray-600 mb-4">
                                                Applied for: <span className="font-semibold text-gray-800">{application.job?.title || 'Senior AI Engineer'}</span>
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-4 w-4" />
                                                    {application.candidate?.email || 'Not provided'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Applied {formatDate(application.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={`text-lg px-4 py-2 ${getScoreColor(matchScore)}`}>
                                            <Star className="h-4 w-4 mr-1" />
                                            {matchScore}% Match
                                        </Badge>
                                        {getStatusBadge(application.status)}
                                    </div>
                                </div>

                                {/* Status Update Row */}
                                <div className="mt-6 pt-6 border-t border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-700">Update Application Status:</h3>
                                        <Select
                                            value={application.status}
                                            onValueChange={handleStatusUpdate}
                                            disabled={updatingStatus}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Update Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="accepted">Accepted</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Job Information */}
                            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Building className="h-5 w-5 text-purple-600" />
                                        </div>
                                        Job Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl border border-gray-100">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                            {application.job?.title || 'Senior AI Engineer'}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Building className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Company</p>
                                                    <p className="font-medium">ONEPIECE</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <MapPin className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Location</p>
                                                    <p className="font-medium">Remote</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="p-2 bg-yellow-100 rounded-lg">
                                                    <DollarSign className="h-4 w-4 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Salary</p>
                                                    <p className="font-medium">{application.job?.salary || '$120k - $150k'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {application.job?.skills && (
                                        <div className="bg-white p-6 rounded-xl border border-gray-100">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Star className="h-4 w-4 text-orange-500" />
                                                Required Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {application.job.skills.split(',').map((skill, index) => (
                                                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {skill.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>                            {/* Candidate Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Candidate Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <User className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {application.candidate?.name || 'Anonymous Candidate'}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {application.candidate?.email || 'Not provided'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Resume Analysis */}
                            {application.user_resume && application.user_resume.length > 0 && (
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-emerald-600" />
                                            Resume Analysis
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {(() => {
                                            const analysisData = parseResumeAnalysis(application.user_resume[0]);

                                            // Additional debug logging for the UI
                                            console.log('Analysis data for UI:', analysisData);
                                            console.log('Skill match score:', analysisData.skill_match.score);
                                            console.log('Experience fit score:', analysisData.experience_fit.score);

                                            return (
                                                <div className="space-y-6">
                                                    {/* Header with Overall Score */}
                                                    <div className="text-center mb-6">
                                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Detailed Score Breakdown</h3>
                                                        <div className="flex items-center justify-center gap-4">
                                                            <Badge className={`text-2xl px-6 py-3 ${getScoreColor(analysisData.overall_score)}`}>
                                                                <TrendingUp className="h-6 w-6 mr-2" />
                                                                Overall Score: {Math.round(analysisData.overall_score)}%
                                                            </Badge>
                                                            <Badge variant="outline" className="text-lg px-4 py-2">
                                                                <Brain className="h-5 w-5 mr-1" />
                                                                Confidence: {Math.round(analysisData.confidence * 100)}%
                                                            </Badge>
                                                        </div>

                                                        {/* Debug Information - Remove this after testing */}
                                                        <details className="mt-4 text-left">
                                                            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                                                🔍 Debug: Show Raw Data (Click to expand)
                                                            </summary>
                                                            <div className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-40">
                                                                <p><strong>Raw Resume Data:</strong></p>
                                                                <pre className="whitespace-pre-wrap">
                                                                    {JSON.stringify(application.user_resume?.[0], null, 2)}
                                                                </pre>
                                                                <p className="mt-2"><strong>Parsed Analysis Data:</strong></p>
                                                                <pre className="whitespace-pre-wrap">
                                                                    {JSON.stringify(analysisData, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </details>
                                                    </div>

                                                    {/* Top Row - Key Dimensions */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Extras */}
                                                        <Card className="border border-gray-200 bg-gray-50/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Extras</p>
                                                                        <p className="text-2xl font-bold text-gray-700">
                                                                            {Math.round(analysisData.extras.score || 0)}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">Weight: {Math.round((analysisData.extras.weight || 0) * 100)}%</p>
                                                                    </div>
                                                                    <Star className="h-8 w-8 text-gray-400" />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${Math.min(100, Math.max(0, analysisData.extras.score || 0))}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Skill Match */}
                                                        <Card className="border border-emerald-200 bg-emerald-50/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Skill Match</p>
                                                                        <p className="text-2xl font-bold text-emerald-700">
                                                                            {Math.round(analysisData.skill_match.score || 0)}
                                                                            <span className="text-xs text-emerald-500 ml-1">
                                                                                (Raw: {analysisData.skill_match.score})
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-xs text-emerald-500">Weight: {Math.round((analysisData.skill_match.weight || 0) * 100)}%</p>
                                                                    </div>
                                                                    <Target className="h-8 w-8 text-emerald-500" />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-emerald-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${Math.min(100, Math.max(0, analysisData.skill_match.score || 0))}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Experience Fit */}
                                                        <Card className="border border-blue-200 bg-blue-50/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Experience Fit</p>
                                                                        <p className="text-2xl font-bold text-blue-700">
                                                                            {Math.round(analysisData.experience_fit.score || 0)}
                                                                            <span className="text-xs text-blue-500 ml-1">
                                                                                (Raw: {analysisData.experience_fit.score})
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-xs text-blue-500">Weight: {Math.round((analysisData.experience_fit.weight || 0) * 100)}%</p>
                                                                    </div>
                                                                    <Award className="h-8 w-8 text-blue-500" />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${Math.min(100, Math.max(0, analysisData.experience_fit.score || 0))}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    {/* Middle Row */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Role Alignment */}
                                                        <Card className="border border-indigo-200 bg-indigo-50/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Role Alignment</p>
                                                                        <p className="text-2xl font-bold text-indigo-700">{Math.round(analysisData.role_alignment.score) || 0}</p>
                                                                        <p className="text-xs text-indigo-500">Weight: {Math.round((analysisData.role_alignment.weight || 0) * 100)}%</p>
                                                                    </div>
                                                                    <Target className="h-8 w-8 text-indigo-500" />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-indigo-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${analysisData.role_alignment.score || 0}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Certs Education */}
                                                        <Card className="border border-amber-200 bg-amber-50/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Certs Education</p>
                                                                        <p className="text-2xl font-bold text-amber-700">{Math.round(analysisData.certs_education.score) || 0}</p>
                                                                        <p className="text-xs text-amber-500">Weight: {Math.round((analysisData.certs_education.weight || 0) * 100)}%</p>
                                                                    </div>
                                                                    <BookOpen className="h-8 w-8 text-amber-500" />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-amber-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${analysisData.certs_education.score || 0}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Impact Outcomes */}
                                                        <Card className="border border-green-200 bg-green-50/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Impact Outcomes</p>
                                                                        <p className="text-2xl font-bold text-green-700">{Math.round(analysisData.impact_outcomes.score) || 0}</p>
                                                                        <p className="text-xs text-green-500">Weight: {Math.round((analysisData.impact_outcomes.weight || 0) * 100)}%</p>
                                                                    </div>
                                                                    <TrendingUp className="h-8 w-8 text-green-500" />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-green-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${analysisData.impact_outcomes.score || 0}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    {/* Bottom Row */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {/* Career Trajectory */}
                                                        <Card className="border border-purple-200 bg-purple-50/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Career Trajectory</p>
                                                                        <p className="text-2xl font-bold text-purple-700">{Math.round(analysisData.career_trajectory.score) || 0}</p>
                                                                        <p className="text-xs text-purple-500">Weight: {Math.round((analysisData.career_trajectory.weight || 0) * 100)}%</p>
                                                                    </div>
                                                                    <TrendingUp className="h-8 w-8 text-purple-500" />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-purple-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${analysisData.career_trajectory.score || 0}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Project Tech Depth */}
                                                        <Card className="border border-orange-200 bg-orange-50/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Project Tech Depth</p>
                                                                        <p className="text-2xl font-bold text-orange-700">{Math.round(analysisData.project_tech_depth.score) || 0}</p>
                                                                        <p className="text-xs text-orange-500">Weight: {Math.round((analysisData.project_tech_depth.weight || 0) * 100)}%</p>
                                                                    </div>
                                                                    <Code className="h-8 w-8 text-orange-500" />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-orange-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${analysisData.project_tech_depth.score || 0}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Communication Clarity */}
                                                        <Card className="border border-teal-200 bg-teal-50/30">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-xs font-medium text-teal-600 uppercase tracking-wide">Communication Clarity</p>
                                                                        <p className="text-2xl font-bold text-teal-700">{Math.round(analysisData.communication_clarity.score) || 0}</p>
                                                                        <p className="text-xs text-teal-500">Weight: {Math.round((analysisData.communication_clarity.weight || 0) * 100)}%</p>
                                                                    </div>
                                                                    <Lightbulb className="h-8 w-8 text-teal-500" />
                                                                </div>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-teal-200 rounded-full h-2">
                                                                        <div
                                                                            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                                                                            style={{ width: `${analysisData.communication_clarity.score || 0}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    {/* Risk Flags & Hard Filter Failures */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Risk Flags */}
                                                        <Card className="border border-yellow-200 bg-yellow-50/30">
                                                            <CardHeader className="pb-3">
                                                                <CardTitle className="flex items-center gap-2 text-yellow-700">
                                                                    <AlertTriangle className="h-5 w-5" />
                                                                    Risk Flags ({analysisData.risk_flags.length})
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent>
                                                                {analysisData.risk_flags && analysisData.risk_flags.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {analysisData.risk_flags.map((flag: string, index: number) => (
                                                                            <div key={index} className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
                                                                                <p className="text-sm text-yellow-800">{flag}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-4">
                                                                        <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                                                        <p className="text-sm text-green-600 font-medium">No risk flags detected</p>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>

                                                        {/* Hard Filter Failures */}
                                                        <Card className="border border-red-200 bg-red-50/30">
                                                            <CardHeader className="pb-3">
                                                                <CardTitle className="flex items-center gap-2 text-red-700">
                                                                    <XCircle className="h-5 w-5" />
                                                                    Hard Filter Failures ({analysisData.hard_filter_failures.length})
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent>
                                                                {analysisData.hard_filter_failures && analysisData.hard_filter_failures.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {analysisData.hard_filter_failures.map((failure: string, index: number) => (
                                                                            <div key={index} className="p-3 bg-red-100 rounded-lg border border-red-200">
                                                                                <p className="text-sm text-red-800">{failure}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-4">
                                                                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                                                        <p className="text-sm text-green-600 font-medium">All hard filters passed</p>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    {/* Download Actions */}
                                                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                                                        <Button variant="outline" size="sm">
                                                            <Download className="h-3 w-3 mr-1" />
                                                            Download Resume
                                                        </Button>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-3 w-3 mr-1" />
                                                            View Resume
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Quick Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Match Score</span>
                                        <Badge className={`${getScoreColor(matchScore)}`}>
                                            {matchScore}%
                                        </Badge>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Applied</span>
                                        <span className="text-sm font-medium">
                                            {formatDate(application.created_at)}
                                        </span>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Status</span>
                                        {getStatusBadge(application.status)}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Interview Analysis */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Brain className="h-5 w-5" />
                                        Interview Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-4">
                                        <Button
                                            className="w-full"
                                            onClick={() => router.push(`/recruiters/dashboard/applications/${applicationId}/interview-analysis`)}
                                        >
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            View Detailed Analysis
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        className="w-full"
                                        variant="default"
                                        onClick={() => handleStatusUpdate('accepted')}
                                        disabled={updatingStatus}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Accept Application
                                    </Button>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('rejected')}
                                        disabled={updatingStatus}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Application
                                    </Button>
                                    <Button
                                        className="w-full"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate('in-progress')}
                                        disabled={updatingStatus}
                                    >
                                        <AlertCircle className="h-4 w-4 mr-2" />
                                        Move to In Progress
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
