import { Metadata } from "next";
import PublicLayout from "@/components/public-layout";

export const metadata: Metadata = {
    title: "Terms of Service - OpenHire | Platform Usage Terms",
    description: "Read OpenHire's terms of service to understand the rules and guidelines for using our AI-powered recruitment platform.",
    keywords: "terms of service, user agreement, platform terms, OpenHire terms, recruitment platform rules",
    openGraph: {
        title: "OpenHire Terms of Service",
        description: "Terms and conditions for using OpenHire's AI recruitment platform.",
        type: "website",
        url: "https://openhire.com/terms",
    },
};
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
    const lastUpdated = "January 1, 2025";

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Terms of Service
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Last updated: {lastUpdated}
                    </p>
                </div>

                <Card>
                    <CardContent className="p-8 prose prose-gray dark:prose-invert max-w-none">
                        <h2>Agreement to Terms</h2>
                        <p>
                            By accessing and using OpenHire ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>

                        <h2>Description of Service</h2>
                        <p>
                            OpenHire is an AI-powered recruitment platform that connects job seekers with employers. Our services include job matching, resume optimization, interview assistance, candidate screening, and related recruitment tools.
                        </p>

                        <h2>User Accounts</h2>

                        <h3>Account Registration</h3>
                        <ul>
                            <li>You must provide accurate, current, and complete information during registration</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                            <li>You must notify us immediately of any unauthorized use of your account</li>
                            <li>You must be at least 16 years old to create an account</li>
                        </ul>

                        <h3>Account Types</h3>
                        <p>We offer different account types for job seekers and recruiters, each with specific features and limitations as described in our pricing plans.</p>

                        <h2>Acceptable Use</h2>
                        <p>You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
                        <ul>
                            <li>Post false, misleading, or fraudulent information</li>
                            <li>Impersonate any person or entity</li>
                            <li>Harass, abuse, or harm other users</li>
                            <li>Upload malicious code or attempt to compromise our systems</li>
                            <li>Use automated tools to scrape or collect data from our platform</li>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Interfere with the proper working of the Service</li>
                        </ul>

                        <h2>Content and Intellectual Property</h2>

                        <h3>Your Content</h3>
                        <p>You retain ownership of any content you submit to our platform, including resumes, job postings, and profile information. By submitting content, you grant us a license to use, modify, and display such content for the purpose of providing our services.</p>

                        <h3>Our Content</h3>
                        <p>All content and materials available on OpenHire, including but not limited to text, graphics, website name, code, images, and logos are the intellectual property of OpenHire and are protected by applicable copyright and trademark law.</p>

                        <h2>Privacy and Data Protection</h2>
                        <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your information.</p>

                        <h2>Payment Terms</h2>

                        <h3>Subscription Plans</h3>
                        <ul>
                            <li>Some features of our Service require payment of fees</li>
                            <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                            <li>All fees are non-refundable except as required by law</li>
                            <li>We reserve the right to change our pricing with 30 days notice</li>
                        </ul>

                        <h3>Billing and Cancellation</h3>
                        <ul>
                            <li>You authorize us to charge your chosen payment method for the applicable fees</li>
                            <li>You may cancel your subscription at any time through your account settings</li>
                            <li>Cancellation takes effect at the end of your current billing period</li>
                        </ul>

                        <h2>Disclaimers and Limitations</h2>

                        <h3>Service Availability</h3>
                        <p>We strive to provide reliable service but cannot guarantee 100% uptime. We reserve the right to modify, suspend, or discontinue the Service with or without notice.</p>

                        <h3>Job Matching and Hiring</h3>
                        <p>While we use advanced AI algorithms for job matching, we do not guarantee employment outcomes. The final hiring decisions rest with employers, and job seekers are responsible for their own career decisions.</p>

                        <h3>Limitation of Liability</h3>
                        <p>To the maximum extent permitted by law, OpenHire shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>

                        <h2>Termination</h2>
                        <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including but not limited to a breach of the Terms.</p>

                        <h2>Dispute Resolution</h2>

                        <h3>Governing Law</h3>
                        <p>These Terms shall be interpreted and governed by the laws of the State of California, without regard to its conflict of law provisions.</p>

                        <h3>Arbitration</h3>
                        <p>Any dispute arising from these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>

                        <h2>Changes to Terms</h2>
                        <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>

                        <h2>Severability</h2>
                        <p>If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.</p>

                        <h2>Contact Information</h2>
                        <p>If you have any questions about these Terms of Service, please contact us:</p>
                        <ul>
                            <li>Email: legal@openhire.com</li>
                            <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
                            <li>Phone: +1 (555) 123-4567</li>
                        </ul>

                        <h2>Acknowledgment</h2>
                        <p>
                            BY USING SERVICE OR OTHER SERVICES PROVIDED BY US, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
