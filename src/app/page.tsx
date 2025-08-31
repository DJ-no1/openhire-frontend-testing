"use client";

import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import Link from "next/link";
import PublicLayout from "@/components/public-layout";
import FeatureCard from "@/components/feature-card";
import TestimonialCard from "@/components/testimonial-card";
import {
  Building,
  UserCheck,
  ArrowRight,
  Briefcase,
  Zap,
  Target,
  Shield,
  Sparkles,
  Users,
  TrendingUp,
  Clock,
  Award,
  Brain,
  CheckCircle,
  Star,
  Globe,
  Rocket,
  BarChart3
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading OpenHire...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Screening",
      description: "Advanced AI analyzes resumes and conducts intelligent candidate screenings",
      iconColor: "text-purple-600"
    },
    {
      icon: Target,
      title: "Smart Matching",
      description: "Precision algorithms connect talent with perfect opportunities",
      iconColor: "text-blue-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with complete data protection and privacy",
      iconColor: "text-green-600"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Instant insights and data-driven recruitment optimization",
      iconColor: "text-orange-600"
    }
  ];

  const stats = [
    { label: "Active Jobs", value: "50K+", icon: Briefcase, color: "text-blue-600" },
    { label: "Successful Hires", value: "25K+", icon: Users, color: "text-green-600" },
    { label: "Top Companies", value: "2K+", icon: Building, color: "text-purple-600" },
    { label: "Success Rate", value: "94%", icon: TrendingUp, color: "text-orange-600" }
  ];

  const benefits = [
    "AI-powered candidate screening",
    "Automated interview scheduling",
    "Real-time collaboration tools",
    "Advanced analytics & reporting",
    "Enterprise-grade security",
    "24/7 customer support"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Engineering",
      company: "TechFlow",
      content: "OpenHire revolutionized our hiring process. We reduced time-to-hire by 70% and quality of candidates improved dramatically.",
      rating: 5,
      avatar: "/api/placeholder/48/48"
    },
    {
      name: "Michael Rodriguez",
      role: "Senior Developer",
      company: "InnovateLabs",
      content: "The AI matching is incredible. Found my dream job in 2 weeks - the platform understood my skills perfectly.",
      rating: 5,
      avatar: "/api/placeholder/48/48"
    },
    {
      name: "Emily Johnson",
      role: "Talent Director",
      company: "Growth Dynamics",
      content: "Best recruitment platform we've used. The AI screening saves us 15+ hours per week and finds better candidates.",
      rating: 5,
      avatar: "/api/placeholder/48/48"
    }
  ];

  return (
    <PublicLayout>
      {/* Hero Section - Modern & Bold */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Headline */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Recruitment Platform
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                Hire smarter with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  AI precision
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Transform your recruitment process with intelligent AI screening, perfect candidate matching,
                and data-driven insights. Join thousands of companies building better teams.
              </p>
            </div>

            {/* CTA Section */}
            {user ? (
              <div className="mt-12">
                <Link href={user.user_metadata?.role === 'recruiter' ? '/recruiters/dashboard' : '/dashboard'}>
                  <Button size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                    <Rocket className="mr-2 h-5 w-5" />
                    Open Dashboard
                  </Button>
                </Link>
                <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
                  Welcome back, {user.user_metadata?.name || user.email?.split('@')[0]}! 👋
                </p>
              </div>
            ) : (
              <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/get-started">
                  <Button size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                    <Rocket className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Globe className="mr-2 h-5 w-5" />
                    Browse Jobs
                  </Button>
                </Link>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-col items-center space-y-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Trusted by leading companies worldwide
              </p>
              <div className="flex items-center space-x-8 opacity-60">
                <div className="text-gray-400 font-bold text-lg">TechCorp</div>
                <div className="text-gray-400 font-bold text-lg">InnovateLabs</div>
                <div className="text-gray-400 font-bold text-lg">GlobalTech</div>
                <div className="text-gray-400 font-bold text-lg">FutureWorks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`mx-auto mb-4 w-fit p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need to hire{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                exceptional talent
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our AI-powered platform streamlines every step of the recruitment process,
              from sourcing to hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4 mr-2" />
                Why Choose OpenHire
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                The recruitment platform{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  built for results
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                From small startups to Fortune 500 companies, our AI-powered platform delivers
                exceptional hiring results with unmatched efficiency.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                {!user && (
                  <Link href="/get-started">
                    <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                      Get Started Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Right Content - Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 bg-blue-100 dark:bg-blue-900/40 p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-200">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-blue-900 dark:text-blue-100">For Recruiters</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-blue-700 dark:text-blue-300 mb-6">
                    Transform your hiring process with AI-powered candidate screening and smart matching algorithms.
                  </p>
                  {!user && (
                    <div className="space-y-3">
                      <Link href="/get-started" className="block">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/recruiters/auth/signin" className="block">
                        <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 bg-green-100 dark:bg-green-900/40 p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-200">
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl text-green-900 dark:text-green-100">For Job Seekers</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-green-700 dark:text-green-300 mb-6">
                    Discover your dream career with personalized job recommendations and AI-powered matching.
                  </p>
                  {!user && (
                    <div className="space-y-3">
                      <Link href="/get-started" className="block">
                        <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href="/auth/signin" className="block">
                        <Button variant="outline" className="w-full border-green-300 text-green-600 hover:bg-green-50">
                          Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
              <Rocket className="w-4 h-4 mr-2" />
              How It Works
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Get started in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                3 simple steps
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our streamlined process gets you up and running quickly, whether you're hiring or job searching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Sign up and build your comprehensive profile with our intelligent form system.",
                icon: UserCheck,
                color: "blue"
              },
              {
                step: "2",
                title: "AI-Powered Matching",
                description: "Our advanced algorithms analyze and match profiles for optimal compatibility.",
                icon: Brain,
                color: "purple"
              },
              {
                step: "3",
                title: "Connect & Succeed",
                description: "Review matches, connect with candidates or employers, and complete your hiring journey.",
                icon: Rocket,
                color: "green"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}>
                  <div className={`bg-gradient-to-br ${item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      item.color === 'purple' ? 'from-purple-500 to-purple-600' :
                        'from-green-500 to-green-600'
                    } rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                    } text-sm font-bold mb-4`}>
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Customer Success Stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                thousands worldwide
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See how OpenHire has transformed recruitment processes and career journeys
              for companies and professionals globally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                  {/* Rating */}
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-lg">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 bg-gray-200 dark:bg-gray-700"
                    />
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 text-sm">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to revolutionize{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              your hiring?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of companies and candidates who have transformed their recruitment
            experience with AI-powered precision.
          </p>

          {!user && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/get-started">
                <Button size="lg" className="text-lg px-12 py-4 bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="text-lg px-12 py-4 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-200">
                  Talk to Sales
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-12 text-blue-200 text-sm">
            ✨ No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
