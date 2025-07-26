"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { ResumeAnalysisResults } from "@/components/resume-analysis-results"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import {
    API_CONFIG,
    getApiUrl,
    type ReviewResponse
} from "@/lib/api"

export default function ResumeReviewPage() {
    const { reviewId } = useParams();
    const [review, setReview] = useState<ReviewResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        async function fetchReview() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REVIEW_BY_ID(reviewId as string)), {
                    signal: AbortSignal.timeout(API_CONFIG.TIMEOUTS.FETCH)
                });
                if (!res.ok) {
                    throw new Error(`Failed to fetch review: ${res.status} ${res.statusText}`);
                }
                const data = await res.json();
                setReview(data);
            } catch (err) {
                if (err instanceof Error && err.name === 'TimeoutError') {
                    setError("Request timeout - please try again");
                } else {
                    setError((err as Error).message);
                }
                console.error('Error fetching review:', err);
            } finally {
                setLoading(false);
            }
        }
        if (reviewId) {
            fetchReview();
        }
    }, [reviewId]);

    const handleNewAnalysis = () => {
        // Navigate back to main resume review page for new analysis
        window.location.href = '/resume-review';
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/">
                                        OpenHire
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/resume-review">
                                        AI Resume Analysis
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Review #{reviewId}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {loading && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                            <div className="text-center">
                                <h3 className="text-lg font-medium">Loading Analysis Results</h3>
                                <p className="text-muted-foreground">Retrieving AI analysis for review #{reviewId}</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="max-w-2xl mx-auto w-full">
                            <Card className="border-red-200 bg-red-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-800">
                                        <AlertCircle className="h-6 w-6" />
                                        Error Loading Review
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-red-700">{error}</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.reload()}
                                        >
                                            Try Again
                                        </Button>
                                        <Link href="/resume-review">
                                            <Button variant="default">
                                                <ArrowLeft className="mr-2 h-4 w-4" />
                                                Back to Analysis
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {!loading && !error && !review && (
                        <div className="max-w-2xl mx-auto w-full">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Review Not Found</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground">
                                        The review with ID "{reviewId}" could not be found or may have expired.
                                    </p>
                                    <Link href="/resume-review">
                                        <Button>
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Start New Analysis
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {review && (
                        <ResumeAnalysisResults
                            analysis={review}
                            onNewAnalysis={handleNewAnalysis}
                        />
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
