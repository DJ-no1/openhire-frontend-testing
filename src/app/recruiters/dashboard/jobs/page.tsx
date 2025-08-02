'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RecruiterDashboardJobsRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the main recruiter jobs page
        router.replace('/recruiters/jobs');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg text-muted-foreground">Redirecting to job management...</div>
        </div>
    );
}
