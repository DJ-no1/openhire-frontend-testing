import { Metadata } from "next";
import PublicLayout from "@/components/public-layout";

export const metadata: Metadata = {
    title: "Pricing - OpenHire | Affordable AI Recruitment Plans",
    description: "Choose the perfect OpenHire plan for your needs. Free for job seekers, flexible plans for recruiters. Start your free trial today.",
    keywords: "recruitment pricing, AI hiring costs, job seeker free, recruiter plans, recruitment software pricing",
    openGraph: {
        title: "OpenHire Pricing - Affordable AI Recruitment",
        description: "Transparent pricing for AI-powered recruitment. Free for job seekers, scalable plans for businesses.",
        type: "website",
        url: "https://openhire.com/pricing",
    },
    twitter: {
        card: "summary_large_image",
        title: "OpenHire Pricing - AI Recruitment Plans",
        description: "Transparent, affordable pricing for AI-powered recruitment tools.",
    },
};
import PricingCard from "@/components/pricing-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
    const candidatePlans = [
        {
            title: "Free",
            description: "Perfect for job seekers starting their career journey",
            price: "$0",
            period: "forever",
            features: [
                "Basic job search and filters",
                "AI resume suggestions (limited)",
                "Apply to 5 jobs per month",
                "Basic profile creation",
                "Email support"
            ],
            ctaText: "Get Started Free",
            ctaHref: "/auth/signup"
        },
        {
            title: "Pro",
            description: "Advanced features for serious job seekers",
            price: "$19",
            period: "month",
            features: [
                "Unlimited job applications",
                "Advanced AI resume optimization",
                "AI interview practice sessions",
                "Priority customer support",
                "Detailed application analytics",
                "Salary insights and negotiation tips",
                "Professional profile boost"
            ],
            isPopular: true,
            ctaText: "Start Pro Trial",
            ctaHref: "/auth/signup?plan=pro"
        },
        {
            title: "Executive",
            description: "Premium service for executive-level positions",
            price: "$49",
            period: "month",
            features: [
                "Everything in Pro",
                "Executive headhunter matching",
                "Personal career coaching sessions",
                "Executive profile optimization",
                "Direct recruiter connections",
                "Confidential job search",
                "White-glove support"
            ],
            ctaText: "Contact Sales",
            ctaHref: "/contact"
        }
    ];

    const recruiterPlans = [
        {
            title: "Starter",
            description: "Ideal for small teams and startups",
            price: "$99",
            period: "month",
            features: [
                "Post up to 5 active jobs",
                "AI candidate screening",
                "Basic analytics dashboard",
                "Email support",
                "Up to 3 team members",
                "Standard integrations"
            ],
            ctaText: "Start Free Trial",
            ctaHref: "/recruiters/auth/signup"
        },
        {
            title: "Professional",
            description: "Perfect for growing companies",
            price: "$299",
            period: "month",
            features: [
                "Post up to 25 active jobs",
                "Advanced AI matching algorithms",
                "Automated interview scheduling",
                "Advanced analytics & reporting",
                "Up to 10 team members",
                "Priority support",
                "Custom integrations",
                "Bulk candidate actions"
            ],
            isPopular: true,
            ctaText: "Start Professional",
            ctaHref: "/recruiters/auth/signup?plan=professional"
        },
        {
            title: "Enterprise",
            description: "Custom solutions for large organizations",
            price: "Custom",
            period: "contact us",
            features: [
                "Unlimited job postings",
                "White-label solution",
                "Custom AI model training",
                "Dedicated account manager",
                "Unlimited team members",
                "24/7 phone support",
                "Custom integrations & API",
                "On-premise deployment option",
                "Advanced compliance features"
            ],
            ctaText: "Contact Sales",
            ctaHref: "/contact"
        }
    ];

    const faqItems = [
        {
            question: "Can I switch plans at any time?",
            answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
        },
        {
            question: "Is there a free trial for paid plans?",
            answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start your trial."
        },
        {
            question: "What happens to my data if I cancel?",
            answer: "Your data remains accessible for 30 days after cancellation. You can export all your data during this period."
        },
        {
            question: "Do you offer discounts for annual billing?",
            answer: "Yes, annual billing comes with a 20% discount on all plans. Contact our sales team for custom enterprise pricing."
        },
        {
            question: "Can I get a custom plan for my organization?",
            answer: "Absolutely! We offer custom enterprise plans with tailored features, pricing, and support. Contact our sales team to discuss your needs."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, PayPal, and can arrange invoicing for enterprise customers."
        }
    ];

    return (
        <PublicLayout>
            {/* Hero Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                        Simple, Transparent <span className="text-primary">Pricing</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Choose the perfect plan for your needs. Start free and scale as you grow.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="secondary" className="px-3 py-1">14-Day Free Trial</Badge>
                        <Badge variant="secondary" className="px-3 py-1">No Setup Fees</Badge>
                        <Badge variant="secondary" className="px-3 py-1">Cancel Anytime</Badge>
                    </div>
                </div>
            </section>

            {/* Job Seekers Pricing */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            For Job Seekers
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Find your dream job with our AI-powered tools. Start free and upgrade when you need more.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {candidatePlans.map((plan, index) => (
                            <PricingCard key={index} {...plan} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Recruiters Pricing */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            For Recruiters & Companies
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Streamline your hiring process and find the best talent faster with our enterprise-ready platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {recruiterPlans.map((plan, index) => (
                            <PricingCard key={index} {...plan} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Comparison */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Compare All Features
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            See exactly what's included in each plan to make the best choice for your needs.
                        </p>
                    </div>

                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                        <tr>
                                            <th className="text-left p-4 font-medium text-gray-900 dark:text-white">Feature</th>
                                            <th className="text-center p-4 font-medium text-gray-900 dark:text-white">Free</th>
                                            <th className="text-center p-4 font-medium text-gray-900 dark:text-white">Pro</th>
                                            <th className="text-center p-4 font-medium text-gray-900 dark:text-white">Executive</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        <tr>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">Job Applications per Month</td>
                                            <td className="p-4 text-center">5</td>
                                            <td className="p-4 text-center">Unlimited</td>
                                            <td className="p-4 text-center">Unlimited</td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">AI Resume Optimization</td>
                                            <td className="p-4 text-center"><Check className="h-5 w-5 text-yellow-500 mx-auto" /></td>
                                            <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                                            <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">AI Interview Practice</td>
                                            <td className="p-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                                            <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                                            <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                                        </tr>
                                        <tr>
                                            <td className="p-4 text-gray-600 dark:text-gray-400">Personal Career Coaching</td>
                                            <td className="p-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                                            <td className="p-4 text-center"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                                            <td className="p-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            Got questions? We've got answers. Can't find what you're looking for? Contact our support team.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {faqItems.map((faq, index) => (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start">
                                        <HelpCircle className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                                {faq.question}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
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
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join thousands of successful job seekers and recruiters. Start your free trial today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/signup">
                            <Button size="lg" variant="secondary" className="px-8">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-primary">
                                Contact Sales
                            </Button>
                        </Link>
                    </div>
                    <p className="text-sm opacity-75 mt-4">
                        No credit card required • 14-day free trial • Cancel anytime
                    </p>
                </div>
            </section>
        </PublicLayout>
    );
}
