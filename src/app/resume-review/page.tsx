"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResumeReviewPage() {
    const searchParams = useSearchParams();
    const [review, setReview] = useState<any>(null);

    useEffect(() => {
        const dataParam = searchParams.get("data");
        if (dataParam) {
            try {
                const decoded = decodeURIComponent(atob(dataParam));
                setReview(JSON.parse(decoded));
            } catch {
                setReview(null);
            }
        }
    }, [searchParams]);

    if (!review) return <div className="p-8">No review found. Please upload your resume first.</div>;

    // Extract fields
    const {
        resume,
        resumeReview,
        pros,
        cons,
        score
    } = review;

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-primary">Resume Compatibility Review</h1>
            <div className="mb-6 p-4 bg-muted rounded shadow">
                <h2 className="text-xl font-semibold mb-2 text-green-700">Candidate Compatibility Score</h2>
                <div className="flex items-center gap-4 mb-2">
                    <span className="text-4xl font-bold text-green-700">{score?.score ?? 0}</span>
                    <span className="text-muted-foreground">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-4">
                    <div
                        className="bg-green-500 h-4 rounded"
                        style={{ width: `${score?.score ?? 0}%` }}
                    />
                </div>
            </div>
            <div className="mb-6 p-4 bg-white rounded shadow">
                <h2 className="text-lg font-semibold mb-2 text-blue-700">Review Summary</h2>
                <p className="text-base mb-2 text-gray-800">{resumeReview}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-green-50 rounded shadow">
                    <h3 className="text-md font-semibold mb-2 text-green-700">Pros</h3>
                    <ul className="list-disc pl-4 text-green-900">
                        {pros?.split(". ").map((item: string, idx: number) => item && <li key={idx}>{item.trim()}</li>)}
                    </ul>
                </div>
                <div className="p-4 bg-red-50 rounded shadow">
                    <h3 className="text-md font-semibold mb-2 text-red-700">Cons</h3>
                    <ul className="list-disc pl-4 text-red-900">
                        {cons?.split(". ").map((item: string, idx: number) => item && <li key={idx}>{item.trim()}</li>)}
                    </ul>
                </div>
            </div>
            <div className="mb-6 p-4 bg-muted rounded shadow">
                <h2 className="text-lg font-semibold mb-2 text-purple-700">Resume Text</h2>
                <pre className="whitespace-pre-wrap text-sm text-gray-900">{resume}</pre>
            </div>
        </div>
    );
}
