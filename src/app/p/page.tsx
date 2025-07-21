"use client";
import { PdfUploadFlow } from "@/components/pdf_upload_flow";

export default function PdfUploadPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-6">PDF Uploader</h1>
            <PdfUploadFlow />
        </div>
    );
}
