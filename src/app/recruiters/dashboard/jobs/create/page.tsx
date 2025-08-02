"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateJobPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to jobs page since we now use the modal for job creation
        router.replace('/recruiters/jobs?create=true');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Redirecting to jobs page...</p>
        </div>
    );
}
