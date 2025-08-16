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
    const [interviewId, setInterviewId] = useState<string | null>(null);
    const [interviewArtifactId, setInterviewArtifactId] = useState<string | null>(null);
    const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>("disconnected");
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize interview and interview_artifacts when component mounts
    useEffect(() => {
        initializeInterview();
    }, []);

    // Simplified initialization - only create initial records, let backend handle the rest
    const initializeInterview = async () => {
        console.log('🔄 Starting interview initialization...');
        console.log('📋 Application ID:', APPLICATION_ID);

        try {
            // Test Supabase connection
            console.log('🧪 Testing Supabase connection...');
            const connectionTestPromise = supabase
                .from('interviews')
                .select('count', { count: 'exact', head: true });

            const timeoutMs = 10000;
            let timeoutId: NodeJS.Timeout | undefined;
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), timeoutMs);
            });

            let testResult;
            try {
                testResult = await Promise.race([connectionTestPromise, timeoutPromise]);
                if (timeoutId) clearTimeout(timeoutId);
            } catch (error) {
                if (timeoutId) clearTimeout(timeoutId);
                throw error;
            }

            const { data: testData, error: testError } = testResult as any;

            if (testError) {
                console.error('❌ Supabase connection test failed:', testError);
                alert(`Database connection failed: ${testError.message}\n\nDetails: ${testError.details || 'No additional details'}`);
                return;
            }

            console.log('✅ Supabase connection successful');

            // Check if the application exists
            console.log('🔍 Checking if application exists...');
            const { data: appData, error: appError } = await supabase
                .from('applications')
                .select('id')
                .eq('id', APPLICATION_ID)
                .single();

            if (appError || !appData) {
                console.error('❌ Application not found:', appError);
                alert(`Application ${APPLICATION_ID} not found in database.\n\nPlease run the test_data.sql script in your Supabase SQL Editor first.`);
                return;
            }

            console.log('✅ Application found');

            // Create minimal interview record - backend will handle the rest
            console.log('📝 Creating minimal interview record...');
            const { data: interviewData, error: interviewError } = await supabase
                .from('interviews')
                .insert({
                    application_id: APPLICATION_ID,
                    start_time: new Date().toISOString(),
                    result: 'in_progress'
                })
                .select()
                .single();

            if (interviewError) {
                console.error('❌ Error creating interview:', interviewError);
                alert(`Failed to create interview: ${interviewError.message}`);
                return;
            }

            console.log('✅ Interview created with ID:', interviewData.id);
            setInterviewId(interviewData.id);

            // Don't create interview_artifacts here - let backend handle it
            // We'll get the artifact ID later when needed
            setIsInitialized(true);
            console.log('🎉 Interview initialization completed! Backend will handle data persistence.');

        } catch (error) {
            console.error('💥 Critical error initializing interview:', error);
            alert(`Critical error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Handle status changes from AIInterview component
    const handleStatusChange = async (status: InterviewStatus) => {
        setInterviewStatus(status);
    };

    // Function to save images to interview_artifacts at the end of interview
    const saveImagesToInterviewArtifacts = async (interviewId: string, imageUrls: string[]) => {
        console.log('🚀 saveImagesToInterviewArtifacts called with:', {
            interviewId,
            imageUrlsCount: imageUrls.length,
            imageUrls: imageUrls
        });

        if (imageUrls.length === 0) {
            console.log('ℹ️ No images to save - returning early');
            return;
        }

        try {
            const imageUrlString = imageUrls.join(',');

            console.log('🔄 Directly updating interview_artifacts record by interview_id...');
            
            // Direct update without reading - just update the record with matching interview_id
            const { data: updateData, error: updateError } = await supabase
                .from('interview_artifacts')
                .update({ image_url: imageUrlString })
                .eq('interview_id', interviewId)
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
                console.log('✅ SUCCESS: Image URLs updated in existing interview_artifacts record');
                console.log('📦 Updated record:', updateData[0]);
                console.log('🔗 Image URLs saved:', updateData[0]?.image_url);
            } else {
                console.log('⚠️ Update succeeded but no records were affected - record may not exist');
                console.log('📝 This means the backend has not created the interview_artifacts record yet');
            }



                console.log('📊 Update attempt result:', {
                    data: updateData,
                    error: updateError,
                    recordsAffected: updateData?.length || 0
                });

                if (!updateError && updateData && updateData.length > 0) {
                    console.log('🎉 SUCCESS: Found and updated existing record!');
                    console.log('✅ Record ID updated:', updateData[0]?.id);
                    console.log('🔗 Image URLs saved to existing record');
                    recordUpdated = true;
                    break;
                } else if (!updateError && (!updateData || updateData.length === 0)) {
                    console.log('⚠️ Update succeeded but no records affected - record may not exist yet');
                    if (attempts < maxAttempts) {
                        console.log('⏳ Waiting 2 more seconds for backend...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                } else if (updateError) {
                    console.error('❌ Update failed:', updateError);
                    break;
                }
            }

            // If no record was updated after all attempts, create one as fallback
            if (!recordUpdated) {
                console.log('� No existing record found after retries, creating new record...');
                const { data: insertData, error: insertError } = await supabase
                    .from('interview_artifacts')
                    .insert({
                        interview_id: interviewId,
                        image_url: newUrls,
                        timestamp: new Date().toISOString(),
                        status: 'completed'
                    })
                    .select();

                console.log('📊 Insert result:', { data: insertData, error: insertError });

                if (!insertError && insertData) {
                    console.log('✅ Created new record with ID:', insertData[0]?.id);
                } else if (insertError) {
                    console.error('❌ Failed to create fallback record:', insertError);
                }
            }

            // Try direct update using interview_id instead of record id
            console.log('🔄 Executing direct update by interview_id...');
            const { data: updateData, error: updateError } = await supabase
                .from('interview_artifacts')
                .update({ image_url: newUrls })
                .eq('interview_id', interviewId)
                .select();

            console.log('📊 Direct update result:', {
                data: updateData,
                error: updateError
            });

            if (updateError) {
                console.error('❌ Error updating interview_artifacts with images:', updateError);
                console.error('❌ Update error details:', {
                    message: updateError.message,
                    details: updateError.details,
                    hint: updateError.hint,
                    code: updateError.code
                });

                // If RLS is blocking, try an upsert instead
                if (updateError.code === '42501' || updateError.message?.includes('policy')) {
                    console.log('� RLS blocking update, trying upsert...');
                    const { data: upsertData, error: upsertError } = await supabase
                        .from('interview_artifacts')
                        .upsert({
                            interview_id: interviewId,
                            image_url: newUrls,
                            timestamp: new Date().toISOString(),
                            status: 'completed'
                        })
                        .select();

                    console.log('📊 Upsert result:', { data: upsertData, error: upsertError });
                }
            } else {
                console.log(`🎉 SUCCESS: Direct update completed for ${imageUrls.length} images!`);
                console.log('📦 Update result data:', updateData);

                if (updateData && updateData.length > 0) {
                    console.log('✅ Confirmed: Record was updated successfully');
                    console.log('🔗 Image URLs saved:', updateData[0]?.image_url);
                } else {
                    console.log('⚠️ Update succeeded but no data returned (might be RLS limitation)');
                }
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

        // Detailed logging for image saving
        console.log('📷 Image saving process starting:', {
            interviewId: interviewId,
            capturedImagesCount: capturedImages.length,
            capturedImages: capturedImages
        });

        // Mark interview as completed first
        console.log('🏁 Setting interview status to completed');
        setInterviewStatus("completed");

        // Wait 5 seconds for backend to create interview_artifacts record
        if (interviewId && capturedImages.length > 0) {
            console.log('⏳ Waiting 5 seconds for backend to create interview_artifacts record...');
            setTimeout(async () => {
                console.log('🔄 5 seconds elapsed, now attempting to save images...');
                await saveImagesToInterviewArtifacts(interviewId, capturedImages);
            }, 5000);
        } else {
            if (!interviewId) {
                console.warn('⚠️ Cannot save images - no interview ID available');
            }
            if (capturedImages.length === 0) {
                console.warn('⚠️ Cannot save images - no images captured');
            }
        }
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

    // Debug function to check interview_artifacts table
    const debugInterviewArtifacts = async () => {
        if (!interviewId) {
            console.log('❌ No interview ID to debug');
            return;
        }

        console.log('🔍 DEBUG: Checking interview_artifacts for interview_id:', interviewId);

        try {
            const { data, error } = await supabase
                .from('interview_artifacts')
                .select('*')
                .eq('interview_id', interviewId);

            console.log('🔍 DEBUG: interview_artifacts query result:', {
                data,
                error,
                count: data?.length || 0
            });
        } catch (error) {
            console.error('🔍 DEBUG: Error querying interview_artifacts:', error);
        }
    };

    if (!isInitialized || !interviewId) {
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
                                setInterviewId(null);
                                initializeInterview();
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
                    interviewId={interviewId}
                    isActive={interviewStatus === "connected"}
                    onImageCaptured={handleImageCaptured}
                />

                {/* Capture Statistics */}
                <div className="mt-4 text-sm text-gray-600">
                    <p>Status: <span className="font-medium">{interviewStatus}</span></p>
                    <p>Images Captured: <span className="font-medium">{capturedImages.length}</span></p>
                    <p>Interview ID: <span className="font-mono text-xs">{interviewId}</span></p>

                    {/* Debug button */}
                    <button
                        onClick={debugInterviewArtifacts}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 mr-2"
                    >
                        Debug Interview Artifacts
                    </button>

                    {/* Manual save button for testing */}
                    <button
                        onClick={() => {
                            if (interviewId) {
                                console.log('🔧 Manual trigger: saving images with current capturedImages:', capturedImages);
                                saveImagesToInterviewArtifacts(interviewId, capturedImages);
                            }
                        }}
                        className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 mr-2"
                    >
                        Manual Save Images
                    </button>

                    {/* Test Direct Update */}
                    <button
                        onClick={async () => {
                            if (interviewId) {
                                console.log('🧪 Test: Direct update by interview_id...');
                                try {
                                    const testUrls = 'https://example.com/test1.jpg,https://example.com/test2.jpg';
                                    const { data, error } = await supabase
                                        .from('interview_artifacts')
                                        .update({ image_url: testUrls })
                                        .eq('interview_id', interviewId)
                                        .select();
                                    console.log('🧪 Direct update test result:', { data, error, affected: data?.length });
                                } catch (err) {
                                    console.error('🧪 Direct update test error:', err);
                                }
                            }
                        }}
                        className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 mr-2"
                    >
                        Test Direct Update
                    </button>

                    {/* Clean Duplicates */}
                    <button
                        onClick={async () => {
                            if (interviewId) {
                                console.log('🧹 Cleaning duplicate records...');
                                try {
                                    // First get all records for this interview_id
                                    const { data: allRecords, error: fetchError } = await supabase
                                        .from('interview_artifacts')
                                        .select('*')
                                        .eq('interview_id', interviewId);

                                    console.log('📊 Found records:', allRecords);

                                    if (allRecords && allRecords.length > 1) {
                                        // Keep the first record, delete the rest
                                        const toDelete = allRecords.slice(1);
                                        for (const record of toDelete) {
                                            const { error: deleteError } = await supabase
                                                .from('interview_artifacts')
                                                .delete()
                                                .eq('id', record.id);
                                            console.log(`🗑️ Deleted duplicate record ${record.id}:`, deleteError);
                                        }
                                    }
                                } catch (err) {
                                    console.error('🧹 Clean duplicates error:', err);
                                }
                            }
                        }}
                        className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                        Clean Duplicates
                    </button>
                </div>

                {/* Recent captures preview */}
                {capturedImages.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Captures</h3>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {capturedImages.slice(-3).map((url, index) => (
                                <div key={index} className="text-xs text-gray-500 truncate">
                                    Capture {capturedImages.length - 2 + index}
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
                    interviewId={interviewId}
                    onStatusChange={handleStatusChange}
                    onInterviewComplete={handleInterviewComplete}
                />
            </div>
        </div>
    );
}
