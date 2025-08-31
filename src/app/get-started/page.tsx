import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building, UserCheck, ArrowRight, ArrowLeft, Users, Briefcase, Target, Zap, CheckCircle, Star } from "lucide-react";

export const metadata: Metadata = {
    title: "Get Started - Choose Your Role | OpenHire",
    description: "Join OpenHire as a recruiter to find top talent with AI-powered screening, or as a job seeker to discover your dream career with smart matching.",
    keywords: ["get started", "sign up", "recruiter signup", "job seeker signup", "AI recruitment", "hiring platform"],
    openGraph: {
        title: "Get Started with OpenHire - Choose Your Role",
        description: "Select your role and start your journey with OpenHire's AI-powered recruitment platform. Perfect for both recruiters and job seekers.",
        url: "/get-started",
        siteName: "OpenHire",
        images: [
            {
                url: "/api/placeholder/1200/630",
                width: 1200,
                height: 630,
                alt: "OpenHire Get Started Page"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Get Started with OpenHire",
        description: "Choose your role and join thousands using AI-powered recruitment.",
        images: ["/api/placeholder/1200/630"]
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1
        }
    }
};

export default function GetStartedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>

            <div className="relative w-full max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 group text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Choose your{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            journey
                        </span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        Select your role to get started with OpenHire's AI-powered recruitment platform
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {/* Recruiter Card */}
                    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600">
                        <CardHeader className="text-center pb-4 relative z-10">
                            <div className="mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl w-fit group-hover:scale-105 transition-transform duration-200">
                                <Building className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                                I'm a Recruiter
                            </CardTitle>
                            <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                                Find and hire exceptional talent with AI-powered screening
                            </p>
                        </CardHeader>

                        <CardContent className="relative z-10 px-6 pb-6">
                            {/* Features List */}
                            <div className="space-y-2 mb-6">
                                {[
                                    "AI-powered candidate screening",
                                    "Smart job posting optimization",
                                    "Advanced analytics & insights"
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                        <span className="text-blue-800 dark:text-blue-200 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="flex justify-between items-center mb-6 p-3 bg-white/50 dark:bg-blue-900/20 rounded-xl">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">2K+</div>
                                    <div className="text-xs text-blue-700 dark:text-blue-300">Companies</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-600">94%</div>
                                    <div className="text-xs text-blue-700 dark:text-blue-300">Success</div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-2">
                                <Link href="/recruiters/auth/signup" className="block">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm py-3 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        Start Hiring
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/recruiters/auth/signin" className="block">
                                    <Button variant="outline" className="w-full border border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 py-2 text-sm">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Seeker Card */}
                    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600">
                        <CardHeader className="text-center pb-4 relative z-10">
                            <div className="mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl w-fit group-hover:scale-105 transition-transform duration-200">
                                <UserCheck className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                                I'm Job Seeking
                            </CardTitle>
                            <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                                Discover your dream career with personalized recommendations
                            </p>
                        </CardHeader>

                        <CardContent className="relative z-10 px-6 pb-6">
                            {/* Features List */}
                            <div className="space-y-2 mb-6">
                                {[
                                    "AI-powered job recommendations",
                                    "Smart resume optimization",
                                    "Career growth insights"
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                        <span className="text-green-800 dark:text-green-200 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Stats */}
                            <div className="flex justify-between items-center mb-6 p-3 bg-white/50 dark:bg-green-900/20 rounded-xl">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">25K+</div>
                                    <div className="text-xs text-green-700 dark:text-green-300">Placements</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">50K+</div>
                                    <div className="text-xs text-green-700 dark:text-green-300">Jobs</div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <div className="space-y-2">
                                <Link href="/auth/signup" className="block">
                                    <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-sm py-3 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                                        <Target className="mr-2 h-4 w-4" />
                                        Find Jobs
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="/auth/signin" className="block">
                                    <Button variant="outline" className="w-full border border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 py-2 text-sm">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Info */}
                <div className="text-center mt-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                        ✨ No credit card required • 14-day free trial • Cancel anytime
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-400" />
                            4.9/5 rating
                        </div>
                        <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            50K+ users
                        </div>
                        <div className="flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            AI-powered
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
