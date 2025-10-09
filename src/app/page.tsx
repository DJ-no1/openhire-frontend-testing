"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import PublicLayout from "@/components/public-layout";
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
  BarChart3,
  Cloud,
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading OpenHire...
          </p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Screening",
      description:
        "Advanced AI analyzes resumes and conducts intelligent candidate screenings",
      iconColor: "text-purple-600",
    },
    {
      icon: Target,
      title: "Smart Matching",
      description:
        "Precision algorithms connect talent with perfect opportunities",
      iconColor: "text-blue-600",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-level security with complete data protection and privacy",
      iconColor: "text-green-600",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Instant insights and data-driven recruitment optimization",
      iconColor: "text-orange-600",
    },
  ];

  const stats = [
    {
      label: "Active Jobs",
      value: "50K+",
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      label: "Successful Hires",
      value: "25K+",
      icon: Users,
      color: "text-green-600",
    },
    {
      label: "Top Companies",
      value: "2K+",
      icon: Building,
      color: "text-purple-600",
    },
    {
      label: "Success Rate",
      value: "94%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  const benefits = [
    "AI-powered candidate screening",
    "Automated interview scheduling",
    "Real-time collaboration tools",
    "Advanced analytics & reporting",
    "Enterprise-grade security",
    "24/7 customer support",
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Engineering",
      company: "TechFlow",
      content:
        "OpenHire revolutionized our hiring process. We reduced time-to-hire by 70% and quality of candidates improved dramatically.",
      rating: 5,
      avatar: "/api/placeholder/48/48",
    },
    {
      name: "Michael Rodriguez",
      role: "Senior Developer",
      company: "InnovateLabs",
      content:
        "The AI matching is incredible. Found my dream job in 2 weeks - the platform understood my skills perfectly.",
      rating: 5,
      avatar: "/api/placeholder/48/48",
    },
    {
      name: "Emily Johnson",
      role: "Talent Director",
      company: "Growth Dynamics",
      content:
        "Best recruitment platform we've used. The AI screening saves us 15+ hours per week and finds better candidates.",
      rating: 5,
      avatar: "/api/placeholder/48/48",
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section - Modern Minimal Design */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center bg-gradient-to-b from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.15] dark:opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf620_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf620_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        </div>

        {/* Floating Orbs - Subtle */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* AI Badge - Sleek */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  AI-Powered Interview Platform
                </span>
              </div>

              {/* Headline - Bold & Clean */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                Hire Smarter with{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400">
                    AI Interviews
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-blue-500/30"
                    viewBox="0 0 300 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 6C60 2 120 10 150 6C180 2 240 10 298 6"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              {/* Value Props - Clean Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold">
                  ⚡ 10x Faster Screening
                </div>
                <div className="px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold">
                  🎯 Zero Bias
                </div>
                <div className="px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-semibold">
                  📊 Real-Time Insights
                </div>
              </div>

              {/* Description - Concise */}
              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                Transform your hiring process with AI-powered interviews that
                evaluate candidates in real-time and deliver actionable
                insights.
              </p>

              {/* CTAs - Modern Gradient Buttons */}
              {user ? (
                <div className="flex items-center gap-4 pt-2">
                  <Link
                    href={
                      user.user_metadata?.role === "recruiter"
                        ? "/recruiters/dashboard"
                        : "/dashboard"
                    }
                  >
                    <Button
                      size="lg"
                      className="text-base px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold rounded-xl"
                    >
                      Open Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Welcome,{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user.user_metadata?.name || user.email?.split("@")[0]}
                    </span>
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                  <Link href="/get-started">
                    <Button
                      size="lg"
                      className="group relative text-base px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold rounded-xl overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-base px-8 py-6 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-300 font-semibold rounded-xl"
                    >
                      Watch Demo
                    </Button>
                  </Link>
                </div>
              )}

              {/* Social Proof - Enhanced with Company Logos */}
              <div className="flex flex-col gap-5 pt-6">
                {/* Stats Row - Compact Horizontal Layout */}
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Companies Count */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {/* Blue circle with icon */}
                      <div className="w-11 h-11 rounded-full bg-blue-500 border-3 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-white" />
                      </div>
                      {/* Purple circle with icon */}
                      <div className="w-11 h-11 rounded-full bg-purple-500 border-3 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      {/* Green circle with icon */}
                      <div className="w-11 h-11 rounded-full bg-green-500 border-3 border-white dark:border-gray-900 shadow-lg flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                        5,000+ Companies
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Hiring 2x faster
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="h-14 w-px bg-gray-300 dark:bg-gray-600"></div>

                  {/* Star Rating */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="ml-1 text-base font-bold text-gray-900 dark:text-white">
                        4.9
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      From 2,000+ reviews
                    </div>
                  </div>
                </div>

                {/* Trusted By Companies - Logo Strip */}
                {!user && (
                  <div className="flex flex-col gap-4 pt-3">
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 font-semibold">
                      Trusted by Leading Companies
                    </p>
                    <div className="flex items-center gap-6 flex-wrap">
                      {/* Microsoft */}
                      <div className="group flex items-center gap-2.5 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                          <svg
                            className="w-5 h-5 text-white"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Microsoft
                        </span>
                      </div>

                      {/* Google */}
                      <div className="group flex items-center gap-2.5 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 via-yellow-500 to-green-500 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            G
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Google
                        </span>
                      </div>

                      {/* Amazon */}
                      <div className="group flex items-center gap-2.5 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            a
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Amazon
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="group flex items-center gap-2.5 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-sm">
                          <span className="text-white font-bold text-lg">
                            M
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Meta
                        </span>
                      </div>

                      {/* Salesforce */}
                      <div className="group flex items-center gap-2.5 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-sm">
                          <Cloud className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Salesforce
                        </span>
                      </div>

                      {/* IBM */}
                      <div className="group flex items-center gap-2.5 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-sm">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          IBM
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Visual - Sleek Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between pb-5 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        AI Analysis
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Live Processing
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Cards */}
                <div className="space-y-4 mt-5">
                  {/* Technical Skills */}
                  <div className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Technical Skills
                      </span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        94%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: "94%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Communication */}
                  <div className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Communication
                      </span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        89%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: "89%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Problem Solving */}
                  <div className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Problem Solving
                      </span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        91%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: "91%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="mt-5 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        Strong Match
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Candidate shows excellent alignment with role
                        requirements
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    AI Powered
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
                <div
                  className={`text-4xl lg:text-5xl font-extrabold ${stat.color} mb-2`}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem-Solution Section - Addresses Hiring Pain Points */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Pain Points */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-semibold border border-red-200 dark:border-red-800">
                <Clock className="w-4 h-4" />
                The Hiring Challenge
              </div>

              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Traditional hiring is{" "}
                <span className="text-red-600 dark:text-red-400">
                  broken and expensive
                </span>
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Manual screening wastes 40% of recruiter time, biased decisions
                cost 30% of annual salary per bad hire, and lengthy processes
                lose top talent.
              </p>

              {/* Pain Point Cards */}
              <div className="space-y-4">
                {[
                  {
                    icon: Clock,
                    title: "Time-Intensive Interviews",
                    stat: "23 hours average per hire",
                    color: "red",
                  },
                  {
                    icon: TrendingUp,
                    title: "High Turnover Costs",
                    stat: "30% salary per bad hire",
                    color: "orange",
                  },
                  {
                    icon: Users,
                    title: "Unconscious Bias",
                    stat: "78% of hiring decisions affected",
                    color: "yellow",
                  },
                ].map((pain, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300 shadow-sm hover:shadow-lg"
                  >
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl ${
                        pain.color === "red"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : pain.color === "orange"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-yellow-100 dark:bg-yellow-900/30"
                      } flex items-center justify-center`}
                    >
                      <pain.icon
                        className={`w-6 h-6 ${
                          pain.color === "red"
                            ? "text-red-600 dark:text-red-400"
                            : pain.color === "orange"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {pain.title}
                      </h3>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {pain.stat}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - AI Solution */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-semibold border border-green-200 dark:border-green-800">
                <Sparkles className="w-4 h-4" />
                The AI Solution
              </div>

              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                AI transforms hiring into a{" "}
                <span className="text-green-600 dark:text-green-400">
                  competitive advantage
                </span>
              </h2>

              {/* AI Benefits Grid - Visual Comparison */}
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-green-200 dark:border-green-800">
                <div className="space-y-6">
                  {/* Comparison Chart Visual */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Traditional */}
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Traditional
                      </div>
                      <div className="text-3xl font-extrabold text-red-600 dark:text-red-400 mb-1">
                        5 days
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        per candidate
                      </div>
                    </div>

                    {/* AI-Powered */}
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-500 dark:border-green-600 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                        70% Faster
                      </div>
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        With OpenHire AI
                      </div>
                      <div className="text-3xl font-extrabold text-green-600 dark:text-green-400 mb-1">
                        1 hour
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        per candidate
                      </div>
                    </div>
                  </div>

                  {/* Benefits List */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {[
                      "Instant scoring with 94% accuracy",
                      "Zero bias with AI fairness algorithms",
                      "Scale from 10 to 10,000 candidates",
                      "Real-time insights & predictive analytics",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating ROI Badge */}
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-xl">
                  $50K+ Saved per Year
                </div>
              </div>

              {/* CTA */}
              {!user && (
                <Link href="/get-started">
                  <Button
                    size="lg"
                    className="w-full text-lg px-8 py-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl font-bold rounded-xl"
                  >
                    Start Saving Time Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - AI-Powered Capabilities */}
      <section className="py-20 lg:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold border-2 border-blue-200 dark:border-blue-800 mb-6">
              <Zap className="w-4 h-4 animate-pulse" />
              AI-Powered Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Everything you need for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                intelligent hiring
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Advanced AI technology that eliminates bias, accelerates
              screening, and delivers data-driven insights for every hiring
              decision.
            </p>
          </div>

          {/* Enhanced Feature Grid with Icons and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="h-full bg-white dark:bg-gray-800 rounded-2xl p-7 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
                  {/* Icon with Gradient Background */}
                  <div className="mb-5">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                        feature.iconColor === "text-purple-600"
                          ? "from-purple-500 to-purple-700"
                          : feature.iconColor === "text-blue-600"
                          ? "from-blue-500 to-blue-700"
                          : feature.iconColor === "text-green-600"
                          ? "from-green-500 to-green-700"
                          : "from-orange-500 to-orange-700"
                      } flex items-center justify-center shadow-lg`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  {/* Stat Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                      feature.iconColor === "text-purple-600"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : feature.iconColor === "text-blue-600"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : feature.iconColor === "text-green-600"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    {index === 0
                      ? "90% Accuracy"
                      : index === 1
                      ? "94% Match Rate"
                      : index === 2
                      ? "SOC 2 Certified"
                      : "Real-Time Data"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: "GDPR & EEOC Compliant",
                description:
                  "Built-in compliance with global hiring regulations",
                badge: "Certified",
              },
              {
                icon: Globe,
                title: "Multi-Language Support",
                description:
                  "Interview candidates in 40+ languages with AI translation",
                badge: "40+ Languages",
              },
              {
                icon: Zap,
                title: "ATS Integration",
                description:
                  "Seamlessly connects with Workday, Greenhouse, and more",
                badge: "15+ Integrations",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {item.description}
                </p>
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Trial Offer Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-bold border-2 border-green-200 dark:border-green-800 mb-6">
              <Zap className="w-4 h-4" />
              Transparent Pricing
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Choose the plan that{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                scales with you
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Start free and upgrade as you grow. No hidden fees, cancel
              anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "Forever",
                description: "Perfect for small teams testing AI hiring",
                features: [
                  "50 AI interviews/month",
                  "Basic candidate scoring",
                  "Email support",
                  "Standard integrations",
                  "7-day data retention",
                ],
                cta: "Start Free",
                popular: false,
                color: "blue",
              },
              {
                name: "Professional",
                price: "$199",
                period: "per month",
                description: "For growing teams scaling their hiring",
                features: [
                  "500 AI interviews/month",
                  "Advanced AI analytics",
                  "Priority support",
                  "All ATS integrations",
                  "90-day data retention",
                  "Custom branding",
                  "Video AI analysis",
                ],
                cta: "Try 14 Days Free",
                popular: true,
                color: "purple",
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "Contact sales",
                description: "Unlimited hiring for large organizations",
                features: [
                  "Unlimited AI interviews",
                  "Dedicated AI training",
                  "24/7 phone support",
                  "Custom integrations",
                  "Unlimited data retention",
                  "White-label solution",
                  "Compliance & audit logs",
                  "Dedicated success manager",
                ],
                cta: "Contact Sales",
                popular: false,
                color: "green",
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 ${
                  plan.popular
                    ? "border-4 border-purple-500 dark:border-purple-600 shadow-2xl transform scale-105"
                    : "border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                } hover:shadow-2xl transition-all duration-300`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ⭐ Most Popular
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span
                      className={`text-5xl font-extrabold ${
                        plan.color === "blue"
                          ? "text-blue-600 dark:text-blue-400"
                          : plan.color === "purple"
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {plan.price}
                    </span>
                    {plan.period !== "Contact sales" && (
                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                        /{plan.period}
                      </span>
                    )}
                  </div>
                  {plan.period === "Contact sales" && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                      {plan.period}
                    </p>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <CheckCircle
                        className={`flex-shrink-0 w-5 h-5 mt-0.5 ${
                          plan.color === "blue"
                            ? "text-blue-600 dark:text-blue-400"
                            : plan.color === "purple"
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {!user && (
                  <Link
                    href={
                      plan.name === "Enterprise" ? "/contact" : "/get-started"
                    }
                  >
                    <Button
                      size="lg"
                      className={`w-full text-base font-bold py-6 rounded-xl ${
                        plan.popular
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl"
                          : plan.color === "green"
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-8">
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: "Is AI interviewing EEOC and GDPR compliant?",
                  a: "Yes! OpenHire is fully compliant with EEOC, GDPR, and SOC 2 standards. Our AI is regularly audited for fairness and bias.",
                },
                {
                  q: "Can I integrate with my existing ATS?",
                  a: "Absolutely. We support seamless integration with 15+ ATS platforms including Workday, Greenhouse, Lever, and more.",
                },
                {
                  q: "What happens after my free trial?",
                  a: "You can continue on our free Starter plan or upgrade to Professional/Enterprise. No credit card required for the trial.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {faq.q}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Restructured for Roles */}
      <section className="py-20 lg:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Built for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400">
                recruiters & candidates
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Powerful tools for both sides of the hiring process.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Recruiter Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-3xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <Building className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                  For Recruiters
                </CardTitle>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  Transform your hiring with AI-powered screening and
                  intelligent matching.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "Screen 10x more candidates in less time",
                  "Eliminate unconscious bias with AI fairness",
                  "Auto-generate interview questions",
                  "Real-time candidate insights & scoring",
                  "Seamless ATS integration",
                  "Enterprise-grade security & compliance",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
                {!user && (
                  <div className="space-y-3 pt-6">
                    <Link href="/get-started" className="block">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-lg font-bold rounded-xl shadow-xl">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/auth/signin" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-blue-600 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-6 text-lg font-bold rounded-xl"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Seeker Card */}
            <Card className="group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-2 border-green-200 dark:border-green-800 overflow-hidden">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-3xl w-fit group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                  <UserCheck className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                  For Job Seekers
                </CardTitle>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  Find your dream career with personalized AI job
                  recommendations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  "AI-matched jobs based on your skills",
                  "Practice with AI interview simulations",
                  "Get instant feedback on performance",
                  "Fair evaluation with zero bias",
                  "Interview anytime, from anywhere",
                  "Track application status in real-time",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-green-600 dark:bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
                {!user && (
                  <div className="space-y-3 pt-6">
                    <Link href="/get-started" className="block">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-bold rounded-xl shadow-xl">
                        Find Jobs Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/auth/signin" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-green-600 dark:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 py-6 text-lg font-bold rounded-xl"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section - High Urgency */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold border-2 border-white/30 mb-8">
            <Sparkles className="w-4 h-4" />
            Limited Time: 14-Day Free Trial
          </div>

          <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Ready to revolutionize your hiring?
          </h2>

          <p className="text-xl lg:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join 5,000+ companies using AI to hire faster, eliminate bias, and
            build exceptional teams. No credit card required.
          </p>

          {/* CTA Buttons */}
          {!user && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
              <Link href="/get-started">
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 bg-white hover:bg-gray-100 text-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 font-bold rounded-2xl"
                >
                  Start Your Free Trial
                  <Rocket className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-12 py-8 border-3 border-white text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-bold rounded-2xl"
                >
                  Schedule Demo
                </Button>
              </Link>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Setup in 5 minutes</span>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-12 pt-12 border-t border-white/20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-3 border-white"
                  ></div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-300 fill-current"
                  />
                ))}
              </div>
            </div>
            <p className="text-white/90 text-lg font-semibold">
              "Best hiring decision we ever made" — 5,000+ companies
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section - Interactive AI Workflow */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 dark:from-slate-900 dark:via-blue-950/50 dark:to-purple-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold border-2 border-blue-200 dark:border-blue-800 mb-6">
              <Rocket className="w-4 h-4 animate-bounce" />
              How AI Works for You
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Hire in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                4 simple steps
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From candidate upload to final hire—our AI handles the complexity
              while you focus on connecting with the best talent.
            </p>
          </div>

          {/* Horizontal Workflow Stepper */}
          <div className="relative max-w-6xl mx-auto">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-900 dark:via-purple-900 dark:to-green-900 mx-16"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
                {
                  step: "1",
                  title: "Upload Candidates",
                  description:
                    "Bulk import resumes or connect your ATS—AI automatically extracts skills, experience, and qualifications.",
                  icon: Users,
                  color: "blue",
                  detail: "Supports PDF, DOCX, LinkedIn",
                  badge: "< 30 seconds",
                },
                {
                  step: "2",
                  title: "AI Generates Questions",
                  description:
                    "Smart algorithms create personalized interview questions based on job requirements and candidate background.",
                  icon: Brain,
                  color: "purple",
                  detail: "NLP + Machine Learning",
                  badge: "Instant",
                },
                {
                  step: "3",
                  title: "Conduct Interviews",
                  description:
                    "Candidates complete video or text interviews—AI evaluates responses in real-time for skills and fit.",
                  icon: Target,
                  color: "indigo",
                  detail: "Voice & Sentiment Analysis",
                  badge: "5-15 min avg",
                },
                {
                  step: "4",
                  title: "Get AI Insights",
                  description:
                    "Receive detailed scorecards with match percentages, strengths, and hiring recommendations—zero bias.",
                  icon: Award,
                  color: "green",
                  detail: "94% Accuracy Rating",
                  badge: "Real-time",
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div
                    className={`relative bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 ${
                      item.color === "blue"
                        ? "border-blue-300 dark:border-blue-700 hover:border-blue-500 dark:hover:border-blue-500"
                        : item.color === "purple"
                        ? "border-purple-300 dark:border-purple-700 hover:border-purple-500 dark:hover:border-purple-500"
                        : item.color === "indigo"
                        ? "border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 dark:hover:border-indigo-500"
                        : "border-green-300 dark:border-green-700 hover:border-green-500 dark:hover:border-green-500"
                    } shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 h-full group`}
                  >
                    {/* Step Number Badge */}
                    <div
                      className={`absolute -top-4 -left-4 w-12 h-12 rounded-xl ${
                        item.color === "blue"
                          ? "bg-gradient-to-br from-blue-500 to-blue-700"
                          : item.color === "purple"
                          ? "bg-gradient-to-br from-purple-500 to-purple-700"
                          : item.color === "indigo"
                          ? "bg-gradient-to-br from-indigo-500 to-indigo-700"
                          : "bg-gradient-to-br from-green-500 to-green-700"
                      } flex items-center justify-center text-white text-xl font-extrabold shadow-lg group-hover:scale-110 transition-transform z-10`}
                    >
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-4 pt-4">
                      <div
                        className={`w-16 h-16 rounded-2xl ${
                          item.color === "blue"
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : item.color === "purple"
                            ? "bg-purple-100 dark:bg-purple-900/30"
                            : item.color === "indigo"
                            ? "bg-indigo-100 dark:bg-indigo-900/30"
                            : "bg-green-100 dark:bg-green-900/30"
                        } flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}
                      >
                        <item.icon
                          className={`h-8 w-8 ${
                            item.color === "blue"
                              ? "text-blue-600 dark:text-blue-400"
                              : item.color === "purple"
                              ? "text-purple-600 dark:text-purple-400"
                              : item.color === "indigo"
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center space-y-3">
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed min-h-[80px]">
                        {item.description}
                      </p>

                      {/* Detail Badge */}
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                          {item.detail}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            item.color === "blue"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : item.color === "purple"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                              : item.color === "indigo"
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack Visual */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border-2 border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  Powered by Advanced AI Technology
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Natural Language Processing • Machine Learning • Predictive
                  Analytics
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6">
                {[
                  { label: "NLP Engine", icon: Brain },
                  { label: "ML Models", icon: Sparkles },
                  { label: "ATS Connect", icon: Zap },
                  { label: "Video AI", icon: Target },
                  { label: "Analytics", icon: BarChart3 },
                ].map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
                  >
                    <tech.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {tech.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Enhanced Testimonials */}
      <section className="py-20 lg:py-28 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 text-sm font-bold border-2 border-yellow-200 dark:border-yellow-800 mb-6">
              <Star className="w-4 h-4 fill-current" />
              Trusted by 5,000+ Companies
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Join industry leaders{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400">
                transforming hiring
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Real results from HR professionals and recruiters who've
              revolutionized their hiring process with AI-powered interviews.
            </p>
          </div>

          {/* Testimonial Grid with Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Sarah Chen",
                role: "VP of Engineering",
                company: "TechFlow Inc.",
                content:
                  "OpenHire revolutionized our hiring process. We reduced time-to-hire by 70% and the quality of candidates improved dramatically. The AI scoring is incredibly accurate.",
                rating: 5,
                metric: "70% Faster Hiring",
                avatar: "SC",
                color: "blue",
              },
              {
                name: "Michael Rodriguez",
                role: "Talent Acquisition Manager",
                company: "Global Dynamics",
                content:
                  "The AI interview platform eliminated unconscious bias from our process. We've seen a 40% increase in diverse hires and candidates love the experience.",
                rating: 5,
                metric: "40% More Diverse",
                avatar: "MR",
                color: "purple",
              },
              {
                name: "Emily Johnson",
                role: "HR Director",
                company: "InnovateLabs",
                content:
                  "Best recruitment platform we've used. The AI screening saves us 15+ hours per week and finds better candidates than manual reviews ever could.",
                rating: 5,
                metric: "$50K Saved Annually",
                avatar: "EJ",
                color: "green",
              },
            ].map((testimonial, index) => (
              <div key={index} className="group">
                <div className="h-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700 relative overflow-hidden">
                  {/* Decorative Quote Mark */}
                  <div className="absolute top-6 right-6 text-6xl text-gray-200 dark:text-gray-700 font-serif opacity-50">
                    "
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center mb-6 relative z-10">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-500 fill-current"
                      />
                    ))}
                    <span className="ml-2 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      5.0
                    </span>
                  </div>

                  {/* Content */}
                  <blockquote className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed font-medium relative z-10">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Metric Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 ${
                      testimonial.color === "blue"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : testimonial.color === "purple"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    } font-bold text-sm`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {testimonial.metric}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700 relative z-10">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl ${
                        testimonial.color === "blue"
                          ? "bg-gradient-to-br from-blue-500 to-blue-700"
                          : testimonial.color === "purple"
                          ? "bg-gradient-to-br from-purple-500 to-purple-700"
                          : "bg-gradient-to-br from-green-500 to-green-700"
                      } flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-base text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        {testimonial.role}
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-xs font-semibold">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Client Logos Marquee */}
          <div className="mb-12">
            <p className="text-center text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-8">
              Trusted by Industry Leaders
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 dark:opacity-40">
              {[
                "IBM",
                "Salesforce",
                "Unilever",
                "McDonald's",
                "Workday",
                "Greenhouse",
              ].map((company, index) => (
                <div
                  key={index}
                  className="text-gray-700 dark:text-gray-400 font-extrabold text-2xl hover:opacity-100 transition-opacity duration-300"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>

          {/* Case Study Teasers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "TechCorp Success Story",
                stat: "200 Engineers Hired in 6 Months",
                description: "How AI screening scaled their hiring by 5x",
                icon: Users,
              },
              {
                title: "Retail Giant Case Study",
                stat: "90% Reduction in Bias",
                description: "Building diverse teams with AI fairness",
                icon: Shield,
              },
              {
                title: "Startup Growth Story",
                stat: "$75K Saved in Year 1",
                description: "Cost-effective hiring for rapid scaling",
                icon: TrendingUp,
              },
            ].map((caseStudy, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <caseStudy.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {caseStudy.title}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
                      {caseStudy.stat}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {caseStudy.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:gap-3 transition-all">
                  Read case study
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
