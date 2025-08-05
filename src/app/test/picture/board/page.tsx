"use client";
import React, { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Load Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BoardInterviewPage = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    // Start camera on mount
    React.useEffect(() => {
        if (videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                });
        }
    }, []);

    const captureImage = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL("image/png");
                setImageUrl(dataUrl);
            }
        }
    };

    const uploadToSupabase = async () => {
        if (!imageUrl) return;
        setUploading(true);
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const fileName = `board-interview-${Date.now()}.png`;
        const { data, error } = await supabase.storage.from("pictures").upload(fileName, blob, {
            contentType: "image/png",
        });
        setUploading(false);
        if (error) {
            alert("Upload failed: " + error.message);
        } else {
            alert("Image uploaded!");
        }
    };

    return <>
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-4xl font-bold">Board Interview</h1>
            <p className="mt-4 text-lg">Prepare for your board interview with these tips and resources.</p>
            <div className="mt-8 flex flex-col items-center">
                <video ref={videoRef} autoPlay playsInline width={320} height={240} className="rounded border" />
                <canvas ref={canvasRef} style={{ display: "none" }} />
                <button onClick={captureImage} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Capture Photo</button>
                {imageUrl && (
                    <>
                        <img src={imageUrl} alt="Captured" className="mt-4 rounded border w-64" />
                        <button onClick={uploadToSupabase} disabled={uploading} className="mt-2 px-4 py-2 bg-green-600 text-white rounded">
                            {uploading ? "Uploading..." : "Upload to Supabase"}
                        </button>
                    </>
                )}
            </div>
        </div>
    </>
};

export default BoardInterviewPage;
