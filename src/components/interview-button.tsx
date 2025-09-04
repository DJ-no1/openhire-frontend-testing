"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Brain, Eye, Play, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from '@/lib/supabaseClient';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InterviewButtonState {
    text: string;
    color: string;
    background: string;
    enabled: boolean;
    redirect?: string | null;
    tooltip?: string;
    icon?: 'brain' | 'eye' | 'play' | 'alert';
}

interface InterviewButtonData {
    application_id: string;
    resume_threshold: string | null;
    resume_score: number | null;
    interview_exists: boolean;
    interview_score: number | null;
    interview_feedback: string | null;
    interview_status: string | null;
}

interface InterviewButtonProps {
    applicationId: string;
    className?: string;
}

export function InterviewButton({ applicationId, className = "" }: InterviewButtonProps) {
    const router = useRouter();
    const [buttonState, setButtonState] = useState<InterviewButtonState>({
        text: "Loading...",
        color: "gray",
        background: "#6B7280",
        enabled: false
    });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchInterviewData();
    }, [applicationId]);

    const fetchInterviewData = async () => {
        setLoading(true);
        try {
            // First get the application with basic job details
            const { data: appData, error: appError } = await supabase
                .from('applications')
                .select(`
                    id,
                    job_id,
                    resume_url,
                    jobs!inner (
                        id,
                        description
                    ),
                    interviews (
                        id,
                        interview_artifacts (
                            overall_score,
                            overall_feedback,
                            status
                        )
                    )
                `)
                .eq('id', applicationId)
                .single();

            if (appError) {
                console.error('Error fetching application data:', appError);
                setButtonState({
                    text: "Error Loading",
                    color: "white",
                    background: "#6B7280",
                    enabled: false,
                    tooltip: "Unable to load application data"
                });
                return;
            }

            if (!appData) {
                setButtonState({
                    text: "Application Not Found",
                    color: "white",
                    background: "#EF4444",
                    enabled: false
                });
                return;
            }

            // Fetch resume data separately using the resume_url (which is the user_resume.id)
            let resumeScore = null;
            if (appData.resume_url) {
                const { data: resumeData, error: resumeError } = await supabase
                    .from('user_resume')
                    .select('score')
                    .eq('id', appData.resume_url)
                    .single();

                if (!resumeError && resumeData) {
                    resumeScore = resumeData.score;
                }
            }

            // Extract data
            const job = Array.isArray(appData.jobs) ? appData.jobs[0] : appData.jobs;
            const resumeThreshold = job?.description?.resume_threshold || null;
            const interviewExists = appData.interviews && appData.interviews.length > 0;
            const interviewArtifact = interviewExists ? appData.interviews[0]?.interview_artifacts?.[0] : null;

            const interviewData: InterviewButtonData = {
                application_id: appData.id,
                resume_threshold: resumeThreshold,
                resume_score: resumeScore,
                interview_exists: interviewExists,
                interview_score: interviewArtifact?.overall_score || null,
                interview_feedback: interviewArtifact?.overall_feedback || null,
                interview_status: interviewArtifact?.status || null
            };

            const newButtonState = determineButtonState(interviewData);
            setButtonState(newButtonState);

        } catch (error) {
            console.error('Error in fetchInterviewData:', error);
            setButtonState({
                text: "Error Loading",
                color: "white",
                background: "#6B7280",
                enabled: false,
                tooltip: "Database connection error"
            });
        } finally {
            setLoading(false);
        }
    };

    const determineButtonState = (data: InterviewButtonData): InterviewButtonState => {
        // Handle missing resume
        if (data.resume_score === null) {
            return {
                text: "No Resume Found",
                color: "white",
                background: "#F59E0B",
                enabled: false,
                tooltip: "Resume is required to start interview"
            };
        }

        // Handle case where no threshold is set (proceed to interview)
        if (data.resume_threshold === null || data.resume_threshold === undefined) {
            if (data.interview_exists) {
                if (data.interview_status === 'completed') {
                    return {
                        text: "View Results",
                        color: "white",
                        background: "#10B981",
                        enabled: true,
                        redirect: `/dashboard/application/${data.application_id}/interview-result`,
                        icon: 'eye'
                    };
                } else {
                    return {
                        text: "Resume Interview",
                        color: "white",
                        background: "#3B82F6",
                        enabled: true,
                        redirect: `/dashboard/application/${data.application_id}/interview`,
                        icon: 'play'
                    };
                }
            } else {
                return {
                    text: "Start Interview",
                    color: "white",
                    background: "#3B82F6",
                    enabled: true,
                    redirect: `/dashboard/application/${data.application_id}/permission`,
                    icon: 'brain'
                };
            }
        }

        const thresholdValue = parseFloat(data.resume_threshold);
        
        // Handle invalid threshold
        if (isNaN(thresholdValue)) {
            return {
                text: "Invalid Threshold",
                color: "white",
                background: "#F59E0B",
                enabled: false,
                tooltip: "Invalid resume threshold configuration"
            };
        }

        // Check if resume score meets threshold
        if (data.resume_score < thresholdValue) {
            return {
                text: "Not Allowed to Interview",
                color: "white",
                background: "#EF4444",
                enabled: false,
                tooltip: `Resume score (${data.resume_score}) below threshold (${thresholdValue})`,
                icon: 'alert'
            };
        }

        // Resume score meets threshold
        if (data.interview_exists) {
            if (data.interview_status === 'completed') {
                return {
                    text: "View Results",
                    color: "white",
                    background: "#10B981",
                    enabled: true,
                    redirect: `/dashboard/application/${data.application_id}/interview-result`,
                    icon: 'eye'
                };
            } else {
                return {
                    text: "Resume Interview",
                    color: "white",
                    background: "#3B82F6",
                    enabled: true,
                    redirect: `/dashboard/application/${data.application_id}/interview`,
                    icon: 'play'
                };
            }
        } else {
            return {
                text: "Start Interview",
                color: "white",
                background: "#3B82F6",
                enabled: true,
                redirect: `/dashboard/application/${data.application_id}/permission`,
                icon: 'brain'
            };
        }
    };

    const handleClick = async () => {
        if (!buttonState.enabled || !buttonState.redirect) return;
        
        setProcessing(true);
        try {
            // Add any pre-navigation logic here if needed
            router.push(buttonState.redirect);
        } catch (error) {
            toast.error('Navigation error occurred');
        } finally {
            setProcessing(false);
        }
    };

    const getIcon = () => {
        if (processing || loading) {
            return <Loader2 className="h-4 w-4 mr-2 animate-spin" />;
        }
        
        switch (buttonState.icon) {
            case 'brain':
                return <Brain className="h-4 w-4 mr-2" />;
            case 'eye':
                return <Eye className="h-4 w-4 mr-2" />;
            case 'play':
                return <Play className="h-4 w-4 mr-2" />;
            case 'alert':
                return <AlertCircle className="h-4 w-4 mr-2" />;
            default:
                return null;
        }
    };

    const baseClasses = "px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200";
    const hoverClasses = buttonState.enabled ? "hover:opacity-90 hover:scale-105 cursor-pointer" : "cursor-not-allowed";
    const disabledClasses = buttonState.enabled ? "" : "opacity-50";
    const focusClasses = "focus:outline-none focus:ring-2 focus:ring-offset-2";

    const buttonElement = (
        <Button
            onClick={handleClick}
            disabled={!buttonState.enabled || processing || loading}
            className={`${baseClasses} ${hoverClasses} ${disabledClasses} ${focusClasses} ${className}`}
            style={{ 
                backgroundColor: buttonState.background,
                color: buttonState.color,
                border: 'none'
            }}
        >
            {getIcon()}
            {processing ? 'Processing...' : buttonState.text}
        </Button>
    );

    if (buttonState.tooltip) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        {buttonElement}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{buttonState.tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return buttonElement;
}
