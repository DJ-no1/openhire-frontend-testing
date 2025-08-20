import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { getLatestInterviewArtifactId } from '@/lib/interviewUtils';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const candidateId = searchParams.get('candidate_id');

        if (!candidateId) {
            return NextResponse.json(
                { error: 'candidate_id is required' },
                { status: 400 }
            );
        }

        // Get applications for the candidate
        const applications = await DatabaseService.getApplicationsForCandidate(candidateId);

        // Add interview status to each application
        const applicationsWithInterviewStatus = applications.map(app => {
            // Check if interview_artifact_id exists in the raw app object
            const interviewArtifactId = (app as any).interview_artifact_id ?? null;
            const latestArtifactId = getLatestInterviewArtifactId(interviewArtifactId);

            const interviewStatus = !latestArtifactId ?
                'eligible_for_interview' :
                'interview_completed';

            return {
                ...app,
                interview_artifact_id: interviewArtifactId,
                interview_status: interviewStatus,
                latest_artifact_id: latestArtifactId
            };
        });

        return NextResponse.json({
            success: true,
            data: applicationsWithInterviewStatus,
            count: applicationsWithInterviewStatus.length
        });

    } catch (error) {
        console.error('Error fetching applications with interview status:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch applications',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
