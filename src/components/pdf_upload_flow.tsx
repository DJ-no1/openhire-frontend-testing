"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PdfUploader } from "@/components/pdf_uploader";

export const PdfUploadFlow: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [extractedText, setExtractedText] = useState<string>("");
    const [error, setError] = useState<string>("");

    const handleUpload = async (file: File) => {
        setLoading(true);
        setError("");
        setExtractedText("");
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/extract-pdf", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (res.ok) {
                setExtractedText(data.text);
                setOpen(false);
            } else {
                setError(data.error || "Failed to extract PDF");
            }
        } catch (err) {
            setError("Error uploading PDF");
        }
        setLoading(false);
    };

    return (
        <div className="w-full flex flex-col items-center justify-center">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="default" size="lg" onClick={() => setOpen(true)}>
                        Upload PDF
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload PDF</DialogTitle>
                    </DialogHeader>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-8">
                            <span className="text-muted-foreground">Extracting PDF...</span>
                        </div>
                    ) : (
                        <PdfUploader onUpload={handleUpload} />
                    )}
                </DialogContent>
            </Dialog>
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            {extractedText && (
                <div className="mt-6 w-full max-w-2xl bg-muted p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
                    <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                </div>
            )}
        </div>
    );
};
