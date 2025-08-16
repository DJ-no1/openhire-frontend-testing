"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing required Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for better error handling
type CameraState = "idle" | "initializing" | "ready" | "error";
type UploadState = "idle" | "uploading" | "success" | "error";

const BoardInterviewPage = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // State management
    const [imageUrl, setImageUrl] = useState("");
    const [cameraState, setCameraState] = useState<CameraState>("idle");
    const [uploadState, setUploadState] = useState<UploadState>("idle");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [user, setUser] = useState<any>(null);
    const [authChecked, setAuthChecked] = useState(false);

    // Add this test function inside your component
    const testDirectUpload = useCallback(async () => {
        try {
            console.log("🧪 Testing direct upload...");
            const testBlob = new Blob(['Hello World Test'], { type: 'text/plain' });
            const testFileName = `test-${Date.now()}.txt`;
            console.log("📤 Uploading test file:", testFileName);
            const result = await supabase.storage
                .from("pictures")
                .upload(testFileName, testBlob);
            console.log("🧪 Direct test result:", result);
            if (result.error) {
                console.error("❌ Direct test failed:", result.error);
            } else {
                console.log("✅ Direct test successful:", result.data);
            }
        } catch (err) {
            console.error("💥 Direct test crashed:", err);
        }
    }, []);

    // Add this useEffect to run the test when component mounts
    useEffect(() => {
        if (authChecked && user) {
            // Run the direct test after authentication is confirmed
            testDirectUpload();
        }
    }, [authChecked, user, testDirectUpload]);

    // Clear messages after timeout
    const clearMessages = useCallback(() => {
        setTimeout(() => {
            setError("");
            setSuccess("");
        }, 5000);
    }, []);

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) {
                    console.error("Auth check error:", error);
                }
                setUser(user);
                console.log("Authentication status:", user ? "Authenticated" : "Not authenticated");
                if (user) {
                    console.log("User details:", { email: user.email, id: user.id });
                }
            } catch (err) {
                console.error("Auth check failed:", err);
            } finally {
                setAuthChecked(true);
            }
        };

        checkAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);
            setUser(session?.user || null);
            setAuthChecked(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Initialize camera
    const initializeCamera = useCallback(async () => {
        try {
            setCameraState("initializing");
            setError("");

            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Camera access is not supported in this browser");
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraState("ready");
            }
        } catch (err) {
            console.error("Camera initialization failed:", err);
            setCameraState("error");

            if (err instanceof Error) {
                if (err.name === "NotAllowedError") {
                    setError("Camera permission denied. Please allow camera access and refresh the page.");
                } else if (err.name === "NotFoundError") {
                    setError("No camera found. Please connect a camera and try again.");
                } else if (err.name === "NotSupportedError") {
                    setError("Camera is not supported in this browser.");
                } else {
                    setError(`Camera error: ${err.message}`);
                }
            } else {
                setError("Unknown camera error occurred.");
            }
            clearMessages();
        }
    }, [clearMessages]);

    // Cleanup camera stream
    const cleanupCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    // Initialize camera on mount (only after auth is checked)
    useEffect(() => {
        if (authChecked) {
            initializeCamera();
            return cleanupCamera;
        }
    }, [authChecked, initializeCamera, cleanupCamera]);

    // Capture image from video
    const captureImage = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) {
            setError("Camera not ready. Please try again.");
            clearMessages();
            return;
        }

        try {
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                throw new Error("Cannot get canvas context");
            }

            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to data URL
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            setImageUrl(dataUrl);
            setSuccess("Photo captured successfully!");
            clearMessages();
        } catch (err) {
            console.error("Image capture failed:", err);
            setError("Failed to capture image. Please try again.");
            clearMessages();
        }
    }, [clearMessages]);

    // Test bucket access
    const testBucketAccess = useCallback(async () => {
        try {
            console.log("Testing bucket access...");

            // Check if bucket exists and is accessible
            const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
            if (bucketError) {
                console.error("Bucket list error:", bucketError);
                return false;
            }

            const picturesBucket = buckets?.find(bucket => bucket.id === 'pictures');
            if (!picturesBucket) {
                console.error("Pictures bucket not found");
                return false;
            }

            console.log("Pictures bucket found:", picturesBucket);

            // Test a small upload
            const testBlob = new Blob(['test'], { type: 'text/plain' });
            const testFileName = `test-${Date.now()}.txt`;

            const { data, error: uploadError } = await supabase.storage
                .from("pictures")
                .upload(testFileName, testBlob);

            if (uploadError) {
                console.error("Test upload failed:", uploadError);
                return false;
            }

            console.log("Test upload successful:", data);

            // Clean up test file
            await supabase.storage.from("pictures").remove([data.path]);
            console.log("Test file cleaned up");

            return true;
        } catch (err) {
            console.error("Bucket test failed:", err);
            return false;
        }
    }, []);

    // Upload image to Supabase (simplified version)
    const uploadToSupabase = useCallback(async () => {
        if (!imageUrl) {
            setError("No image to upload.");
            clearMessages();
            return;
        }

        try {
            setUploadState("uploading");
            setError("");

            console.log("🚀 Starting upload process...");

            // Step 1: Check authentication
            console.log("📝 Step 1: Checking authentication...");
            const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error("❌ Auth error:", authError);
                throw new Error(`Authentication error: ${authError.message}`);
            }

            if (!currentUser) {
                console.error("❌ No user found");
                throw new Error("You must be logged in to upload files");
            }

            console.log("✅ Step 1 complete: User authenticated", currentUser.email);

            // Step 2: Test bucket access (SIMPLIFIED)
            console.log("📝 Step 2: Testing bucket access...");
            const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

            if (bucketError) {
                console.error("❌ Bucket list error:", bucketError);
                throw new Error(`Cannot access storage: ${bucketError.message}`);
            }

            const picturesBucket = buckets?.find(bucket => bucket.id === 'pictures');
            if (!picturesBucket) {
                console.error("❌ Pictures bucket not found");
                throw new Error("Pictures bucket not found");
            }

            console.log("✅ Step 2 complete: Bucket accessible", picturesBucket);

            // Step 3: Convert image
            console.log("📝 Step 3: Converting image to blob...");
            const response = await fetch(imageUrl);

            if (!response.ok) {
                console.error("❌ Fetch failed:", response.status, response.statusText);
                throw new Error(`Failed to process image: ${response.statusText}`);
            }

            const blob = await response.blob();
            console.log("✅ Step 3 complete: Blob created", {
                size: `${(blob.size / 1024).toFixed(2)} KB`,
                type: blob.type
            });

            // Step 4: Upload
            console.log("📝 Step 4: Starting actual upload...");
            const fileName = `board-interview-${Date.now()}.jpg`;
            console.log("📤 Uploading to:", fileName);

            const { data, error: uploadError } = await supabase.storage
                .from("pictures")
                .upload(fileName, blob, {
                    contentType: "image/jpeg",
                    upsert: false
                });

            if (uploadError) {
                console.error("❌ Upload error:", uploadError);
                throw uploadError;
            }

            if (!data) {
                console.error("❌ No data returned from upload");
                throw new Error("Upload completed but no data returned");
            }

            console.log("✅ Step 4 complete: Upload successful!", data);

            setUploadState("success");
            setSuccess(`Image uploaded successfully! File: ${fileName}`);

            setTimeout(() => {
                setImageUrl("");
                setUploadState("idle");
            }, 3000);

        } catch (err) {
            console.error("💥 Upload failed at:", err);
            setUploadState("error");

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Upload failed with unknown error");
            }
        } finally {
            clearMessages();
        }
    }, [imageUrl, clearMessages]);

    // Retry camera initialization
    const retryCamera = () => {
        cleanupCamera();
        initializeCamera();
    };

    // Delete captured image
    const deleteImage = () => {
        setImageUrl("");
        setUploadState("idle");
        setSuccess("Image deleted.");
        clearMessages();
    };

    // Show loading while checking authentication
    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking authentication...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Board Interview Preparation
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Capture your practice session photos and prepare for your upcoming board interview with confidence.
                    </p>
                    {/* Authentication status */}
                    {user && (
                        <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            Signed in as {user.email}
                        </div>
                    )}
                </div>

                {/* Notification Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="ml-3 text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="ml-3 text-green-700 font-medium">{success}</p>
                        </div>
                    </div>
                )}

                {/* Authentication Required Message */}
                {!user && (
                    <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-yellow-700 font-medium">Authentication Required</p>
                                <p className="text-yellow-600 text-sm">Please sign in to upload photos to your board interview preparation gallery.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-8">

                            {/* Camera Section */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-900">Camera Preview</h2>

                                <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                                    {cameraState === "initializing" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                            <div className="text-center text-white">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                                                <p>Initializing camera...</p>
                                            </div>
                                        </div>
                                    )}

                                    {cameraState === "error" && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                            <div className="text-center text-white p-6">
                                                <svg className="h-16 w-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 13l-7 7-3-3" />
                                                </svg>
                                                <p className="mb-4">Camera unavailable</p>
                                                <button
                                                    onClick={retryCamera}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className={`w-full h-full object-cover ${cameraState === "ready" ? "block" : "hidden"}`}
                                    />

                                    <canvas
                                        ref={canvasRef}
                                        className="hidden"
                                    />
                                </div>

                                {/* Camera Controls */}
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={captureImage}
                                        disabled={cameraState !== "ready"}
                                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Capture Photo
                                    </button>
                                </div>
                            </div>

                            {/* Preview Section */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold text-gray-900">Photo Preview</h2>

                                {imageUrl ? (
                                    <div className="space-y-4">
                                        <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                                            <img
                                                src={imageUrl}
                                                alt="Captured preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex justify-center space-x-3">
                                            <button
                                                onClick={deleteImage}
                                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>

                                            <button
                                                onClick={uploadToSupabase}
                                                disabled={uploadState === "uploading" || !user}
                                                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                            >
                                                {uploadState === "uploading" ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        {user ? "Upload to Cloud" : "Sign in to Upload"}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg aspect-video flex items-center justify-center border-2 border-dashed border-gray-300">
                                        <div className="text-center text-gray-500">
                                            <svg className="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p>No photo captured yet</p>
                                            <p className="text-sm">Click "Capture Photo" to take a picture</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Interview Preparation Tips</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">1</span>
                            </div>
                            <p className="text-gray-700">Ensure good lighting on your face</p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">2</span>
                            </div>
                            <p className="text-gray-700">Maintain proper posture and eye contact</p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">3</span>
                            </div>
                            <p className="text-gray-700">Choose a professional background</p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">4</span>
                            </div>
                            <p className="text-gray-700">Test your camera setup beforehand</p>
                        </div>
                    </div>
                </div>

                {/* Debug Panel (only in development) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 bg-gray-100 rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong>Auth Status:</strong> {user ? 'Authenticated' : 'Not authenticated'}
                            </div>
                            <div>
                                <strong>Camera State:</strong> {cameraState}
                            </div>
                            <div>
                                <strong>Upload State:</strong> {uploadState}
                            </div>
                        </div>
                        {user && (
                            <div className="mt-2 text-sm">
                                <strong>User:</strong> {user.email} ({user.id})
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BoardInterviewPage;
