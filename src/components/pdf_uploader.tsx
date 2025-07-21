"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";

interface PdfUploaderProps {
    onUpload?: (file: File) => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onUpload }) => {
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setFileName(file.name);
                onUpload?.(file);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type === "application/pdf") {
                setFileName(file.name);
                onUpload?.(file);
            }
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Upload PDF</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${dragActive ? "border-primary bg-muted" : "border-muted"}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <UploadCloud className="w-10 h-10 mb-2 text-muted-foreground" />
                    <span className="mb-2 text-sm">Drag & drop your PDF here, or click to select</span>
                    <Input
                        ref={inputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleChange}
                    />
                    {fileName && <span className="mt-2 text-xs text-primary">Selected: {fileName}</span>}
                </div>
                <Button className="mt-4 w-full" onClick={() => inputRef.current?.click()}>
                    Upload PDF
                </Button>
            </CardContent>
        </Card>
    );
};
