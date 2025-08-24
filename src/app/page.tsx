"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import Link from "next/link";
import {
  Building,
  UserCheck,
  ArrowRight,
  Briefcase,
  Zap,
  Target,
  Shield,
  Sparkles
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their respective dashboards
      if (user.role === 'recruiter') {
        router.push('/recruiters/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect in useEffect
  }

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "AI-Powered Screening",
      description: "Advanced AI analyzes resumes and conducts initial candidate screenings automatically"
    },
    {
      icon: <Target className="h-8 w-8 text-blue-500" />,
      title: "Smart Matching",
      description: "Intelligent algorithms match candidates with the most suitable job opportunities"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with reliable data protection and privacy controls"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-purple-500" />,
      title: "Real-time Insights",
      description: "Get instant analytics and insights to optimize your recruitment process"
    }
  ];

  const stats = [
    { label: "Jobs Posted", value: "10,000+" },
    { label: "Candidates Placed", value: "5,000+" },
    { label: "Companies Trust Us", value: "500+" },
    { label: "Success Rate", value: "85%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">OpenHire</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                How it Works
              </Link>
              <Link href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            The Future of <span className="text-primary">Recruitment</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Connect top talent with amazing opportunities using our AI-powered recruitment platform.
            Streamline hiring for recruiters and unlock career potential for job seekers.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Card className="w-full sm:w-80 hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full w-fit">
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">For Recruiters</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Find and hire the best talent with AI-powered screening and smart matching
                </p>
                <div className="space-y-3">
                  <Link href="/recruiters/auth/signup" className="block">
                    <Button className="w-full" size="lg">
                      Get Started as Recruiter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/recruiters/auth/signin" className="block">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="w-full sm:w-80 hover:shadow-lg transition-all duration-200 hover:scale-105">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 bg-green-100 dark:bg-green-900/20 p-3 rounded-full w-fit">
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">For Job Seekers</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Discover your dream job with personalized recommendations and AI assistance
                </p>
                <div className="space-y-3">
                  <Link href="/auth/signup" className="block">
                    <Button className="w-full" size="lg">
                      Start Job Search
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/auth/signin" className="block">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Browse Jobs Button */}
          <div className="mb-16">
            <Link href="/jobs">
              <Button variant="outline" size="lg" className="border-2 border-primary hover:bg-primary hover:text-primary-foreground">
                <Briefcase className="mr-2 h-5 w-5" />
                Browse Jobs
              </Button>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Explore available opportunities without signing up
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose OpenHire?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI technology with intuitive design to revolutionize the hiring process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 w-fit">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Sign Up & Setup
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your account and complete your profile with just a few clicks.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI-Powered Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI analyzes profiles and preferences to find the perfect matches.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Connect & Hire
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with matched candidates or jobs and complete the hiring process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold">OpenHire</span>
            </div>
            <p className="text-gray-400 mb-8">
              Connecting talent with opportunity through AI-powered recruitment.
            </p>
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400">
                © 2025 OpenHire. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
