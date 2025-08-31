import { Metadata } from "next";
import PublicLayout from "@/components/public-layout";

export const metadata: Metadata = {
    title: "Features - OpenHire | AI-Powered Recruitment Tools",
    description: "Discover OpenHire's powerful AI features for job seekers and recruiters. Smart matching, automated screening, resume optimization, and more.",
    keywords: "AI recruitment features, job matching, resume optimization, automated screening, hiring tools, recruitment platform",
    openGraph: {
        title: "OpenHire Features - AI-Powered Recruitment Tools",
        description: "Explore advanced AI features that revolutionize recruitment for both candidates and recruiters.",
        type: "website",
        url: "https://openhire.com/features",
    },
    twitter: {
        card: "summary_large_image",
        title: "OpenHire Features - AI Recruitment Tools",
        description: "Discover powerful AI features for smarter, faster, and more effective recruitment.",
    },
};
import FeatureCard from "@/components/feature-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Zap,
    Target,
    Shield,
    Brain,
    Search,
    BarChart3,
    Clock,
    Users,
    FileText,
    Video,
    MessageSquare,
    CheckCircle,
    TrendingUp,
    Filter,
    Globe,
    Smartphone
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
    const candidateFeatures = [
        {
            icon: Search,
            title: "Smart Job Matching",
            description: "AI analyzes your skills and preferences to find the perfect job matches automatically.",
            iconColor: "text-blue-500"
        },
        {
            icon: Brain,
            title: "AI Resume Optimization",
            description: "Get intelligent suggestions to improve your resume and increase your chances of getting hired.",
            iconColor: "text-purple-500"
        },
        {
            icon: Video,
            title: "AI Interview Practice",
            description: "Practice with our AI interviewer to improve your skills and build confidence.",
            iconColor: "text-green-500"
        },
        {
            icon: BarChart3,
            title: "Application Tracking",
            description: "Track all your job applications in one place with detailed status updates.",
            iconColor: "text-orange-500"
        }
    ];

    const recruiterFeatures = [
        {
            icon: Zap,
            title: "AI-Powered Screening",
            description: "Automatically screen thousands of resumes in seconds with our advanced AI algorithms.",
            iconColor: "text-yellow-500"
        },
        {
            icon: Target,
            title: "Precision Matching",
            description: "Find the perfect candidates with AI that understands skills, culture fit, and potential.",
            iconColor: "text-blue-500"
        },
        {
            icon: Video,
            title: "Automated Interviews",
            description: "Conduct AI-powered initial interviews to pre-qualify candidates efficiently.",
            iconColor: "text-red-500"
        },
        {
            icon: BarChart3,
            title: "Hiring Analytics",
            description: "Get detailed insights into your hiring funnel and optimize your recruitment process.",
            iconColor: "text-green-500"
        }
    ];

    const platformFeatures = [
        {
            icon: Shield,
            title: "Enterprise Security",
            description: "Bank-level security with encryption, compliance, and privacy protection.",
            iconColor: "text-green-600"
        },
        {
            icon: Globe,
            title: "Global Reach",
            description: "Support for multiple languages, currencies, and international compliance.",
            iconColor: "text-blue-600"
        },
        {
            icon: Smartphone,
            title: "Mobile Optimized",
            description: "Full functionality on any device with responsive design and mobile apps.",
            iconColor: "text-purple-600"
        },
        {
            icon: Clock,
            title: "24/7 Support",
            description: "Round-the-clock customer support and comprehensive documentation.",
            iconColor: "text-orange-600"
        }
    ];

    const workflowSteps = [
        {
            step: "1",
            title: "Profile Creation",
            description: "Create detailed profiles with skills, experience, and preferences.",
            icon: Users
        },
        {
            step: "2",
            title: "AI Analysis",
            description: "Our AI analyzes profiles and job requirements for optimal matching.",
            icon: Brain
        },
        {
            step: "3",
            title: "Smart Matching",
            description: "Get matched with relevant opportunities or qualified candidates.",
            icon: Target
        },
        {
            step: "4",
            title: "Interview Process",
            description: "Streamlined interview scheduling and AI-assisted evaluations.",
            icon: Video
        },
        {
            step: "5",
            title: "Successful Hiring",
            description: "Complete the hiring process with integrated contract and onboarding tools.",
            icon: CheckCircle
        }
    ];

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Powerful Features for <span className="text-primary">Everyone</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Discover how OpenHire's AI-powered features revolutionize recruitment
                        for both candidates and recruiters.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="secondary" className="px-3 py-1">AI-Powered</Badge>
                        <Badge variant="secondary" className="px-3 py-1">Real-time</Badge>
                        <Badge variant="secondary" className="px-3 py-1">Secure</Badge>
                        <Badge variant="secondary" className="px-3 py-1">Mobile-Ready</Badge>
                    </div>
                </div>
            </section>

            {/* Candidate Features */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mr-3">
                                <Users className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                For Job Seekers
                            </h2>
                        </div>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Leverage AI to find your dream job faster and stand out from the competition.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {candidateFeatures.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                iconColor={feature.iconColor}
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        <Link href="/auth/signup">
                            <Button size="lg" className="px-8">
                                Start Your Job Search
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Recruiter Features */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full mr-3">
                                <Target className="h-8 w-8 text-blue-600" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                For Recruiters
                            </h2>
                        </div>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Streamline your hiring process and find the best talent with AI-powered tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {recruiterFeatures.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                iconColor={feature.iconColor}
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        <Link href="/recruiters/auth/signup">
                            <Button size="lg" className="px-8">
                                Start Hiring Smarter
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Platform Features */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Enterprise-Grade Platform
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Built for scale, security, and reliability with features that enterprise customers demand.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {platformFeatures.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                iconColor={feature.iconColor}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Our streamlined workflow makes recruitment efficient and effective for everyone involved.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {workflowSteps.map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="relative mb-6">
                                    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                        <step.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                        {step.step}
                                    </div>
                                    {index < workflowSteps.length - 1 && (
                                        <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2"></div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Traditional vs AI-Powered Recruitment
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            See how OpenHire's AI technology transforms every aspect of the hiring process.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-6">
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-xl text-gray-600">Traditional Recruitment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Manual resume screening takes days</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Bias in candidate selection</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Limited candidate reach</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Time-consuming interview scheduling</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                                    <span className="text-gray-600 dark:text-gray-400">No data-driven insights</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="p-6 border-primary">
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-xl text-primary">OpenHire AI Recruitment</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-400">AI screens thousands in seconds</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-400">Bias-free, skill-based matching</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-400">Global talent pool access</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-400">Automated scheduling & reminders</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                    <span className="text-gray-600 dark:text-gray-400">Real-time analytics & insights</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Ready to Experience the Future?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Join thousands of companies and candidates who have transformed their recruitment process with OpenHire.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/signup">
                            <Button size="lg" className="px-8">
                                Try It Free
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="outline" size="lg" className="px-8">
                                Schedule Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
