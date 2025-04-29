// app/page.js
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
  BarChart4
} from 'lucide-react';
import Data from '@/utils/Data.json';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 lg:pt-32 lg:pb-28">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
                <Shield className="h-4 w-4" />
                <span>Earthquake Safety Assessment</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="block text-gray-900 dark:text-white">Make Your Building</span>
                <span className="block text-blue-600 dark:text-blue-400">Earthquake Ready</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0">
                {Data.description} Protect what matters most with data-driven insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/assessment/1">
                  <Button size="lg" className="text-base gap-2 w-full sm:w-auto">
                    Start Assessment <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="text-base gap-2 w-full sm:w-auto">
                    Learn More <Shield className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supported by: <span className="font-semibold">Assistant Professor Hamid F Ghatte</span>, Antalya Bilim University
              </p>
            </div>

            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-2 border border-gray-200 dark:border-gray-700 transform rotate-1">
                <Image
                  src="/images/building-earthquake-analysis.jpg"
                  width={600}
                  height={400}
                  alt="Building Analysis"
                  className="rounded-xl"
                  priority
                />
                <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-lg">
                  <p className="font-bold">Quick & Professional Analysis</p>
                  <p className="text-sm text-blue-100">5-minute assessment, lifetime peace of mind</p>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md max-h-64 bg-blue-400 dark:bg-blue-600 rounded-full opacity-20 blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 mb-4">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">10,000+</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Buildings Assessed</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">95%</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy Rate</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3 mb-4">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">5 min</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Assessment Time</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 p-3 mb-4">
                <BarChart4 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">25,000+</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Users Helped</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Key Features</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive assessment tool provides detailed insights into your building's earthquake readiness
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-gray-700">
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 inline-flex mb-4">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Building Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive structural system assessment analyzing multiple building characteristics
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-gray-700">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3 inline-flex mb-4">
                <ClipboardCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Detailed Reports</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate comprehensive reports with safety recommendations and retrofit suggestions
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 dark:border-gray-700">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3 inline-flex mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Risk Assessment</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Evaluate potential earthquake impacts using real seismic data and structural analysis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-900">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-white">Ready to Assess Your Building?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Get a detailed earthquake safety assessment in just 5 minutes
            </p>
            <Link href="/assessment/1">
              <Button variant="secondary" size="lg" className="text-base gap-2">
                Start Free Assessment <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Academic Support Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <GraduationCap className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto md:mx-0 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Research-Based</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built on peer-reviewed research and engineering principles
              </p>
            </div>

            <div className="text-center">
              <Award className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Expert Validated</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Verified by structural engineering experts
              </p>
            </div>

            <div className="text-center md:text-right">
              <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto md:ml-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Continuously Updated</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Regular updates based on latest research findings
              </p>
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>{Data.about.disclaimer}</p>
          </div>
        </div>
      </section>
    </div>
  );
}