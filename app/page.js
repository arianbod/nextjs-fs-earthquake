// app/page.js
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Shield,
  Building,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  GraduationCap,
  BarChart4,
  Sparkles,
  Camera,
  MapPin,
  Cloud,
  Brain,
  Eye,
  Zap,
  FileImage,
  Layers,
  ChevronRight,
  Play,
  Mic,
  MessageSquare,
  Target,
  TrendingUp,
  Users,
  Globe,
  Cpu,
  ScanLine,
  Waves,
  Mountain,
  Info,
} from 'lucide-react';
import Data from '@/utils/Data.json';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const aiFeatures = [
    {
      icon: Camera,
      title: "AI Photo Analysis",
      description: "Upload photos and our AI extracts building information automatically",
      color: "purple"
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "Real-time seismic and weather data for your exact location",
      color: "blue"
    },
    {
      icon: Brain,
      title: "Smart Assessment",
      description: "AI pre-fills forms and suggests skip options for confident predictions",
      color: "green"
    }
  ];

  const assessmentFlow = [
    {
      step: 1,
      title: "Location Detection",
      description: "Pin your building on the map",
      icon: MapPin,
      time: "30 sec",
      isNew: false
    },
    {
      step: 2,
      title: "Environmental Analysis",
      description: "View weather & seismic conditions",
      icon: Cloud,
      time: "Auto",
      isNew: true
    },
    {
      step: 3,
      title: "AI Photo Analysis",
      description: "Upload photos for instant analysis",
      icon: Sparkles,
      time: "1 min",
      isNew: true
    },
    {
      step: 4,
      title: "Review & Confirm",
      description: "Verify AI-extracted information",
      icon: CheckCircle2,
      time: "30 sec",
      isNew: true
    },
    {
      step: 5,
      title: "Get Results",
      description: "Receive safety score & certificate",
      icon: Award,
      time: "Instant",
      isNew: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* New AI-Powered Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 lg:pt-32 lg:pb-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-5xl mx-auto space-y-8">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-800">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                Now Powered by Claude AI Vision
              </span>
              <Badge variant="default" className="bg-purple-600 text-xs">NEW</Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-gray-900 dark:text-white">
                Earthquake Safety
              </span>
              <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                Reimagined with AI
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Upload photos. Get instant analysis. Receive your safety score in minutes.
              <span className="block mt-2 text-lg">No forms. No complexity. Just results.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/assessment/1">
                <Button size="lg" className="text-lg px-8 py-6 gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                  <Zap className="h-5 w-5" />
                  Start AI Assessment
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 gap-3 border-2"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="h-5 w-5" />
                Watch Demo (2 min)
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 pt-4">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                95% Accuracy
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                5 Min Assessment
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                25,000+ Users
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* New AI Features Showcase */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">AI-POWERED FEATURES</Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Experience the Future of Safety Assessment
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our Claude AI integration revolutionizes how building safety is assessed
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Feature Display */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl">
                {aiFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-500 ${
                      activeFeature === index ? 'opacity-100 transform scale-100' : 'opacity-0 absolute inset-8 transform scale-95'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30`}>
                        <feature.icon className={`h-8 w-8 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">{feature.description}</p>
                        
                        {/* Feature specific visuals */}
                        {index === 0 && (
                          <div className="mt-6 grid grid-cols-3 gap-3">
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                              <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded animate-pulse"></div>
                              <p className="text-xs mt-2 text-center">Front View</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                              <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded animate-pulse animation-delay-200"></div>
                              <p className="text-xs mt-2 text-center">Side View</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                              <div className="aspect-square bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded animate-pulse animation-delay-400"></div>
                              <p className="text-xs mt-2 text-center">Details</p>
                            </div>
                          </div>
                        )}
                        
                        {index === 1 && (
                          <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Seismic Zone: DD-1</span>
                              <Badge variant="destructive">High Risk</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Soil Type: ZC</span>
                              <Badge variant="warning">Medium</Badge>
                            </div>
                          </div>
                        )}
                        
                        {index === 2 && (
                          <div className="mt-6 space-y-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Building height detected: 5 stories</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Structure type: Reinforced concrete</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm">Construction period: 2010-2020</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature Selector */}
              <div className="flex justify-center gap-2 mt-6">
                {aiFeatures.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeFeature === index ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">90% Faster Assessment</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    AI automatically fills forms based on photo analysis and location data
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Higher Accuracy</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Combines visual analysis with environmental data for precise results
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Voice Assistant Support</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Get real-time help through every step with our AI voice guide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Assessment Flow */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">SIMPLIFIED PROCESS</Badge>
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              5 Simple Steps to Safety
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our AI-enhanced flow makes assessment incredibly simple
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Desktop Flow */}
            <div className="hidden lg:block relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800 transform -translate-y-1/2"></div>
              
              <div className="grid grid-cols-5 gap-4 relative z-10">
                {assessmentFlow.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer group">
                      <div className="relative">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <step.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        {step.isNew && (
                          <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-xs">
                            AI
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
                      <Badge variant="outline" className="text-xs">{step.time}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Flow */}
            <div className="lg:hidden space-y-4">
              {assessmentFlow.map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                      <step.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                      {step.isNew && <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-xs">AI</Badge>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{step.description}</p>
                    <Badge variant="outline" className="text-xs">{step.time}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Assessment CTA */}
          <div className="text-center mt-12">
            <Link href="/assessment/1">
              <Button size="lg" className="text-base gap-2 px-8">
                Begin Your Assessment <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 mb-4 group-hover:scale-110 transition-transform">
                <Building className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">10K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Buildings Assessed</div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 mb-4 group-hover:scale-110 transition-transform">
                <Target className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">95%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">AI</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Powered Analysis</div>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-10 w-10 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">25K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Assistant Feature */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800/30 dark:to-blue-800/30 mb-6">
              <Mic className="h-10 w-10 text-purple-600 dark:text-purple-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              AI Voice Assistant Included
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Get real-time guidance through every step. Just ask questions and receive instant help.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6">
                <CardContent className="space-y-3">
                  <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto" />
                  <h3 className="font-semibold">Natural Conversation</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ask questions in plain language
                  </p>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardContent className="space-y-3">
                  <Globe className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto" />
                  <h3 className="font-semibold">Multi-Language</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Support for multiple languages
                  </p>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardContent className="space-y-3">
                  <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto" />
                  <h3 className="font-semibold">Instant Responses</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get help without interrupting flow
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Ready to Experience AI-Powered Safety Assessment?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands who've already secured their buildings with our advanced AI technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment/1">
                <Button size="lg" variant="secondary" className="text-base gap-2 px-8">
                  <Sparkles className="h-5 w-5" />
                  Start Free AI Assessment
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="text-base gap-2 px-8 bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <Info className="h-5 w-5" />
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-200 mt-8">
              No credit card required • 5-minute assessment • Instant results
            </p>
          </div>
        </div>
      </section>

      {/* Academic Support */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Academic Support & Validation
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Assistant Professor Hamid F Ghatte
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Antalya Bilim University • Structural Engineering Department
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .bg-grid-white\/10 {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}