"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ResumeReviewPage() {
    const { reviewId } = useParams();
    const [review, setReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        async function fetchReview() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`http://127.0.0.1:8000/review-resume/${reviewId}`);
                if (!res.ok) throw new Error("Failed to fetch review");
                const data = await res.json();
                setReview(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
        if (reviewId) fetchReview();
    }, [reviewId]);

    if (loading) return <div className="p-8">Loading review...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!review) return <div className="p-8">No review found.</div>;

    // Example visualization components
    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Resume Compatibility Review</h1>
            <div className="mb-4 p-4 bg-muted rounded shadow">
                <h2 className="text-xl font-semibold mb-2">Candidate Compatibility</h2>
                {/* Replace below with your own visualization logic */}
                <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(review, null, 2)}</pre>
            </div>
            {/* Add more components here to visualize skills, match %, etc. */}
        </div>
    );
}
