import { Metadata } from "next";
import PublicLayout from "@/components/public-layout";

export const metadata: Metadata = {
    title: "Privacy Policy - OpenHire | Your Data Security",
    description: "Read OpenHire's privacy policy to understand how we protect your personal information and maintain data security in our AI recruitment platform.",
    keywords: "privacy policy, data protection, GDPR compliance, recruitment data security, OpenHire privacy",
    openGraph: {
        title: "OpenHire Privacy Policy - Data Protection",
        description: "Learn how OpenHire protects your personal information and maintains data security.",
        type: "website",
        url: "https://openhire.com/privacy",
    },
};
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
    const lastUpdated = "January 1, 2025";

    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        Last updated: {lastUpdated}
                    </p>
                </div>

                <Card>
                    <CardContent className="p-8 prose prose-gray dark:prose-invert max-w-none">
                        <h2>Introduction</h2>
                        <p>
                            At OpenHire ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our recruitment platform services.
                        </p>

                        <h2>Information We Collect</h2>

                        <h3>Personal Information</h3>
                        <p>We may collect the following types of personal information:</p>
                        <ul>
                            <li><strong>Account Information:</strong> Name, email address, phone number, professional title, and company information</li>
                            <li><strong>Profile Information:</strong> Resume data, work experience, education, skills, and career preferences</li>
                            <li><strong>Communication Data:</strong> Messages, feedback, and correspondence with our support team</li>
                            <li><strong>Usage Information:</strong> How you interact with our platform, including pages visited, features used, and time spent</li>
                        </ul>

                        <h3>Automatically Collected Information</h3>
                        <p>We automatically collect certain information when you use our services:</p>
                        <ul>
                            <li>IP address and location data</li>
                            <li>Device information (browser type, operating system, device identifiers)</li>
                            <li>Log files and usage analytics</li>
                            <li>Cookies and similar tracking technologies</li>
                        </ul>

                        <h2>How We Use Your Information</h2>
                        <p>We use your information for the following purposes:</p>
                        <ul>
                            <li><strong>Service Provision:</strong> To provide, maintain, and improve our recruitment platform</li>
                            <li><strong>Matching Services:</strong> To match candidates with relevant job opportunities and vice versa</li>
                            <li><strong>Communication:</strong> To send service-related notifications, updates, and marketing communications</li>
                            <li><strong>Analytics:</strong> To analyze usage patterns and improve our services</li>
                            <li><strong>Security:</strong> To protect against fraud, unauthorized access, and other security threats</li>
                            <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                        </ul>

                        <h2>Information Sharing and Disclosure</h2>

                        <h3>With Your Consent</h3>
                        <p>We may share your information with third parties when you provide explicit consent, such as when applying for jobs or allowing recruiters to view your profile.</p>

                        <h3>Service Providers</h3>
                        <p>We may share information with trusted service providers who assist us in operating our platform, including:</p>
                        <ul>
                            <li>Cloud hosting and storage providers</li>
                            <li>Email and communication services</li>
                            <li>Analytics and monitoring services</li>
                            <li>Payment processing services</li>
                        </ul>

                        <h3>Legal Requirements</h3>
                        <p>We may disclose your information if required by law, court order, or government regulation, or to protect our rights, property, or safety.</p>

                        <h2>Data Security</h2>
                        <p>We implement appropriate technical and organizational security measures to protect your personal information, including:</p>
                        <ul>
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security assessments and audits</li>
                            <li>Access controls and authentication mechanisms</li>
                            <li>Employee training on data protection</li>
                        </ul>

                        <h2>Your Rights and Choices</h2>
                        <p>Depending on your location, you may have the following rights:</p>
                        <ul>
                            <li><strong>Access:</strong> Request access to your personal information</li>
                            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                            <li><strong>Portability:</strong> Request a copy of your information in a portable format</li>
                            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                        </ul>

                        <h2>Cookies and Tracking Technologies</h2>
                        <p>We use cookies and similar technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences, but some features may not function properly if cookies are disabled.</p>

                        <h2>Data Retention</h2>
                        <p>We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When no longer needed, we securely delete or anonymize your information.</p>

                        <h2>International Data Transfers</h2>
                        <p>Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and provide appropriate safeguards.</p>

                        <h2>Children's Privacy</h2>
                        <p>Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware of such collection, we will take steps to delete the information promptly.</p>

                        <h2>Changes to This Privacy Policy</h2>
                        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

                        <h2>Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                        <ul>
                            <li>Email: privacy@openhire.com</li>
                            <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
                            <li>Phone: +1 (555) 123-4567</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </PublicLayout>
    );
}
