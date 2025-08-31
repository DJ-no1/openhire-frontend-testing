import { Metadata } from "next";
import PublicLayout from "@/components/public-layout";

export const metadata: Metadata = {
    title: "About Us - OpenHire | AI-Powered Recruitment Platform",
    description: "Learn about OpenHire's mission to revolutionize recruitment with AI. Discover our story, values, and the team behind the leading AI recruitment platform.",
    keywords: "about OpenHire, AI recruitment company, recruitment platform team, hiring technology, AI hiring solutions",
    openGraph: {
        title: "About OpenHire - Revolutionizing Recruitment with AI",
        description: "Meet the team behind OpenHire's revolutionary AI-powered recruitment platform. Learn about our mission, values, and commitment to transforming hiring.",
        type: "website",
        url: "https://openhire.com/about",
    },
    twitter: {
        card: "summary_large_image",
        title: "About OpenHire - AI-Powered Recruitment",
        description: "Learn about OpenHire's mission to revolutionize recruitment with AI technology.",
    },
};
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/feature-card";
import {
    Target,
    Eye,
    Heart,
    Users,
    Award,
    Zap,
    Shield,
    Globe
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    const values = [
        {
            icon: Target,
            title: "Innovation",
            description: "We constantly push the boundaries of what's possible in recruitment technology.",
            iconColor: "text-blue-500"
        },
        {
            icon: Shield,
            title: "Trust",
            description: "Building secure, reliable platforms that users can depend on for their career journeys.",
            iconColor: "text-green-500"
        },
        {
            icon: Heart,
            title: "People-First",
            description: "Every decision we make prioritizes the human experience in recruitment.",
            iconColor: "text-red-500"
        },
        {
            icon: Globe,
            title: "Accessibility",
            description: "Making top-tier recruitment tools accessible to companies and candidates of all sizes.",
            iconColor: "text-purple-500"
        }
    ];

    const teamMembers = [
        {
            name: "Alex Chen",
            role: "CEO & Co-Founder",
            bio: "Former tech recruiter with 10+ years experience. Passionate about using AI to democratize hiring.",
            image: "/api/placeholder/120/120"
        },
        {
            name: "Sarah Johnson",
            role: "CTO & Co-Founder",
            bio: "AI/ML expert with background at Google and OpenAI. Leads our technical innovation.",
            image: "/api/placeholder/120/120"
        },
        {
            name: "Michael Rodriguez",
            role: "Head of Product",
            bio: "Product strategist focused on user experience. Previously at LinkedIn and Indeed.",
            image: "/api/placeholder/120/120"
        },
        {
            name: "Emily Zhang",
            role: "Head of Engineering",
            bio: "Full-stack engineer passionate about scalable systems and clean code.",
            image: "/api/placeholder/120/120"
        }
    ];

    const stats = [
        { value: "2023", label: "Founded" },
        { value: "50+", label: "Team Members" },
        { value: "500+", label: "Companies Served" },
        { value: "10K+", label: "Successful Placements" }
    ];

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Revolutionizing Recruitment with <span className="text-primary">AI</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        We're on a mission to make hiring more efficient, fair, and human-centered
                        by harnessing the power of artificial intelligence.
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Our Story
                            </h2>
                            <div className="space-y-4 text-lg text-gray-600 dark:text-gray-400">
                                <p>
                                    Founded in 2023, OpenHire was born from a simple observation: traditional
                                    recruitment processes were broken. Hiring managers were drowning in resumes,
                                    and qualified candidates were getting lost in the noise.
                                </p>
                                <p>
                                    Our founders, with combined decades of experience in tech recruitment and AI,
                                    saw an opportunity to level the playing field. They envisioned a world where
                                    AI could handle the tedious screening work, allowing humans to focus on what
                                    they do best: building relationships and making meaningful connections.
                                </p>
                                <p>
                                    Today, OpenHire serves hundreds of companies and thousands of job seekers,
                                    making recruitment faster, fairer, and more effective for everyone involved.
                                </p>
                            </div>
                        </div>
                        <div className="lg:order-first">
                            <Card className="p-8">
                                <div className="grid grid-cols-2 gap-8">
                                    {stats.map((stat, index) => (
                                        <div key={index} className="text-center">
                                            <div className="text-3xl font-bold text-primary mb-2">
                                                {stat.value}
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <Card className="p-8 hover:shadow-lg transition-shadow">
                            <div className="text-center mb-6">
                                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full w-fit mx-auto mb-4">
                                    <Target className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Our Mission
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                                To democratize access to top talent and career opportunities by
                                creating AI-powered recruitment tools that are efficient, fair,
                                and accessible to organizations of all sizes.
                            </p>
                        </Card>

                        <Card className="p-8 hover:shadow-lg transition-shadow">
                            <div className="text-center mb-6">
                                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full w-fit mx-auto mb-4">
                                    <Eye className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Our Vision
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                                A world where every person finds meaningful work and every
                                organization builds diverse, high-performing teams through
                                intelligent, bias-free recruitment processes.
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Our Values
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            The principles that guide everything we do at OpenHire.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <FeatureCard
                                key={index}
                                icon={value.icon}
                                title={value.title}
                                description={value.description}
                                iconColor={value.iconColor}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Meet Our Team
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            The brilliant minds behind OpenHire's revolutionary recruitment platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="mb-4">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                                        />
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                                            {member.name}
                                        </h3>
                                        <p className="text-primary font-medium mb-3">
                                            {member.role}
                                        </p>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {member.bio}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-white">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Join Us on Our Mission
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Whether you're looking for talent or seeking your next opportunity,
                        OpenHire is here to help you succeed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/signup">
                            <Button size="lg" variant="secondary" className="px-8">
                                Get Started Today
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-primary">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
