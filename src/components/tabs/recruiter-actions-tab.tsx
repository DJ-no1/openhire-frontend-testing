'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Mail,
    Calendar,
    FileText,
    Star,
    Clock,
    User,
    Send,
    Save,
    Phone,
    MessageSquare,
    Tag,
    History,
    Settings,
    Plus
} from 'lucide-react';

interface RecruiterActionsTabProps {
    artifact: any;
    applicationDetails: any;
    applicationId: string;
}

export function RecruiterActionsTab({ artifact, applicationDetails, applicationId }: RecruiterActionsTabProps) {
    const [selectedAction, setSelectedAction] = useState<string>('status');
    const [applicationStatus, setApplicationStatus] = useState('pending');
    const [candidateRating, setCandidateRating] = useState(4);
    const [recruiterNotes, setRecruiterNotes] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [interviewSchedule, setInterviewSchedule] = useState({
        date: '',
        time: '',
        type: 'video',
        duration: '60'
    });
    const [tags, setTags] = useState<string[]>(['technical-strong', 'culture-fit']);
    const [newTag, setNewTag] = useState('');
    const [actionHistory] = useState([
        { action: 'Interview Completed', user: 'System', timestamp: new Date(Date.now() - 60000).toISOString(), details: 'AI Interview completed successfully' },
        { action: 'Application Reviewed', user: 'John Doe', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Initial screening completed' },
        { action: 'Resume Scored', user: 'System', timestamp: new Date(Date.now() - 7200000).toISOString(), details: 'Resume analysis completed with 85% match' },
        { action: 'Application Submitted', user: 'Candidate', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'Application submitted for review' }
    ]);

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            setApplicationStatus(newStatus);
            toast.success(`Application status updated to ${newStatus}`);
            // Here you would make an API call to update the status
        } catch (error) {
            toast.error('Failed to update application status');
        }
    };

    const handleSendEmail = async () => {
        if (!emailSubject || !emailBody) {
            toast.error('Please fill in both subject and body');
            return;
        }

        try {
            // Here you would make an API call to send the email
            toast.success('Email sent successfully');
            setEmailSubject('');
            setEmailBody('');
        } catch (error) {
            toast.error('Failed to send email');
        }
    };

    const handleSaveNotes = async () => {
        try {
            // Here you would make an API call to save the notes
            toast.success('Notes saved successfully');
        } catch (error) {
            toast.error('Failed to save notes');
        }
    };

    const handleScheduleInterview = async () => {
        if (!interviewSchedule.date || !interviewSchedule.time) {
            toast.error('Please select date and time');
            return;
        }

        try {
            // Here you would make an API call to schedule the interview
            toast.success('Interview scheduled successfully');
        } catch (error) {
            toast.error('Failed to schedule interview');
        }
    };

    const addTag = () => {
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending':
                return { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
            case 'reviewed':
                return { label: 'Under Review', color: 'bg-blue-100 text-blue-800', icon: AlertCircle };
            case 'accepted':
                return { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: CheckCircle };
            case 'rejected':
                return { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle };
            case 'on-hold':
                return { label: 'On Hold', color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
        }
    };

    const statusConfig = getStatusConfig(applicationStatus);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="space-y-6">
            {/* Current Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-2 border-blue-200 bg-blue-50/30">
                    <CardContent className="p-6 text-center">
                        <StatusIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-sm text-gray-600 mb-1">Current Status</div>
                        <Badge className={statusConfig.color}>
                            {statusConfig.label}
                        </Badge>
                    </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-purple-50/30">
                    <CardContent className="p-6 text-center">
                        <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-purple-700">{candidateRating}/5</div>
                        <div className="text-sm text-gray-600">Rating</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50/30">
                    <CardContent className="p-6 text-center">
                        <Tag className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-green-700">{tags.length}</div>
                        <div className="text-sm text-gray-600">Tags Applied</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-orange-50/30">
                    <CardContent className="p-6 text-center">
                        <History className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-3xl font-bold text-orange-700">{actionHistory.length}</div>
                        <div className="text-sm text-gray-600">Actions Taken</div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-6 w-6 text-blue-600" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                            variant={selectedAction === 'status' ? 'default' : 'outline'}
                            onClick={() => setSelectedAction('status')}
                            className="flex items-center gap-2"
                        >
                            <AlertCircle className="h-4 w-4" />
                            Update Status
                        </Button>
                        <Button
                            variant={selectedAction === 'email' ? 'default' : 'outline'}
                            onClick={() => setSelectedAction('email')}
                            className="flex items-center gap-2"
                        >
                            <Mail className="h-4 w-4" />
                            Send Email
                        </Button>
                        <Button
                            variant={selectedAction === 'schedule' ? 'default' : 'outline'}
                            onClick={() => setSelectedAction('schedule')}
                            className="flex items-center gap-2"
                        >
                            <Calendar className="h-4 w-4" />
                            Schedule
                        </Button>
                        <Button
                            variant={selectedAction === 'notes' ? 'default' : 'outline'}
                            onClick={() => setSelectedAction('notes')}
                            className="flex items-center gap-2"
                        >
                            <FileText className="h-4 w-4" />
                            Notes & Tags
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic Content Based on Selected Action */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Action Panel */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>
                            {selectedAction === 'status' && 'Application Status Management'}
                            {selectedAction === 'email' && 'Send Email to Candidate'}
                            {selectedAction === 'schedule' && 'Schedule Interview'}
                            {selectedAction === 'notes' && 'Notes & Tags Management'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {selectedAction === 'status' && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="status">Application Status</Label>
                                    <select
                                        id="status"
                                        value={applicationStatus}
                                        onChange={(e) => setApplicationStatus(e.target.value)}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="pending">Pending Review</option>
                                        <option value="reviewed">Under Review</option>
                                        <option value="accepted">Accepted</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="on-hold">On Hold</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="rating">Candidate Rating</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-6 w-6 cursor-pointer ${
                                                    star <= candidateRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                                }`}
                                                onClick={() => setCandidateRating(star)}
                                            />
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">({candidateRating}/5)</span>
                                    </div>
                                </div>

                                <Button 
                                    onClick={() => handleStatusUpdate(applicationStatus)}
                                    className="w-full"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Update Status
                                </Button>
                            </div>
                        )}

                        {selectedAction === 'email' && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="email-to">To</Label>
                                    <Input
                                        id="email-to"
                                        value={applicationDetails?.candidate_email || 'candidate@email.com'}
                                        disabled
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email-subject">Subject</Label>
                                    <Input
                                        id="email-subject"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Enter email subject"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email-body">Message</Label>
                                    <Textarea
                                        id="email-body"
                                        value={emailBody}
                                        onChange={(e) => setEmailBody(e.target.value)}
                                        placeholder="Enter email message"
                                        rows={8}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={handleSendEmail} className="flex-1">
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Email
                                    </Button>
                                    <Button variant="outline" onClick={() => setEmailBody('')}>
                                        Clear
                                    </Button>
                                </div>

                                {/* Email Templates */}
                                <div className="border-t pt-4">
                                    <Label className="text-sm font-medium">Quick Templates</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEmailSubject('Interview Invitation');
                                                setEmailBody('Dear candidate,\n\nWe are pleased to invite you for an interview...');
                                            }}
                                        >
                                            Interview Invite
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEmailSubject('Application Status Update');
                                                setEmailBody('Dear candidate,\n\nThank you for your application. We have reviewed...');
                                            }}
                                        >
                                            Status Update
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedAction === 'schedule' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="interview-date">Date</Label>
                                        <Input
                                            id="interview-date"
                                            type="date"
                                            value={interviewSchedule.date}
                                            onChange={(e) => setInterviewSchedule({...interviewSchedule, date: e.target.value})}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="interview-time">Time</Label>
                                        <Input
                                            id="interview-time"
                                            type="time"
                                            value={interviewSchedule.time}
                                            onChange={(e) => setInterviewSchedule({...interviewSchedule, time: e.target.value})}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="interview-type">Interview Type</Label>
                                        <select
                                            id="interview-type"
                                            value={interviewSchedule.type}
                                            onChange={(e) => setInterviewSchedule({...interviewSchedule, type: e.target.value})}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="video">Video Interview</option>
                                            <option value="phone">Phone Interview</option>
                                            <option value="in-person">In-Person</option>
                                            <option value="technical">Technical Round</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="interview-duration">Duration (minutes)</Label>
                                        <select
                                            id="interview-duration"
                                            value={interviewSchedule.duration}
                                            onChange={(e) => setInterviewSchedule({...interviewSchedule, duration: e.target.value})}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="90">1.5 hours</option>
                                            <option value="120">2 hours</option>
                                        </select>
                                    </div>
                                </div>

                                <Button onClick={handleScheduleInterview} className="w-full">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule Interview
                                </Button>
                            </div>
                        )}

                        {selectedAction === 'notes' && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="recruiter-notes">Recruiter Notes</Label>
                                    <Textarea
                                        id="recruiter-notes"
                                        value={recruiterNotes}
                                        onChange={(e) => setRecruiterNotes(e.target.value)}
                                        placeholder="Add your notes about this candidate..."
                                        rows={6}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Tags</Label>
                                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                                        {tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="cursor-pointer"
                                                onClick={() => removeTag(tag)}
                                            >
                                                {tag} ×
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add new tag"
                                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                        />
                                        <Button onClick={addTag} size="sm">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <Button onClick={handleSaveNotes} className="w-full">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Notes & Tags
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Action History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-6 w-6 text-gray-600" />
                            Action History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {actionHistory.map((action, index) => (
                                <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{action.action}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{action.details}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">{formatTimestamp(action.timestamp)}</p>
                                            <p className="text-xs text-gray-500">by {action.user}</p>
                                        </div>
                                    </div>
                                    {index < actionHistory.length - 1 && <Separator className="mt-4" />}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
