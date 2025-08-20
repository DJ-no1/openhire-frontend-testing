"use client";

import React, { useState, useEffect } from "react";
import { supabase } from '@/lib/supabaseClient';
import {
    UniversalScoresChart,
    IndustryCompetencyChart,
    ConversationEngagementChart
} from '@/components/interview-charts';

export default function TestInterviewResult() {
    const [artifact, setArtifact] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHighScoreArtifact();
    }, []);

    const fetchHighScoreArtifact = async () => {
        try {
            console.log('🔍 Fetching high-scoring artifact...');

            // Use the high-scoring artifact directly
            const highScoreArtifactId = 'a195c21b-2e06-4a41-b5d2-602f37492ee7'; // 89.2 average score

            const { data: fetchedArtifact, error: fetchError } = await supabase
                .from('interview_artifacts')
                .select('*')
                .eq('id', highScoreArtifactId)
                .single();

            if (fetchError) {
                console.error('❌ Error fetching artifact:', fetchError);
                setError(fetchError.message);
                return;
            }

            console.log('📊 Raw artifact:', fetchedArtifact);

            // Map detailed_score to ai_assessment structure
            if (fetchedArtifact.detailed_score) {
                fetchedArtifact.ai_assessment = {
                    universal_scores: fetchedArtifact.detailed_score.universal_scores || {
                        teamwork_score: 0,
                        adaptability_score: 0,
                        cultural_fit_score: 0,
                        communication_score: 0,
                        problem_solving_score: 0,
                        leadership_potential_score: 0
                    },
                    industry_competency_scores: fetchedArtifact.detailed_score.industry_competency_scores || {},
                    overall_score: fetchedArtifact.detailed_score.overall_score || fetchedArtifact.overall_score || 0,
                    overall_recommendation: fetchedArtifact.detailed_score.final_recommendation || 'no_data',
                    industry_type: fetchedArtifact.detailed_score.industry_type || 'Unknown'
                };
                console.log('✅ Mapped ai_assessment:', fetchedArtifact.ai_assessment);
            }

            // Map conversation to conversation_log
            if (fetchedArtifact.conversation) {
                fetchedArtifact.conversation_log = fetchedArtifact.conversation;
            }

            setArtifact(fetchedArtifact);

        } catch (err) {
            console.error('❌ Error:', err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

    if (error) {
        return <div className="p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Test Interview Result</h1>

            {artifact && (
                <>
                    <div className="bg-gray-100 p-4 rounded">
                        <h2 className="font-semibold mb-2">Artifact Info:</h2>
                        <p>ID: {artifact.id}</p>
                        <p>Overall Score: {artifact.overall_score}</p>
                        <p>Status: {artifact.status}</p>
                        <p>Timestamp: {artifact.timestamp}</p>
                    </div>

                    {artifact.ai_assessment && (
                        <>
                            <div className="bg-blue-50 p-4 rounded">
                                <h2 className="font-semibold mb-2">AI Assessment Data:</h2>
                                <pre className="text-sm">{JSON.stringify(artifact.ai_assessment, null, 2)}</pre>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-lg border">
                                    <h3 className="text-lg font-semibold mb-4">Universal Scores Chart</h3>
                                    <UniversalScoresChart data={artifact.ai_assessment} />
                                </div>

                                <div className="bg-white p-6 rounded-lg border">
                                    <h3 className="text-lg font-semibold mb-4">Industry Competency Chart</h3>
                                    <IndustryCompetencyChart data={artifact.ai_assessment} />
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
