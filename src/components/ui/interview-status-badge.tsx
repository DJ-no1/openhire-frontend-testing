import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export type InterviewStatus = 'eligible_for_interview' | 'interview_completed' | 'no_interview';

interface InterviewStatusBadgeProps {
    status: InterviewStatus;
    className?: string;
}

export function InterviewStatusBadge({ status, className = '' }: InterviewStatusBadgeProps) {
    const getStatusConfig = (status: InterviewStatus) => {
        switch (status) {
            case 'eligible_for_interview':
                return {
                    text: 'Ready for Interview',
                    icon: <Clock className="mr-1 h-3 w-3" />,
                    className: 'bg-blue-100 text-blue-800 border-blue-200'
                };
            case 'interview_completed':
                return {
                    text: 'Interview Completed',
                    icon: <CheckCircle className="mr-1 h-3 w-3" />,
                    className: 'bg-green-100 text-green-800 border-green-200'
                };
            case 'no_interview':
            default:
                return {
                    text: 'No Interview',
                    icon: <AlertCircle className="mr-1 h-3 w-3" />,
                    className: 'bg-gray-100 text-gray-800 border-gray-200'
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Badge
            variant="outline"
            className={`${config.className} ${className}`}
        >
            {config.icon}
            {config.text}
        </Badge>
    );
}
