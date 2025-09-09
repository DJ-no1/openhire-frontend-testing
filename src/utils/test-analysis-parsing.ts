// Test script to verify analysis data parsing
export function testAnalysisParsing() {
    // Sample data structure based on what the user provided
    const sampleScoringDetails = {
        jd: "Software Engineer position description...",
        resume: "Candidate resume text...",
        analysis: {
            dimension_breakdown: {
                skill_match: {
                    score: 85,
                    weight: 0.25,
                    evidence: ["React experience", "Node.js skills"]
                },
                experience_fit: {
                    score: 78,
                    weight: 0.20,
                    evidence: ["3 years frontend development"]
                },
                impact_outcomes: {
                    score: 72,
                    weight: 0.15,
                    evidence: ["Improved app performance by 40%"]
                }
            },
            risk_flags: ["Limited backend experience"],
            hard_filter_failures: []
        },
        created_at: "2024-01-15T10:30:00Z"
    };

    // Test the extraction function
    function extractAnalysisData(scoringDetails: any) {
        console.log('🔍 Extracting analysis data from scoring_details:', scoringDetails);

        if (scoringDetails && typeof scoringDetails === 'object') {
            if (scoringDetails.analysis) {
                console.log('✅ Found analysis data in scoring_details.analysis');
                return scoringDetails.analysis;
            } else if (scoringDetails.dimension_breakdown) {
                console.log('✅ Found analysis data directly in scoring_details');
                return scoringDetails;
            }
        }

        console.log('❌ No valid analysis data found');
        return null;
    }

    const extractedAnalysis = extractAnalysisData(sampleScoringDetails);

    console.log('📊 Test Results:');
    console.log('Original scoring_details:', sampleScoringDetails);
    console.log('Extracted analysis:', extractedAnalysis);
    console.log('Dimension breakdown:', extractedAnalysis?.dimension_breakdown);
    console.log('Risk flags:', extractedAnalysis?.risk_flags);

    return {
        success: !!extractedAnalysis,
        analysis: extractedAnalysis
    };
}

// Run the test
if (typeof window !== 'undefined') {
    console.log('Running analysis parsing test...');
    testAnalysisParsing();
}
