// page.tsx
"use client";

import React, { useState, useEffect } from "react";
import AIInterviewNew from "@/components/ai_interview2";
import ImageCapture from "@/components/image-capture";
import { supabase } from '@/lib/supabaseClient';

// Hard-coded application ID as requested (must be a valid UUID from applications table)
const APPLICATION_ID = "4cc1f02d-2c2f-441e-9a90-ccfda8be4ab4";

type InterviewStatus = "disconnected" | "connecting" | "connected" | "paused" | "completed";

interface FinalAssessment {
    overall_score: number;
    technical_score: number;
    final_recommendation: string;
    confidence_level: string;
    industry_type: string;
    universal_scores: {
        communication_score: number;
        problem_solving_score: number;
        leadership_potential_score: number;
        adaptability_score: number;
        teamwork_score: number;
        cultural_fit_score: number;
    };
    industry_competency_scores: Record<string, number>;
    feedback: {
        universal_feedback_for_candidate: string;
        areas_of_improvement_for_candidate: string[];
        industry_specific_feedback?: {
            technical_feedback_for_candidate: string;
            domain_strengths: string[];
            domain_improvement_areas: string[];
        };
    };
    interview_metrics: {
        duration: string;
        questions_answered: number;
        engagement_level: number;
        completion_status: string;
    };
}

export default function AIInterviewTestPage() {
    const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>("disconnected");
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(true); // Always initialized now

    // Handle status changes from AIInterview component
    const handleStatusChange = async (status: InterviewStatus) => {
        setInterviewStatus(status);
    };

    // SIMPLIFIED: Only extract artifact ID from applications table and update image URL
    const saveImagesToInterviewArtifacts = async (imageUrls: string[]) => {
        console.log('🚀 saveImagesToInterviewArtifacts called with:', {
            imageUrlsCount: imageUrls.length,
            imageUrls: imageUrls
        });

        if (imageUrls.length === 0) {
            console.log('ℹ️ No images to save - returning early');
            return;
        }

        try {
            const imageUrlString = imageUrls.join(',');

            // Step 1: Get the interview_artifact_id from applications table
            console.log('🔍 Getting interview_artifact_id from applications table...');
            const { data: applicationData, error: applicationError } = await supabase
                .from('applications')
                .select('interview_artifact_id')
                .eq('id', APPLICATION_ID)
                .single();

            if (applicationError) {
                console.error('❌ Error fetching application:', applicationError);
                return;
            }

            if (!applicationData?.interview_artifact_id) {
                console.log('⚠️ No interview_artifact_id found in applications table');
                return;
            }

            // Step 2: Parse comma-separated IDs and get the last one
            const artifactIds = applicationData.interview_artifact_id.split(',').map((id: string) => id.trim());
            const latestArtifactId = artifactIds[artifactIds.length - 1];

            console.log('📋 Interview artifact IDs:', artifactIds);
            console.log('🎯 Using latest artifact ID:', latestArtifactId);

            // Step 3: Update the image_url directly using the artifact ID
            console.log('🔄 Updating interview_artifacts record by artifact ID...');
            const { data: updateData, error: updateError } = await supabase
                .from('interview_artifacts')
                .update({ image_url: imageUrlString })
                .eq('id', latestArtifactId)
                .select();

            if (updateError) {
                console.error('❌ Error updating interview_artifacts:', updateError);
                console.error('❌ Update error details:', {
                    message: updateError.message,
                    details: updateError.details,
                    hint: updateError.hint,
                    code: updateError.code
                });
            } else if (updateData && updateData.length > 0) {
                console.log('✅ SUCCESS: Image URLs updated in interview_artifacts record');
                console.log('📦 Updated record:', updateData[0]);
                console.log('🔗 Image URLs saved:', updateData[0]?.image_url);
                console.log('🆔 Updated artifact ID:', latestArtifactId);
            } else {
                console.log('⚠️ Update succeeded but no records were affected - artifact ID may not exist:', latestArtifactId);
            }

        } catch (error) {
            console.error('❌ Unexpected error in saveImagesToInterviewArtifacts:', error);
            console.error('❌ Error stack:', (error as Error).stack);
        }
    };

    // Handle interview completion - save images to database
    const handleInterviewComplete = async (finalAssessment: FinalAssessment, conversation: any[]) => {
        console.log('🎉 Interview completed! Backend should handle data persistence.');
        console.log('📊 Final Assessment:', finalAssessment);
        console.log('💬 Conversation:', conversation.length, 'messages');

        // Mark interview as completed first
        console.log('🏁 Setting interview status to completed');
        setInterviewStatus("completed");

        // Always attempt to save images after delay, regardless of current count
        // Images might still be arriving from the capture component
        console.log('⏳ Waiting 5 seconds for backend to create interview_artifacts record...');

        setTimeout(async () => {
            // Get the latest captured images at the time of saving
            setCapturedImages(currentImages => {
                console.log('📷 Final image saving process starting:', {
                    capturedImagesCount: currentImages.length,
                    capturedImages: currentImages
                });

                if (currentImages.length > 0) {
                    console.log('🔄 5 seconds elapsed, now attempting to save images...');
                    // Call save function with the current images
                    saveImagesToInterviewArtifacts(currentImages);
                } else {
                    console.warn('⚠️ Cannot save images - no images captured after 5 second delay');
                }

                return currentImages; // Return unchanged state
            });
        }, 5000);
    };

    // Handle image capture
    const handleImageCaptured = (imageUrl: string) => {
        console.log('📸 Image captured:', imageUrl);
        setCapturedImages(prev => {
            const newImages = [...prev, imageUrl];
            console.log('📷 Updated captured images array:', newImages);
            return newImages;
        });
    };

    // Debug function to check applications table for interview_artifact_id
    const debugApplicationArtifactId = async () => {
        console.log('🔍 DEBUG: Checking applications table for interview_artifact_id...');

        try {
            const { data, error } = await supabase
                .from('applications')
                .select('id, interview_artifact_id')
                .eq('id', APPLICATION_ID)
                .single();

            console.log('🔍 DEBUG: applications query result:', {
                data,
                error,
                applicationId: APPLICATION_ID
            });

            if (data?.interview_artifact_id) {
                const artifactIds = data.interview_artifact_id.split(',').map((id: string) => id.trim());
                console.log('🔍 DEBUG: Parsed artifact IDs:', artifactIds);
                console.log('🔍 DEBUG: Latest artifact ID:', artifactIds[artifactIds.length - 1]);
            }
        } catch (error) {
            console.error('🔍 DEBUG: Error querying applications:', error);
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing interview session...</p>
                    <p className="text-sm text-gray-500 mt-2">Check the browser console for details</p>
                    <div className="mt-4">
                        <button
                            onClick={() => {
                                console.clear();
                                setIsInitialized(false);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Retry Initialization
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left side - Video Feed (2/3) */}
            <div className="flex-1 w-2/3 bg-white shadow-lg p-6 flex flex-col">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Interview Monitor</h2>

                <ImageCapture
                    interviewId={APPLICATION_ID} // Use application ID instead
                    isActive={interviewStatus === "connected"}
                    onImageCaptured={handleImageCaptured}
                />

                {/* Capture Statistics */}
                <div className="mt-4 text-sm text-gray-600">
                    <p>Status: <span className="font-medium">{interviewStatus}</span></p>
                    <p>Images Captured: <span className="font-medium">{capturedImages.length}</span></p>
                    <p>Application ID: <span className="font-mono text-xs">{APPLICATION_ID}</span></p>

                    {/* Debug Applications Artifact ID */}
                    <button
                        onClick={debugApplicationArtifactId}
                        className="mt-2 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 mr-2"
                    >
                        Debug App Artifact ID
                    </button>

                    {/* Manual save button for testing */}
                    <button
                        onClick={() => {
                            saveImagesToInterviewArtifacts(capturedImages);
                        }}
                        className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 mr-2"
                    >
                        Manual Save Images
                    </button>
                </div>

                {/* Recent captures preview */}
                {capturedImages.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Captures</h3>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {capturedImages.slice(-5).map((url, index) => (
                                <div key={index} className="text-xs text-gray-500 font-mono truncate">
                                    {url}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right side - AI Interview Chat (1/3) */}
            <div className="w-1/3 min-w-96">
                <AIInterviewNew
                    applicationId={APPLICATION_ID}
                    interviewId={APPLICATION_ID} // Use application ID
                    onStatusChange={handleStatusChange}
                    onInterviewComplete={handleInterviewComplete}
                />
            </div>
        </div>
    );
}
