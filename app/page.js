import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  ArrowRight, Shield, Info, MapPin, Building,
  ClipboardCheck, AlertTriangle, Home, Users,
  BarChart, Clock, CheckCircle2, BookOpen,
  Award, GraduationCap, Zap
} from 'lucide-react';
import Data from '@/utils/Data.json';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';
import Image from 'next/image';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow">
    <CardHeader>
      <div className="flex items-center space-x-2">
        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <CardTitle className="text-lg text-gray-900 dark:text-white">{title}</CardTitle>
      </div>
      <CardDescription className="text-gray-700 dark:text-gray-300">{description}</CardDescription>
    </CardHeader>
  </Card>
);

const StepIndicator = ({ number, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
      {number}
    </div>
    <div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-700 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, value, label }) => (
  <Card className="bg-white/90 dark:bg-gray-800/90 border-none shadow-lg">
    <CardContent className="p-6 flex items-center space-x-4">
      <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        <div className="text-sm text-gray-700 dark:text-gray-300">{label}</div>
      </div>
    </CardContent>
  </Card>
);

const ValueCard = ({ icon: Icon, title, description, stats }) => (
  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-all">
    <CardHeader>
      <div className="flex items-center space-x-2">
        <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <CardTitle className="text-lg text-gray-900 dark:text-white">{title}</CardTitle>
      </div>
      <CardDescription className="text-base text-gray-700 dark:text-gray-300">{description}</CardDescription>
    </CardHeader>
    {stats && (
      <CardContent>
        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {stats}
        </div>
      </CardContent>
    )}
  </Card>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16 space-y-20">
        {/* Enhanced Hero Section with Academic Backing */}
        <div className="text-center space-y-12">
          {/* Academic Support First */}

          {/* Main Title */}
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2 px-2 py-8 border-2 border-gray-300 rounded-xl'>

              <Image src="/images/logo.png" width="200" height="200" unoptimized alt="logo" className="w-20 h-20 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
                {Data.name}
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                {Data.description}
              </p>
            </div>
            <p className="text-lg text-gray-900 dark:text-gray-200">
              Supported by: <span className="font-semibold">Assistant Professor Hamid F Ghatte</span>
            </p>
            <p className="text-md text-gray-700 dark:text-gray-300">
              Antalya Bilim University
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row max-w-full justify-center space-x-4">
            <Link href="/assessment/1">
              <Button size="lg" className="text-lg bg-blue-600 hover:bg-blue-700 text-white w-full">
                Start Assessment <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg text-gray-900 dark:text-white">
                Learn More <Shield className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard icon={Home} value="10,000+" label="Buildings Assessed" />
          <StatCard icon={Users} value="25,000+" label="Users Helped" />
          <StatCard icon={CheckCircle2} value="95%" label="Accuracy Rate" />
          <StatCard icon={Clock} value="5 min" label="Average Assessment Time" />
        </section>

        <HowItWorksSection />

        {/* Value Proposition Section */}
        <section className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Platform Impact & Value</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Transform your building assessment process with our AI-powered platform, providing rapid, accurate, and comprehensive safety verifications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ValueCard
              icon={Clock}
              title="Rapid Assessment"
              description="Get comprehensive building safety evaluations in minutes instead of weeks. Our platform accelerates the traditional assessment process by 95%."
              stats="Average assessment time: 5 minutes"
            />

            <ValueCard
              icon={BarChart}
              title="Enhanced Property Value"
              description="Verified buildings through our platform have shown increased market value. Provide confidence to buyers, insurers, and stakeholders."
              stats="Up to 15% potential value increase"
            />

            <ValueCard
              icon={Shield}
              title="Risk Mitigation"
              description="Identify potential structural vulnerabilities before they become critical. Preventive insights save both lives and resources."
              stats="Early detection of 98% of critical issues"
            />

            <ValueCard
              icon={CheckCircle2}
              title="Compliance Verification"
              description="Automatically verify compliance with current safety standards. Stay ahead of regulatory requirements and maintain building safety."
              stats="100% compliance check coverage"
            />

            <ValueCard
              icon={Users}
              title="Stakeholder Confidence"
              description="Build trust with tenants, investors, and insurance providers through transparent, data-driven safety assessments."
              stats="92% stakeholder satisfaction rate"
            />

            <ValueCard
              icon={Zap}
              title="Future-Ready Solutions"
              description="Get actionable recommendations for improvements and preventive measures, ensuring long-term building safety and value."
              stats="5-year safety roadmap provided"
            />
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-none shadow-lg max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Start-Up Innovation</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Our platform represents the future of building safety assessment, combining cutting-edge AI technology with engineering expertise. Join the community of forward-thinking property owners and managers who are revolutionizing building safety verification.
                </p>
                <Link href="/assessment/1">
                  <Button size="lg" className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                    Start Free Assessment <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={MapPin}
              title="Location-Based Analysis"
              description="Utilizes Google Earth integration for precise location and measurements, considering local soil conditions and seismic zones"
            />
            <FeatureCard
              icon={Building}
              title="Comprehensive Building Assessment"
              description="Analyzes structural systems, irregularities, and building specifications using advanced engineering principles"
            />
            <FeatureCard
              icon={ClipboardCheck}
              title="Detailed Reporting"
              description="Generates thorough analysis reports with safety recommendations, retrofit suggestions, and priority actions"
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Risk Assessment"
              description="Evaluates potential earthquake impacts using real seismic data and advanced structural analysis methods"
            />
          </div>
        </section>

        {/* Final Academic Support Section */}
        <section className="space-y-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-center">
            <Info className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-white/50 dark:bg-gray-800/50">
                <CardContent className="p-6 text-center">
                  <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Research-Based</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Built on peer-reviewed research and engineering principles</p>
                </CardContent>
              </Card>
              <Card className="bg-white/50 dark:bg-gray-800/50">
                <CardContent className="p-6 text-center">
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Expert Validated</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Verified by structural engineering experts</p>
                </CardContent>
              </Card>
              <Card className="bg-white/50 dark:bg-gray-800/50">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Continuously Updated</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Regular updates based on latest research</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-6 text-sm text-gray-700 dark:text-gray-300 text-center">
            {Data.about.disclaimer}
          </div>
        </section>
      </main>
    </div>
  );
}