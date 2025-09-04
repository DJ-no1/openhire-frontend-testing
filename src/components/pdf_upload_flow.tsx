"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PdfUploader } from "@/components/pdf_uploader";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api-config";

export const PdfUploadFlow: React.FC = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [extractedText, setExtractedText] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [reviewResult, setReviewResult] = useState<any>(null);

    const handleUpload = async (file: File) => {
        setLoading(true);
        setError("");
        setExtractedText("");
        setReviewResult(null);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/extract-pdf", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.text) {
                setExtractedText(data.text);
                const reviewRes = await fetch(getApiUrl("/review-resume"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ resume: data.text }),
                });
                let reviewData;
                try {
                    reviewData = await reviewRes.json();
                } catch (jsonErr) {
                    reviewData = { error: "Failed to parse backend response as JSON", raw: await reviewRes.text() };
                }
                if (reviewRes.ok) {
                    setReviewResult(reviewData);
                    // Encode review data as base64 to avoid special character issues
                    const reviewBase64 = btoa(encodeURIComponent(JSON.stringify(reviewData)));
                    router.push(`/resume-review?data=${reviewBase64}`);
                } else {
                    setError(reviewData.error || `Failed to review resume (status ${reviewRes.status})`);
                }
            } else {
                setError(data.error || "Failed to extract PDF");
            }
        } catch (err) {
            setError("Error uploading or reviewing PDF");
        }
        setLoading(false);
    };

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <div className="max-w-md w-full">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Upload PDF</h2>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-8">
                        <span className="text-muted-foreground">Extracting PDF...</span>
                    </div>
                ) : (
                    <PdfUploader onUpload={handleUpload} />
                )}
            </div>
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            {extractedText && (
                <div className="mt-6 w-full max-w-2xl bg-muted p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
                    <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                </div>
            )}
            {reviewResult && (
                <div className="mt-6 w-full max-w-2xl bg-muted p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Resume Review Result:</h2>
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(reviewResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};
