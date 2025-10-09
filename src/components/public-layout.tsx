'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from '@/contexts/AuthContext';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuth();

    const navigationItems = [
        { href: "/features", label: "Features" },
        { href: "/pricing", label: "Pricing" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-900 shadow-sm border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Briefcase className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">OpenHire</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <Link href="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                Browse Jobs
                            </Link>

                            {/* Auth Buttons */}
                            <div className="flex items-center space-x-4">
                                {user ? (
                                    <Link href={user.user_metadata?.role === 'recruiter' ? '/recruiters/dashboard' : '/dashboard'}>
                                        <Button size="sm">
                                            Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/get-started">
                                            <Button variant="ghost" size="sm">
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link href="/get-started">
                                            <Button size="sm">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden">
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                {navigationItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                                <Link
                                    href="/jobs"
                                    className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Browse Jobs
                                </Link>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    {user ? (
                                        <Link
                                            href={user.user_metadata?.role === 'recruiter' ? '/recruiters/dashboard' : '/dashboard'}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Button className="w-full">
                                                Dashboard
                                            </Button>
                                        </Link>
                                    ) : (
                                        <div className="space-y-2">
                                            <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                                                <Button variant="ghost" className="w-full">
                                                    Sign In
                                                </Button>
                                            </Link>
                                            <Link href="/get-started" onClick={() => setIsMenuOpen(false)}>
                                                <Button className="w-full">
                                                    Get Started
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="bg-primary/10 p-2 rounded-lg">
                                    <Briefcase className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-2xl font-bold">OpenHire</span>
                            </div>
                            <p className="text-gray-400 mb-4 max-w-md">
                                Connecting talent with opportunity through AI-powered recruitment.
                                Streamline your hiring process and unlock career potential.
                            </p>
                            <div className="flex space-x-4">
                                {/* Add social media links here */}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                                        Features
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                                        Terms of Service
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400">
                                © 2025 OpenHire. All rights reserved.
                            </p>
                            <p className="text-gray-400 text-sm mt-4 md:mt-0">
                                Made with ❤️ for the future of recruitment
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
